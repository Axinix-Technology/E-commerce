from typing import Any, Optional
from datetime import datetime
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Q, F
from django.core.exceptions import ValidationError
from django.utils import timezone

from catalogue.models import ProductType, VendorMaster
from inward.models import PurchaseInward, InwardItem, TaggedInventoryUnit
from inventory.models import InventoryStock, StockMovementLedger


class InventoryPolicyException(ValidationError):
    """Raised when an inventory outward or inward policy constraint is violated."""
    pass


class InventoryService:
    """
    Centralized Domain Service enforcing Inventory Integrity, 
    Outward Policies, and Dynamic Stock In/Out Aggregation.
    """

    @classmethod
    @transaction.atomic
    def process_purchase_inward(
        cls,
        vendor_id: int,
        invoice_number: str,
        invoice_date: str,
        items: list[dict],
        received_by=None,
        remarks: str = ""
    ) -> PurchaseInward:
        """
        Policy: Purchase Inwarding
        1. Validates vendor exists and is active.
        2. Creates PurchaseInward header with unique GRN number.
        3. Generates unique Lot Number (LOT-YYYYMMDD-XXXX).
        4. For each line item:
           - Validates product and calculates tax/total.
           - Generates unique TaggedInventoryUnit barcodes (ITM-LOT...-XXX).
           - Updates/Creates InventoryStock (increments quantity_on_hand and sellable_stock).
           - Writes immutable double-entry record to StockMovementLedger.
        """
        try:
            vendor = VendorMaster.objects.get(id=vendor_id, status=1)
        except VendorMaster.DoesNotExist:
            raise InventoryPolicyException("Selected Vendor does not exist or is inactive.")

        if not items:
            raise InventoryPolicyException("Inward receipt must contain at least one line item.")

        today_str = timezone.now().strftime("%Y%m%d")
        inward_count = PurchaseInward.objects.filter(inward_number__startswith=f"INW-{today_str}").count() + 1
        inward_number = f"INW-{today_str}-{inward_count:04d}"

        total_taxable = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_grand = Decimal("0.00")

        # 1. Create Inward Header
        inward = PurchaseInward.objects.create(
            inward_number=inward_number,
            vendor=vendor,
            invoice_number=invoice_number.strip(),
            invoice_date=invoice_date,
            inward_status="received",
            remarks=remarks.strip() if remarks else None,
            received_by=received_by,
            total_taxable_amount=0,
            total_tax_amount=0,
            total_amount=0,
            status=1,
        )

        # 2. Process Items
        for idx, item_data in enumerate(items, start=1):
            product_id = item_data.get("product_id")
            quantity = int(item_data.get("quantity", 0))
            unit_cost = Decimal(str(item_data.get("unit_cost", "0.00")))
            tax_rate = Decimal(str(item_data.get("tax_rate", "0.00")))

            if quantity <= 0:
                raise InventoryPolicyException(f"Line item {idx}: Inward quantity must be greater than zero.")
            if unit_cost < 0:
                raise InventoryPolicyException(f"Line item {idx}: Unit cost cannot be negative.")

            try:
                product = ProductType.objects.get(id=product_id, status=1)
            except ProductType.DoesNotExist:
                raise InventoryPolicyException(f"Line item {idx}: Product ID {product_id} is invalid or inactive.")

            line_taxable = unit_cost * quantity
            line_tax = (line_taxable * tax_rate) / Decimal("100.00")
            line_total = line_taxable + line_tax

            total_taxable += line_taxable
            total_tax += line_tax
            total_grand += line_total

            lot_number = f"LOT-{today_str}-{inward.id:04d}-{idx:02d}"

            inward_item = InwardItem.objects.create(
                inward=inward,
                product=product,
                quantity=quantity,
                unit_cost=unit_cost,
                tax_rate=tax_rate,
                tax_amount=line_tax,
                total_cost=line_total,
                lot_number=lot_number,
                status=1,
            )

            # Generate individual tagged units with physical barcodes
            tagged_units = []
            for piece_num in range(1, quantity + 1):
                item_barcode = f"ITM-{today_str}-{product.id:04d}-{inward.id:03d}-{piece_num:03d}"
                tagged_units.append(
                    TaggedInventoryUnit(
                        inward_item=inward_item,
                        product=product,
                        item_barcode=item_barcode,
                        lot_number=lot_number,
                        current_bucket="sellable",
                        unit_cost=unit_cost,
                        is_sold=False,
                        status=1,
                    )
                )
            TaggedInventoryUnit.objects.bulk_create(tagged_units)

            # 3. Update InventoryStock atomically
            stock, _ = InventoryStock.objects.select_for_update().get_or_create(
                product=product,
                defaults={"status": 1, "reorder_level": 10}
            )
            stock.quantity_on_hand += quantity
            stock.sellable_stock += quantity
            stock.save(update_fields=["quantity_on_hand", "sellable_stock", "updated_at"])

            # 4. Write immutable record to StockMovementLedger
            StockMovementLedger.objects.create(
                product=product,
                movement_type="purchase_inward",
                from_bucket="vendor",
                to_bucket="sellable",
                inward_qty=quantity,
                outward_qty=0,
                lot_number=lot_number,
                unit_cost=unit_cost,
                reference_type="GRN",
                reference_id=inward_number,
                notes=f"Inward from {vendor.name} via Bill #{invoice_number}",
                status=1,
                created_by=received_by,
            )

        # Update totals on header
        inward.total_taxable_amount = total_taxable
        inward.total_tax_amount = total_tax
        inward.total_amount = total_grand
        inward.save(update_fields=["total_taxable_amount", "total_tax_amount", "total_amount"])

        return inward

    @classmethod
    @transaction.atomic
    def process_stock_outward(
        cls,
        movement_type: str,
        product_id: int,
        quantity: int,
        reference_type: str,
        reference_id: str,
        notes: str = "",
        user=None
    ) -> StockMovementLedger:
        """
        Enforces Outward Policies:
        1. Policy: Availability check (No negative stock).
        2. Policy: Bucket transitions:
           - 'pos_sale' / 'marketplace_sale': sellable -> sold (QOH & sellable decremented)
           - 'approval_outward': sellable -> approval (sellable decremented, approval incremented, QOH intact)
           - 'approval_return': approval -> sellable (approval decremented, sellable incremented, QOH intact)
           - 'repair_outward': sellable -> repair (sellable decremented, repair incremented, QOH intact)
           - 'repair_return': repair -> sellable (repair decremented, sellable incremented, QOH intact)
           - 'return_quarantine': customer -> quarantine (QOH & quarantine incremented)
           - 'qc_restock': quarantine -> sellable (quarantine decremented, sellable incremented)
           - 'scrap_writeoff': repair/quarantine -> damaged (QOH & source decremented, damaged incremented)
        3. Writes immutable entry to StockMovementLedger.
        """
        if quantity <= 0:
            raise InventoryPolicyException("Outward quantity must be greater than zero.")

        try:
            product = ProductType.objects.get(id=product_id, status=1)
        except ProductType.DoesNotExist:
            raise InventoryPolicyException(f"Product ID {product_id} does not exist or is inactive.")

        stock, _ = InventoryStock.objects.select_for_update().get_or_create(
            product=product,
            defaults={"status": 1, "reorder_level": 10}
        )

        from_bucket = ""
        to_bucket = ""
        inward_qty = 0
        outward_qty = 0

        if movement_type in ("pos_sale", "marketplace_sale"):
            # Policy: Must have enough sellable stock
            if stock.sellable_stock < quantity:
                raise InventoryPolicyException(
                    f"Insufficient stock for '{product.name}'. Available: {stock.sellable_stock}, Requested: {quantity}."
                )
            stock.sellable_stock -= quantity
            stock.quantity_on_hand -= quantity
            from_bucket = "sellable"
            to_bucket = "sold"
            outward_qty = quantity

        elif movement_type == "approval_outward":
            # Policy: Photoshoot / PR memo out
            if stock.sellable_stock < quantity:
                raise InventoryPolicyException(
                    f"Insufficient sellable stock for approval memo. Available: {stock.sellable_stock}, Requested: {quantity}."
                )
            stock.sellable_stock -= quantity
            stock.approval_stock += quantity
            from_bucket = "sellable"
            to_bucket = "approval"
            outward_qty = quantity

        elif movement_type == "approval_return":
            # Policy: Return from photoshoot / PR memo
            if stock.approval_stock < quantity:
                raise InventoryPolicyException(
                    f"Return quantity ({quantity}) exceeds stock currently on approval ({stock.approval_stock})."
                )
            stock.approval_stock -= quantity
            stock.sellable_stock += quantity
            from_bucket = "approval"
            to_bucket = "sellable"
            inward_qty = quantity

        elif movement_type == "repair_outward":
            # Policy: Alteration / workshop hold
            if stock.sellable_stock < quantity:
                raise InventoryPolicyException(
                    f"Insufficient stock for repair transfer. Available: {stock.sellable_stock}, Requested: {quantity}."
                )
            stock.sellable_stock -= quantity
            stock.repair_stock += quantity
            from_bucket = "sellable"
            to_bucket = "repair"
            outward_qty = quantity

        elif movement_type == "repair_return":
            # Policy: Return from workshop
            if stock.repair_stock < quantity:
                raise InventoryPolicyException(
                    f"Return quantity ({quantity}) exceeds stock currently in repair ({stock.repair_stock})."
                )
            stock.repair_stock -= quantity
            stock.sellable_stock += quantity
            from_bucket = "repair"
            to_bucket = "sellable"
            inward_qty = quantity

        elif movement_type == "return_quarantine":
            # Policy: Customer return arrived, placed into QC hold
            stock.quarantine_stock += quantity
            stock.quantity_on_hand += quantity
            from_bucket = "customer"
            to_bucket = "quarantine"
            inward_qty = quantity

        elif movement_type == "qc_restock":
            # Policy: Passed inspection, restocked for sale
            if stock.quarantine_stock < quantity:
                raise InventoryPolicyException(
                    f"Restock quantity ({quantity}) exceeds quarantine stock ({stock.quarantine_stock})."
                )
            stock.quarantine_stock -= quantity
            stock.sellable_stock += quantity
            from_bucket = "quarantine"
            to_bucket = "sellable"
            inward_qty = quantity

        elif movement_type == "scrap_writeoff":
            # Policy: Damaged write-off
            if stock.quarantine_stock >= quantity:
                stock.quarantine_stock -= quantity
                from_bucket = "quarantine"
            elif stock.repair_stock >= quantity:
                stock.repair_stock -= quantity
                from_bucket = "repair"
            elif stock.sellable_stock >= quantity:
                stock.sellable_stock -= quantity
                from_bucket = "sellable"
            else:
                raise InventoryPolicyException(f"Insufficient stock to write-off {quantity} units.")
            stock.quantity_on_hand -= quantity
            stock.damaged_stock += quantity
            to_bucket = "damaged"
            outward_qty = quantity

        else:
            raise InventoryPolicyException(f"Unknown movement type '{movement_type}'.")

        stock.save()

        # Write immutable record to StockMovementLedger
        ledger_entry = StockMovementLedger.objects.create(
            product=product,
            movement_type=movement_type,
            from_bucket=from_bucket,
            to_bucket=to_bucket,
            inward_qty=inward_qty,
            outward_qty=outward_qty,
            unit_cost=product.selling_price or 0.00,
            reference_type=reference_type,
            reference_id=reference_id,
            notes=notes.strip() if notes else None,
            status=1,
            created_by=user,
        )

        return ledger_entry

    @classmethod
    def get_stock_ledger_report(
        cls,
        start_date: str,
        end_date: str,
        category_id: Optional[int] = None,
        product_id: Optional[int] = None
    ) -> dict[str, Any]:
        """
        Computes the 4-Pillar Dynamic Stock Ledger Report:
        - Opening = Sum(Inward - Outward) strictly before start_date
        - Inward  = Sum(Inward) between start_date and end_date
        - Outward = Sum(Outward) between start_date and end_date
        - Closing = Opening + Inward - Outward
        Plus live bucket distribution (Sellable, Approval, Quarantine, Repair).
        """
        # Parse dates
        try:
            start_dt = datetime.strptime(f"{start_date} 00:00:00", "%Y-%m-%d %H:%M:%S")
            end_dt = datetime.strptime(f"{end_date} 23:59:59", "%Y-%m-%d %H:%M:%S")
        except ValueError:
            raise InventoryPolicyException("Invalid date format. Expected YYYY-MM-DD.")

        if start_dt > end_dt:
            raise InventoryPolicyException("Start date cannot be after End date.")

        # Product queryset filter
        products_qs = ProductType.objects.filter(status=1).select_related("category")
        if category_id:
            products_qs = products_qs.filter(category_id=category_id)
        if product_id:
            products_qs = products_qs.filter(id=product_id)

        report_rows = []
        total_opening = 0
        total_inward = 0
        total_outward = 0
        total_closing = 0
        total_valuation = Decimal("0.00")

        # Fetch current stock states in memory
        stock_map = {
            s.product_id: s for s in InventoryStock.objects.filter(product__in=products_qs)
        }

        for prod in products_qs:
            # 1. Opening Balance: strictly before start_date
            prior_movements = StockMovementLedger.objects.filter(
                product=prod,
                created_at__lt=start_dt,
                status=1
            ).aggregate(
                prior_inward=Sum("inward_qty"),
                prior_outward=Sum("outward_qty")
            )
            prior_in = prior_movements["prior_inward"] or 0
            prior_out = prior_movements["prior_outward"] or 0
            opening = max(0, prior_in - prior_out)

            # 2. Period Inward & Outward: [start_dt, end_dt]
            period_movements = StockMovementLedger.objects.filter(
                product=prod,
                created_at__gte=start_dt,
                created_at__lte=end_dt,
                status=1
            ).aggregate(
                period_in=Sum("inward_qty"),
                period_out=Sum("outward_qty")
            )
            inward = period_movements["period_in"] or 0
            outward = period_movements["period_out"] or 0
            closing = opening + inward - outward

            # Current bucket states
            current_stock = stock_map.get(prod.id)
            sellable = current_stock.sellable_stock if current_stock else 0
            approval = current_stock.approval_stock if current_stock else 0
            quarantine = current_stock.quarantine_stock if current_stock else 0
            repair = current_stock.repair_stock if current_stock else 0
            qoh = current_stock.quantity_on_hand if current_stock else 0

            unit_price = prod.selling_price or Decimal("0.00")
            row_valuation = Decimal(str(closing)) * unit_price

            total_opening += opening
            total_inward += inward
            total_outward += outward
            total_closing += closing
            total_valuation += row_valuation

            report_rows.append({
                "product_id": prod.id,
                "product_name": prod.name,
                "slug": prod.slug,
                "category_id": prod.category.id if prod.category else None,
                "category_name": prod.category.name if prod.category else "Uncategorized",
                "brand": prod.brand or "",
                "opening": opening,
                "inward": inward,
                "outward": outward,
                "closing": closing,
                "sellable": sellable,
                "approval": approval,
                "quarantine": quarantine,
                "repair": repair,
                "qoh": qoh,
                "unit_price": float(unit_price),
                "valuation": float(row_valuation),
            })

        return {
            "metadata": {
                "start_date": start_date,
                "end_date": end_date,
                "category_id": category_id,
                "product_id": product_id,
                "generated_at": timezone.now().isoformat(),
            },
            "summary": {
                "total_products": len(report_rows),
                "total_opening": total_opening,
                "total_inward": total_inward,
                "total_outward": total_outward,
                "total_closing": total_closing,
                "total_valuation": float(total_valuation),
            },
            "data": report_rows,
        }
