from decimal import Decimal
from django.conf import settings
from django.db import models
from django.db.models import Sum
from core.registry import register_model


@register_model("supplier", table_type="master", status_field="is_active")
class Supplier(models.Model):
    """Dealer or supplier from whom the store buys products."""

    name = models.CharField(max_length=200)
    legal_name = models.CharField(max_length=200, blank=True, null=True)
    contact_person = models.CharField(max_length=150, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    gst_no = models.CharField(max_length=20, blank=True, null=True)

    address_line_1 = models.CharField(max_length=255, blank=True, null=True)
    address_line_2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default="India")
    pincode = models.CharField(max_length=20, blank=True, null=True)

    payment_terms = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "suppliers"
        ordering = ["name"]

    def __str__(self):
        return self.name


@register_model("purchase_order", table_type="transaction", status_field="status")
class PurchaseOrder(models.Model):
    """An order placed by the store with a supplier."""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("confirmed", "Confirmed"),
        ("partially_received", "Partially Received"),
        ("received", "Received"),
        ("cancelled", "Cancelled"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("unpaid", "Unpaid"),
        ("partially_paid", "Partially Paid"),
        ("paid", "Paid"),
    ]

    po_number = models.CharField(max_length=40, unique=True)
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name="purchase_orders",
    )

    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default="draft")
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="unpaid",
    )

    ordered_at = models.DateTimeField()
    expected_delivery_at = models.DateTimeField(blank=True, null=True)
    supplier_reference = models.CharField(max_length=100, blank=True, null=True)

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Advance amount agreed with the supplier
    advance_required = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    advance_due_at = models.DateTimeField(blank=True, null=True)

    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchase_orders_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "purchase_orders"
        ordering = ["-created_at"]

    @property
    def total_received(self):
        return (
            self.goods_receipts.filter(status="checked")
            .aggregate(total=Sum("items__quantity_accepted"))["total"]
            or 0
        )

    @property
    def total_ordered(self):
        return (
            self.items.aggregate(total=Sum("quantity_ordered"))["total"]
            or 0
        )

    @property
    def total_paid(self):
        return (
            self.payments.aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

    @property
    def balance_due(self):
        return max(self.total_amount - self.total_paid, Decimal("0.00"))

    @property
    def advance_balance_due(self):
        advance_paid = self.payments.filter(
            payment_type="advance"
        ).aggregate(total=Sum("amount"))["total"]

        if advance_paid is None:
            advance_paid = Decimal("0.00")

        return max(self.advance_required - advance_paid, Decimal("0.00"))

    def __str__(self):
        return self.po_number


@register_model("purchase_order_item", table_type="system")
class PurchaseOrderItem(models.Model):
    """A product variant and quantity requested on a purchase order."""

    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.CASCADE,
        related_name="items",
    )
    variant = models.ForeignKey(
        "catalogue.ProductVariant",
        on_delete=models.PROTECT,
        related_name="purchase_order_items",
    )

    # Snapshots preserve what was ordered if catalogue details later change.
    product_name = models.CharField(max_length=200)
    sku = models.CharField(max_length=64)
    quantity_ordered = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "purchase_order_items"
        ordering = ["id"]

    def __str__(self):
        return f"{self.sku} × {self.quantity_ordered}"


@register_model("purchase_payment", table_type="system")
class PurchasePayment(models.Model):
    """Advance and later payments made to a supplier."""

    PAYMENT_TYPE_CHOICES = [
        ("advance", "Advance"),
        ("part_payment", "Part Payment"),
        ("final_payment", "Final Payment"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("bank_transfer", "Bank Transfer"),
        ("upi", "UPI"),
        ("cheque", "Cheque"),
        ("other", "Other"),
    ]

    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.PROTECT,
        related_name="payments",
    )
    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        default="part_payment",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    paid_at = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="supplier_payments_recorded",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "purchase_payments"
        ordering = ["-paid_at"]

    def __str__(self):
        return (
            f"{self.purchase_order.po_number}: "
            f"{self.payment_type} {self.amount}"
        )


@register_model("goods_receipt", table_type="transaction", status_field="status")
class GoodsReceipt(models.Model):
    """A delivery or partial delivery received against a purchase order."""

    STATUS_CHOICES = [
        ("received", "Received"),
        ("checked", "Checked"),
        ("cancelled", "Cancelled"),
    ]

    receipt_number = models.CharField(max_length=40, unique=True)
    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.PROTECT,
        related_name="goods_receipts",
    )
    supplier_delivery_reference = models.CharField(max_length=100, blank=True, null=True)
    received_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="received")
    notes = models.TextField(blank=True, null=True)
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="goods_receipts_recorded",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "goods_receipts"
        ordering = ["-received_at"]

    def __str__(self):
        return self.receipt_number


