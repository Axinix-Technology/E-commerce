from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from core.registry.service_registry import BaseService, ServiceRegistry
from catalogue.models import ProductType, VendorMaster
from inward.models import PurchaseInward, InwardItem, TaggedInventoryUnit
from inventory.models import InventoryStock, StockMovementLedger


class PurchaseInwardService(BaseService):
    """
    Domain service for Purchase Inwarding (GRN).
    Enforces atomic lot creation, tagged unit barcode stickers, 
    live inventory increment, and double-entry ledger recording.
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

        today_str = timezone.now().strftime("%Y%m%d")
        inward_count = PurchaseInward.objects.filter(inward_number__startswith=f"INW-{today_str}").count() + 1
        data["inward_number"] = f"INW-{today_str}-{inward_count:04d}"
        data["inward_status"] = "received"
        data["inward_date"] = timezone.now().date().isoformat()
        data["received_by"] = context.user if context.user and context.user.is_authenticated else None

        items = data.get("items", [])
        if not items:
            raise ValidationError("Inward shipment must include at least one product item.")

        total_taxable = Decimal("0.00")
        total_tax = Decimal("0.00")
        total_grand = Decimal("0.00")

        # Pre-validate items
        for idx, item in enumerate(items, start=1):
            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 0))
            unit_cost = Decimal(str(item.get("unit_cost", "0.00")))
            tax_rate = Decimal(str(item.get("tax_rate", "0.00")))

            if quantity <= 0:
                raise ValidationError(f"Item #{idx}: Quantity must be greater than zero.")
            if unit_cost < 0:
                raise ValidationError(f"Item #{idx}: Unit cost cannot be negative.")
            if not ProductType.objects.filter(id=product_id, status=1).exists():
                raise ValidationError(f"Item #{idx}: Product ID {product_id} is invalid or inactive.")

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

        with transaction.atomic():
            for idx, item_data in enumerate(items, start=1):
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
                    product=product,
                    quantity=quantity,
                    unit_cost=unit_cost,
                    tax_rate=tax_rate,
                    tax_amount=line_tax,
                    total_cost=line_total,
                    lot_number=lot_number,
                    status=1,
                )

                # Physical item barcode stickers
                tagged_units = [
                    TaggedInventoryUnit(
                        inward_item=inward_item,
                        product=product,
                        item_barcode=f"ITM-{today_str}-{product.id:04d}-{instance.id:03d}-{p:03d}",
                        lot_number=lot_number,
                        current_bucket="sellable",
                        unit_cost=unit_cost,
                        is_sold=False,
                        status=1,
                    )
                    for p in range(1, quantity + 1)
                ]
                TaggedInventoryUnit.objects.bulk_create(tagged_units)

                # Update live stock level
                stock, _ = InventoryStock.objects.select_for_update().get_or_create(
                    product=product,
                    defaults={"status": 1, "reorder_level": 10}
                )
                stock.quantity_on_hand += quantity
                stock.sellable_stock += quantity
                stock.save(update_fields=["quantity_on_hand", "sellable_stock", "updated_at"])

                # Immutable double-entry movement ledger record
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
                    notes=f"Inward from {instance.vendor.name} (Bill #{instance.invoice_number})",
                    status=1,
                    created_by=instance.received_by,
                )

        return instance


# Register with Populate Engine Service Registry
ServiceRegistry.register("purchase_inward", PurchaseInwardService)
