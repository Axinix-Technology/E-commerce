from datetime import datetime
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from core.registry.service_registry import BaseService, ServiceRegistry
from catalogue.models import ProductType
from inventory.models import InventoryStock, StockMovementLedger, StockIssueType


class StockLedgerService(BaseService):
    """
    Domain service for StockMovementLedger.
    Enforces Outward Policies on create and computes the 4-Pillar 
    Dynamic Stock In/Out Report (Opening -> Inward -> Outward -> Closing).
    """

    def before_create(self, context, data: dict) -> dict:
        """
        Enforce Outward Policies:
        1. Check availability in source bucket (prevent negative stock).
        2. Set from_bucket, to_bucket, inward_qty, outward_qty.
        3. Check StockIssueType (deduct_from_available_stock).
        4. Atomically update InventoryStock counters.
        """
        movement_type = data.get("movement_type")
        product_id = data.get("product_id")
        quantity = int(data.get("quantity") or data.get("outward_qty") or data.get("inward_qty") or 0)

        if not movement_type:
            raise ValidationError("Movement type is required.")
        if not product_id or quantity <= 0:
            raise ValidationError("Valid product ID and positive quantity are required.")

        try:
            product = ProductType.objects.get(id=product_id, status=1)
        except ProductType.DoesNotExist:
            raise ValidationError(f"Product ID {product_id} does not exist or is inactive.")

        with transaction.atomic():
            stock, _ = InventoryStock.objects.select_for_update().get_or_create(
                product=product,
                defaults={"status": 1, "reorder_level": 10}
            )

            from_bucket = ""
            to_bucket = ""
            inward_qty = 0
            outward_qty = 0

            # Resolve optional StockIssueType
            issue_type = None
            issue_type_id = data.get("issue_type_id") or data.get("issue_type")
            if issue_type_id:
                try:
                    if isinstance(issue_type_id, int) or str(issue_type_id).isdigit():
                        issue_type = StockIssueType.objects.get(id=int(issue_type_id), status=1)
                    else:
                        issue_type = StockIssueType.objects.get(code=str(issue_type_id).upper(), status=1)
                except StockIssueType.DoesNotExist:
                    pass

            deduct_available = issue_type.deduct_from_available_stock if issue_type else True

            # Policy checks by movement type
            if movement_type in ("pos_sale", "marketplace_sale"):
                if stock.sellable_stock < quantity:
                    raise ValidationError(
                        f"Insufficient stock for '{product.name}'. Available: {stock.sellable_stock}, Requested: {quantity}."
                    )
                stock.sellable_stock -= quantity
                stock.quantity_on_hand -= quantity
                from_bucket = "sellable"
                to_bucket = "sold"
                outward_qty = quantity

            elif movement_type == "approval_outward":
                # Only deduct from sellable stock if issue type dictates removal
                if deduct_available:
                    if stock.sellable_stock < quantity:
                        raise ValidationError(
                            f"Insufficient sellable stock for approval memo. Available: {stock.sellable_stock}, Requested: {quantity}."
                        )
                    stock.sellable_stock -= quantity
                    from_bucket = "sellable"
                else:
                    from_bucket = "sellable_display"

                stock.approval_stock += quantity
                to_bucket = "approval"
                outward_qty = quantity

            elif movement_type == "approval_return":
                if stock.approval_stock < quantity:
                    raise ValidationError(
                        f"Return quantity ({quantity}) exceeds stock currently on approval ({stock.approval_stock})."
                    )
                stock.approval_stock -= quantity
                if deduct_available:
                    stock.sellable_stock += quantity
                    to_bucket = "sellable"
                else:
                    to_bucket = "sellable_display"

                from_bucket = "approval"
                inward_qty = quantity

            elif movement_type == "repair_outward":
                if stock.sellable_stock < quantity:
                    raise ValidationError(
                        f"Insufficient stock for repair transfer. Available: {stock.sellable_stock}, Requested: {quantity}."
                    )
                stock.sellable_stock -= quantity
                stock.repair_stock += quantity
                from_bucket = "sellable"
                to_bucket = "repair"
                outward_qty = quantity

            elif movement_type == "repair_return":
                if stock.repair_stock < quantity:
                    raise ValidationError(
                        f"Return quantity ({quantity}) exceeds stock currently in repair ({stock.repair_stock})."
                    )
                stock.repair_stock -= quantity
                stock.sellable_stock += quantity
                from_bucket = "repair"
                to_bucket = "sellable"
                inward_qty = quantity

            elif movement_type == "return_quarantine":
                stock.quarantine_stock += quantity
                stock.quantity_on_hand += quantity
                from_bucket = "customer"
                to_bucket = "quarantine"
                inward_qty = quantity

            elif movement_type == "qc_restock":
                if stock.quarantine_stock < quantity:
                    raise ValidationError(
                        f"Restock quantity ({quantity}) exceeds quarantine stock ({stock.quarantine_stock})."
                    )
                stock.quarantine_stock -= quantity
                stock.sellable_stock += quantity
                from_bucket = "quarantine"
                to_bucket = "sellable"
                inward_qty = quantity

            elif movement_type == "scrap_writeoff":
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
                    raise ValidationError(f"Insufficient stock to write-off {quantity} units.")
                stock.quantity_on_hand -= quantity
                stock.damaged_stock += quantity
                to_bucket = "damaged"
                outward_qty = quantity

            elif movement_type == "branch_transfer_outward":
                if stock.sellable_stock < quantity:
                    raise ValidationError(
                        f"Insufficient stock for branch transfer. Available: {stock.sellable_stock}, Requested: {quantity}."
                    )
                stock.sellable_stock -= quantity
                stock.quantity_on_hand -= quantity
                from_bucket = "sellable"
                to_bucket = "in_transit"
                outward_qty = quantity

            else:
                raise ValidationError(f"Unsupported movement type: '{movement_type}'.")

            stock.save()

        data["product_id"] = product.id
        data["from_bucket"] = from_bucket
        data["to_bucket"] = to_bucket
        data["inward_qty"] = inward_qty
        data["outward_qty"] = outward_qty
        data["unit_cost"] = product.selling_price or 0.00
        data["reference_type"] = data.get("reference_type") or movement_type.upper()
        data["reference_id"] = data.get("reference_id") or f"MVT-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        if issue_type:
            data["issue_type_id"] = issue_type.id
        data["created_by"] = context.user if context.user and context.user.is_authenticated else None
        return data

    def execute_report(self, context, queryset) -> dict:
        """
        Dynamic Stock In/Out Accounting Report:
        Opening -> Inward -> Outward -> Closing
        """
        filters = context.filters or {}
        today_str = timezone.now().date().isoformat()
        start_date = filters.get("start_date") or filters.get("start_date.gte") or today_str
        end_date = filters.get("end_date") or filters.get("end_date.lte") or today_str
        category_id = filters.get("category_id") or filters.get("category")
        product_id = filters.get("product_id") or filters.get("product")

        try:
            naive_start = datetime.strptime(f"{start_date} 00:00:00", "%Y-%m-%d %H:%M:%S")
            naive_end = datetime.strptime(f"{end_date} 23:59:59", "%Y-%m-%d %H:%M:%S")
            start_dt = timezone.make_aware(naive_start)
            end_dt = timezone.make_aware(naive_end)
        except ValueError:
            raise ValidationError("Invalid date format. Expected YYYY-MM-DD.")

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

        stock_map = {
            s.product_id: s for s in InventoryStock.objects.filter(product__in=products_qs)
        }

        # Only count transactions that actually affect available stock
        outward_filter = Q(outward_qty__gt=0) & (
            Q(issue_type__isnull=True) | Q(issue_type__deduct_from_available_stock=True)
        )
        inward_filter = Q(inward_qty__gt=0) & (
            Q(issue_type__isnull=True) | Q(issue_type__deduct_from_available_stock=True)
        )

        for prod in products_qs:
            # 1. Opening Balance: strictly before start_date
            prior_agg = StockMovementLedger.objects.filter(
                product=prod,
                created_at__lt=start_dt,
                status=1
            ).aggregate(
                prior_in=Sum("inward_qty", filter=inward_filter),
                prior_out=Sum("outward_qty", filter=outward_filter)
            )
            opening = max(0, (prior_agg["prior_in"] or 0) - (prior_agg["prior_out"] or 0))

            # 2. Period Inward & Outward: [start_dt, end_dt]
            period_agg = StockMovementLedger.objects.filter(
                product=prod,
                created_at__gte=start_dt,
                created_at__lte=end_dt,
                status=1
            ).aggregate(
                p_in=Sum("inward_qty", filter=inward_filter),
                p_out=Sum("outward_qty", filter=outward_filter)
            )
            inward = period_agg["p_in"] or 0
            outward = period_agg["p_out"] or 0
            closing = opening + inward - outward

            # Live bucket breakdown
            curr_stock = stock_map.get(prod.id)
            sellable = curr_stock.sellable_stock if curr_stock else 0
            approval = curr_stock.approval_stock if curr_stock else 0
            quarantine = curr_stock.quarantine_stock if curr_stock else 0
            repair = curr_stock.repair_stock if curr_stock else 0
            qoh = curr_stock.quantity_on_hand if curr_stock else 0

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


# Register with Populate Engine Service Registry
ServiceRegistry.register("stock_ledger", StockLedgerService)
ServiceRegistry.register("stock_movement_ledger", StockLedgerService)
