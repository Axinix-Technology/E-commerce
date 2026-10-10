# pyfly: ignore
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from core.registry.service_registry import BaseService, ServiceRegistry
from catalogue.models import ProductType, ProductVariant, VendorMaster
from inward.models import PurchaseInward, InwardItem, TaggedInventoryUnit
from inventory.models import InventoryStock, StockMovementLedger


class PurchaseInwardService(BaseService):
    """
    Domain service for Purchase Inwarding (GRN).
    Enforces atomic lot creation, tagged unit barcode stickers, 
    live inventory increment, and double-entry ledger recording at SKU variant level.
    """

    def before_create(self, context, data: dict) -> dict:
        vendor_id = data.get("vendor_id")
        if not vendor_id:
            raise ValidationError("Vendor is required for purchase inwarding.")

        try:
            vendor = VendorMaster.objects.get(id=vendor_id, status=1)
        except VendorMaster.DoesNotExist:
            raise ValidationError("Selected Vendor does not exist or is inactive.")

        invoice_number = str(data.get("invoice_number", "")).strip()
        if not invoice_number:
            raise ValidationError("Supplier invoice / bill number is required.")

        # Check for duplicate vendor invoice submission
        if PurchaseInward.objects.filter(vendor=vendor, invoice_number__iexact=invoice_number, status=1).exists():
            raise ValidationError(
                f"An active purchase inward already exists for vendor '{vendor.name}' with invoice #{invoice_number}."
            )

        today_str = timezone.now().strftime("%Y%m%d")
        last_inw = (
            PurchaseInward.objects
            .filter(inward_number__startswith=f"INW-{today_str}")
            .order_by("-inward_number")
            .first()
        )
        if last_inw and last_inw.inward_number:
            try:
                last_seq = int(last_inw.inward_number.split("-")[-1])
                next_seq = last_seq + 1
            except (ValueError, IndexError):
                next_seq = 1
        else:
            next_seq = 1

        data["inward_number"] = f"INW-{today_str}-{next_seq:04d}"
        data["inward_status"] = "received"
        data["inward_date"] = timezone.now().date().isoformat()
        data["received_by"] = context.user if context.user and context.user.is_authenticated else None

        items = data.get("items", [])
        if not items:
            raise ValidationError("Inward shipment must include at least one product item.")

        total_taxable = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_grand = Decimal("0.00")

        # Pre-validate items (supporting variant_id as primary SKU, falling back to product_id)
        for idx, item in enumerate(items, start=1):
            variant_id = item.get("variant_id")
            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 0))
            unit_cost = Decimal(str(item.get("unit_cost", "0.00")))
            tax_rate = Decimal(str(item.get("tax_rate", "0.00")))

            if quantity <= 0:
                raise ValidationError(f"Item #{idx}: Quantity must be greater than zero.")
            if quantity > 5000:
                raise ValidationError(f"Item #{idx}: Quantity ({quantity}) exceeds maximum unit-tagging limit of 5,000 per line.")
            if unit_cost < 0:
                raise ValidationError(f"Item #{idx}: Unit cost cannot be negative.")

            if variant_id:
                try:
                    variant = ProductVariant.objects.select_related("product").get(id=variant_id, status=1)
                    item["product_id"] = variant.product_id
                except ProductVariant.DoesNotExist:
                    raise ValidationError(f"Item #{idx}: Product Variant ID {variant_id} is invalid or inactive.")
            elif product_id:
                if not ProductType.objects.filter(id=product_id, status=1).exists():
                    raise ValidationError(f"Item #{idx}: Product ID {product_id} is invalid or inactive.")
            else:
                raise ValidationError(f"Item #{idx}: Either variant_id or product_id must be provided.")

            line_taxable = unit_cost * quantity
            line_tax = (line_taxable * tax_rate) / Decimal("100.00")
            line_total = line_taxable + line_tax

            total_taxable += line_taxable
            total_tax += line_tax
            total_grand += line_total

        data["total_taxable_amount"] = total_taxable
        data["total_tax_amount"] = total_tax
        data["total_amount"] = total_grand

        # Stash items in context for after_create
        context.metadata["inward_items_raw"] = items
        return data

    def after_create(self, context, instance: PurchaseInward) -> PurchaseInward:
        items = context.metadata.get("inward_items_raw", [])
        today_str = timezone.now().strftime("%Y%m%d")

        # Deadlock prevention: Lock stock rows in deterministic sorted order
        unique_product_ids = sorted(list({int(item["product_id"]) for item in items}))
        stock_map = {}
        for pid in unique_product_ids:
            stock, _ = InventoryStock.objects.select_for_update().get_or_create(
                product_id=pid,
                defaults={"status": 1, "reorder_level": 10}
            )
            stock_map[pid] = stock

        tagged_units_to_create = []

        for idx, item_data in enumerate(items, start=1):
            variant_id = item_data.get("variant_id")
            variant = None
            if variant_id:
                variant = ProductVariant.objects.select_related("product").filter(id=variant_id).first()

            if variant:
                product = variant.product
            else:
                product = ProductType.objects.get(id=item_data["product_id"])

            quantity = int(item_data["quantity"])
            unit_cost = Decimal(str(item_data["unit_cost"]))
            tax_rate = Decimal(str(item_data.get("tax_rate", "0.00")))
            line_taxable = unit_cost * quantity
            line_tax = (line_taxable * tax_rate) / Decimal("100.00")
            line_total = line_taxable + line_tax

            lot_number = f"LOT-{today_str}-{instance.id:04d}-{idx:02d}"

            inward_item = InwardItem.objects.create(
                inward=instance,
                variant=variant,
                product=product,
                quantity=quantity,
                unit_cost=unit_cost,
                tax_rate=tax_rate,
                tax_amount=line_tax,
                total_cost=line_total,
                lot_number=lot_number,
                status=1,
            )

            # Barcodes incorporate SKU when variant is present
            sku_prefix = variant.sku if variant and variant.sku else f"{product.id:06d}"
            for p in range(1, quantity + 1):
                tagged_units_to_create.append(
                    TaggedInventoryUnit(
                        inward_item=inward_item,
                        variant=variant,
                        product=product,
                        item_barcode=f"{sku_prefix}-{today_str}-{p:04d}",
                        lot_number=lot_number,
                        current_bucket="sellable",
                        unit_cost=unit_cost,
                        is_sold=False,
                        status=1,
                    )
                )

            # Update live stock counters
            stock = stock_map[product.id]
            stock.quantity_on_hand += quantity
            stock.sellable_stock += quantity

            # Record immutable double-entry movement ledger record
            variant_label = f"[{variant.sku}] " if variant else ""
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
                reference_id=instance.inward_number,
                notes=f"Inward from {instance.vendor.name} (Bill #{instance.invoice_number}) {variant_label}",
                status=1,
                created_by=instance.received_by,
            )

        # Batch insert tagged barcode units
        if tagged_units_to_create:
            TaggedInventoryUnit.objects.bulk_create(tagged_units_to_create, batch_size=500)

        # Save all updated stocks
        for stock in stock_map.values():
            stock.save(update_fields=["quantity_on_hand", "sellable_stock", "updated_at"])

        return instance

    def before_delete(self, context, instance: PurchaseInward) -> None:
        """
        Reversal Path:
        Soft-deleting or cancelling a PurchaseInward reverses live stock,
        deactivates tagged units, and writes a reversal ledger entry.
        """
        inward_items = instance.items.filter(status=1)
        if not inward_items.exists():
            return

        # Sort product IDs to prevent deadlocks
        product_ids = sorted(list({item.product_id for item in inward_items}))
        stocks = {
            pid: InventoryStock.objects.select_for_update().get(product_id=pid)
            for pid in product_ids
        }

        # Check sufficiency before deducting
        for item in inward_items:
            stock = stocks[item.product_id]
            if stock.sellable_stock < item.quantity:
                raise ValidationError(
                    f"Cannot cancel inward #{instance.inward_number}: {item.quantity} units of '{item.product.name}' were received, but only {stock.sellable_stock} sellable units remain."
                )

        today_str = timezone.now().strftime("%Y%m%d")
        for item in inward_items:
            stock = stocks[item.product_id]
            stock.sellable_stock -= item.quantity
            stock.quantity_on_hand -= item.quantity
            stock.save(update_fields=["sellable_stock", "quantity_on_hand", "updated_at"])

            # Deactivate tagged units
            item.tagged_units.filter(status=1).update(status=0)
            item.status = 0
            item.save(update_fields=["status"])

            # Create reversal ledger entry
            StockMovementLedger.objects.create(
                product=item.product,
                movement_type="vendor_return",
                from_bucket="sellable",
                to_bucket="vendor",
                inward_qty=0,
                outward_qty=item.quantity,
                lot_number=item.lot_number,
                unit_cost=item.unit_cost,
                reference_type="GRN_REVERSAL",
                reference_id=f"REV-{instance.inward_number}",
                notes=f"Reversal of GRN #{instance.inward_number} upon deletion",
                status=1,
                created_by=context.user if context.user and context.user.is_authenticated else None,
            )


# Register with Populate Engine Service Registry
ServiceRegistry.register("purchase_inward", PurchaseInwardService)