@register_model("goods_receipt_item", table_type="system")
class GoodsReceiptItem(models.Model):
    """Quantities accepted, damaged, or rejected in a received delivery."""

    goods_receipt = models.ForeignKey(
        GoodsReceipt,
        on_delete=models.CASCADE,
        related_name="items",
    )
    purchase_order_item = models.ForeignKey(
        PurchaseOrderItem,
        on_delete=models.PROTECT,
        related_name="receipt_items",
    )
    quantity_received = models.PositiveIntegerField()
    quantity_accepted = models.PositiveIntegerField(default=0)
    quantity_damaged = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "goods_receipt_items"

    def __str__(self):
        return f"{self.purchase_order_item.sku}: {self.quantity_received} received"


@register_model("sale", table_type="transaction", status_field="status", aliases=["sales", "order", "orders"])
class Sale(models.Model):
    """A direct shop or point-of-sale sale to a customer."""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("unpaid", "Unpaid"),
        ("partially_paid", "Partially Paid"),
        ("paid", "Paid"),
        ("partially_refunded", "Partially Refunded"),
        ("refunded", "Refunded"),
    ]

    sale_number = models.CharField(max_length=40, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    payment_status = models.CharField(
        max_length=25,
        choices=PAYMENT_STATUS_CHOICES,
        default="unpaid",
    )

    # Customer association & point-in-time snapshot
    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )
    customer_name = models.CharField(max_length=150, blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)

    # Shipping delivery snapshot
    shipping_address = models.TextField(blank=True, null=True)
    shipping_city = models.CharField(max_length=60, blank=True, null=True)
    shipping_state = models.ForeignKey(
        "catalogue.StateMaster",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales",
    )
    shipping_pincode = models.CharField(max_length=10, blank=True, null=True)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Storefront payment & dispatch tracking
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    order_status = models.CharField(max_length=30, default="confirmed")
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    carrier = models.CharField(max_length=100, blank=True, null=True)

    sold_at = models.DateTimeField()
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    notes = models.TextField(blank=True, null=True)
    sold_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_recorded",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sales"
        ordering = ["-sold_at"]

    def __str__(self):
        return self.sale_number


@register_model("sale_item", table_type="system", aliases=["sale_items", "order_items"])
class SaleItem(models.Model):
    """A product variant sold, with price and product details captured at sale time."""

    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey(
        "catalogue.ProductVariant",
        on_delete=models.PROTECT,
        related_name="sale_items",
    )

    product_name = models.CharField(max_length=200)
    sku = models.CharField(max_length=64)
    size = models.CharField(max_length=30, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)

    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "sale_items"
        ordering = ["id"]

    def __str__(self):
        return f"{self.sku} × {self.quantity}"


@register_model("sale_payment", table_type="system", aliases=["sale_payments", "payment", "payments"])
class SalePayment(models.Model):
    """Payments received for a sale and refunds paid back to the customer."""

    TRANSACTION_TYPE_CHOICES = [
        ("payment", "Payment"),
        ("refund", "Refund"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("card", "Card"),
        ("bank_transfer", "Bank Transfer"),
        ("upi", "UPI"),
        ("cheque", "Cheque"),
        ("other", "Other"),
    ]

    sale = models.ForeignKey(
        Sale,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="transactions",
    )
    sales_return = models.ForeignKey(
        "orders.SalesReturn",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="refund_transactions",
    )
    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments",
    )
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    transacted_at = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sale_transactions_recorded",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "sale_payments"
        ordering = ["-transacted_at"]

    def __str__(self):
        ref = self.sale.sale_number if self.sale else (self.reference_number or str(self.id))
        return f"{ref}: {self.transaction_type} {self.amount}"


@register_model("sales_return", table_type="transaction", status_field="status", aliases=["sales_returns", "return", "returns"])
class SalesReturn(models.Model):
    """A customer return request against a completed sale."""

    STATUS_CHOICES = [
        ("requested", "Requested"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("received", "Received"),
        ("refunded", "Refunded"),
        ("completed", "Completed"),
    ]

    return_number = models.CharField(max_length=40, unique=True)
    sale = models.ForeignKey(Sale, on_delete=models.PROTECT, related_name="returns")
    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="returns",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="requested")
    reason = models.TextField()
    total_refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_returns_processed",
    )
    notes = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sales_returns"
        ordering = ["-requested_at"]

    def __str__(self):
        return self.return_number


@register_model("sales_return_item", table_type="system", aliases=["sales_return_items", "return_items"])
class SalesReturnItem(models.Model):
    """The particular sale line and quantity being returned."""

    sales_return = models.ForeignKey(
        SalesReturn,
        on_delete=models.CASCADE,
        related_name="items",
    )
    sale_item = models.ForeignKey(
        SaleItem,
        on_delete=models.PROTECT,
        related_name="return_items",
    )
    quantity = models.PositiveIntegerField()
    refund_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    restockable = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "sales_return_items"

    def __str__(self):
        return f"{self.sale_item.sku}: {self.quantity} returned"


@register_model("purchase_lot", table_type="transaction", status_field="status", aliases=["lots", "lot", "lot_generate"])
class PurchaseLot(models.Model):
    STATUS_CHOICES = [(1, "Active"), (0, "Cancelled")]

    lot_number = models.CharField(max_length=50, unique=True, verbose_name="Lot Number")
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.PROTECT,
        related_name="purchase_lots"
    )
    goods_receipt = models.ForeignKey(
        GoodsReceipt,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lots"
    )
    inward_date = models.DateField(auto_now_add=True)
    total_quantity = models.PositiveIntegerField(default=0)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "purchase_lots"
        verbose_name = "Purchase Lot"
        verbose_name_plural = "Purchase Lots"
        ordering = ["-created_at"]

    def __str__(self):
        return self.lot_number


@register_model("petty_cash", table_type="transaction", status_field="status", aliases=["petty_cash_transactions"])
class PettyCashTransaction(models.Model):
    STATUS_CHOICES = [(1, "Active"), (0, "Void")]
    TXN_TYPES = [
        ("cash_in", "Cash In (Top-Up / Deposit)"),
        ("cash_out", "Cash Out (Disbursement / Expense)"),
    ]

    voucher_number = models.CharField(max_length=50, unique=True, verbose_name="Voucher Number")
    transaction_type = models.CharField(max_length=20, choices=TXN_TYPES, default="cash_out")
    category = models.CharField(max_length=100, default="Office Supplies", verbose_name="Expense / Inflow Category")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payee_name = models.CharField(max_length=150, verbose_name="Payee / Recipient Name")
    approved_by = models.CharField(max_length=100, blank=True, null=True, verbose_name="Approved By")
    remarks = models.TextField(blank=True, null=True, verbose_name="Remarks / Business Purpose")
    transacted_at = models.DateTimeField(auto_now_add=True)
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)

    class Meta:
        db_table = "petty_cash_transactions"
        verbose_name = "Petty Cash Voucher"
        verbose_name_plural = "Petty Cash Vouchers"
        ordering = ["-transacted_at"]

    def __str__(self):
        return f"{self.voucher_number} - ₹{self.amount} ({self.get_transaction_type_display()})"


@register_model("billing_receipt", table_type="transaction", status_field="status", aliases=["receipts", "billing_receipts"])
class BillingReceipt(models.Model):
    STATUS_CHOICES = [(1, "Active"), (0, "Cancelled")]

    receipt_number = models.CharField(max_length=50, unique=True, verbose_name="Receipt Number")
    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="billing_receipts"
    )
    customer_name = models.CharField(max_length=150, blank=True, null=True)
    sale = models.ForeignKey(
        Sale,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="receipts"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_mode = models.CharField(max_length=50, default="cash", verbose_name="Payment Mode")
    reference_no = models.CharField(max_length=100, blank=True, null=True, verbose_name="Ref / UTR / Cheque No")
    receipt_date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "billing_receipts"
        verbose_name = "Billing Receipt"
        verbose_name_plural = "Billing Receipts"
        ordering = ["-receipt_date", "-id"]

    def __str__(self):
        return f"{self.receipt_number} - ₹{self.amount}"


@register_model("customer_advance", table_type="transaction", status_field="status", aliases=["advances", "customer_advances"])
class CustomerAdvance(models.Model):
    STATUS_CHOICES = [(1, "Active"), (0, "Void / Refunded")]

    advance_number = models.CharField(max_length=50, unique=True, verbose_name="Advance Slip Number")
    customer = models.ForeignKey(
        "catalogue.CustomerMaster",
        on_delete=models.PROTECT,
        related_name="advances"
    )
    customer_name = models.CharField(max_length=150, blank=True, null=True)
    order = models.ForeignKey(
        Sale,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="advance_payments"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Advance Received")
    used_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Allocated / Used Amount")
    balance_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Available Advance Balance")
    payment_mode = models.CharField(max_length=50, default="upi", verbose_name="Mode of Payment")
    reference_no = models.CharField(max_length=100, blank=True, null=True, verbose_name="Transaction Ref")
    notes = models.TextField(blank=True, null=True)
    status = models.SmallIntegerField(default=1, choices=STATUS_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customer_advances"
        verbose_name = "Customer Advance"
        verbose_name_plural = "Customer Advances"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.advance_number} - {self.customer_name} (₹{self.amount})"