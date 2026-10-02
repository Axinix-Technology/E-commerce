# Enterprise Stock Ledger: Inward/Outward Dynamic Report & Stock Buckets Architecture

## Executive Summary

This document establishes the architecture for the **Dynamic Stock In/Out Report** (`Opening -> Inward -> Outward -> Closing`) over any arbitrary date range, and the **Multi-Bucket Inventory Segregation System** (Sellable, Approval/Photoshoot, Repairs, Customer Returns Quarantine, and Scrap).

It details how every transaction is tracked in an immutable double-entry ledger, how lot-based inwarding and physical item tagging function, and how a dedicated backend service calculates dynamic opening balances with sub-second performance.

---

## 1. Dynamic Stock Accounting (The 4-Pillar Formula)

For any selected date range $[\text{Start Date}, \text{End Date}]$, and optional filters (`category_id`, `product_id`):

$$\begin{aligned}
\mathbf{\text{Opening Stock}} &= \sum_{t < \text{Start Date}} \left( \text{Inward Qty}(t) - \text{Outward Qty}(t) \right) \\
\mathbf{\text{Period Inward}} &= \sum_{\text{Start Date} \le t \le \text{End Date}} \text{Inward Qty}(t) \\
\mathbf{\text{Period Outward}} &= \sum_{\text{Start Date} \le t \le \text{End Date}} \text{Outward Qty}(t) \\
\mathbf{\text{Closing Stock}} &= \mathbf{\text{Opening Stock}} + \mathbf{\text{Period Inward}} - \mathbf{\text{Period Outward}}
\end{aligned}$$

> **Key Rule**: The **Opening Stock is never a static column**. It is computed dynamically from the immutable ledger up to the nanosecond before `Start Date`. This ensures 100% mathematical integrity across all historical audits.

---

## 2. Multi-State Stock Segregation (Inventory Buckets)

In a real retail/e-commerce operation, physical stock is not all "sellable". Units move across distinct lifecycle states:

```
                                  ┌─────────────────────────────┐
                                  │   Vendor Purchase Inward    │
                                  │    (Lot / Batch Number)     │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                           ┌───────────────────────────────────────────┐
                           │            SELLABLE ON-HAND               │
                           │   Available for POS, Amazon, Flipkart     │
                           └──────┬──────────────────────┬─────────────┘
                                  │                      │
             ┌────────────────────┼──────────────────────┼────────────────────┐
             │ (Approval Memo)    │ (Customer Return)    │ (Repair / Defect)  │ (Sales Outward)
             ▼                    ▼                      ▼                    ▼
     ┌───────────────┐    ┌───────────────┐      ┌───────────────┐    ┌───────────────┐
     │ APPROVAL /    │    │ RETURN        │      │ REPAIR /      │    │ SOLD &        │
     │ PHOTOSHOOT    │    │ QUARANTINE    │      │ ALTERATION    │    │ DISPATCHED    │
     │ - PR / Media  │    │ - QC Check    │      │ - Workshop    │    │ - POS Invoice │
     │ - Out on Memo │    │ - Restockable?│      │ - Vendor Rework│   │ - Marketplace │
     └───────┬───────┘    └───────┬───────┘      └───────┬───────┘    └───────────────┘
             │                    │                      │
             │ (Returned)         │ (Passed QC)          │ (Fixed)
             └────────────────────┴──────────┬───────────┴────────────────────┘
                                             │
                                             ▼
                                  Back to SELLABLE ON-HAND
```

### The 6 Distinct Stock Buckets:

| Bucket Key | Bucket Name | Company Owned? | Broadcast to Amazon/Flipkart? | Description |
|---|---|:---:|:---:|---|
| `sellable` | **Sellable On-Hand** | ✅ YES | ✅ **YES** | Ready for immediate fulfillment. |
| `reserved` | **Order Reserved** | ✅ YES | ❌ NO | Locked in unfulfilled marketplace or online orders. |
| `approval` | **Approval / Photoshoot Memo** | ✅ YES | ❌ NO | Physically given out for photo shoots, marketing, or influencer PR. Still company asset, but not sellable. |
| `quarantine`| **Return Quarantine** | ✅ YES | ❌ NO | Billed items returned by customer. Stored separately pending Quality Control (QC). |
| `repair` | **Repair / Alteration** | ✅ YES | ❌ NO | Units with minor stitch issues, missing buttons, or sent to alteration workshop. |
| `damaged` | **Damaged / Written-Off** | ❌ NO | ❌ NO | Scrap / destroyed units ready for accounting loss write-off. |

---

## 3. Double-Entry Stock Movement Ledger Model

Every single inventory event writes an immutable transaction row to `StockMovementLedger`:

```python
@register_model("stock_ledger", table_type="transaction", status_field="status")
class StockMovementLedger(models.Model):
    MOVEMENT_TYPES = [
        # Inward
        ("purchase_inward", "Purchase / GRN Inward"),
        ("return_restock", "Return Restocked after QC"),
        ("approval_return", "Returned from Approval / Photoshoot"),
        ("repair_return", "Returned from Repair / Alteration"),
        ("audit_plus", "Stock Audit Plus Adjustment"),
        
        # Outward
        ("pos_sale", "POS Billing Sale"),
        ("marketplace_sale", "Marketplace Sale (Amazon/Flipkart)"),
        ("approval_outward", "Sent to Photoshoot / Approval Memo"),
        ("repair_outward", "Sent to Repair / Alteration Workshop"),
        ("vendor_return", "Returned to Vendor (RTV)"),
        ("scrap_writeoff", "Damaged / Scrap Write-Off"),
        ("audit_minus", "Stock Audit Minus Adjustment"),
    ]

    product = models.ForeignKey("catalogue.ProductType", on_delete=models.PROTECT, related_name="ledger_entries")
    movement_type = models.CharField(max_length=30, choices=MOVEMENT_TYPES, db_index=True)
    
    # Bucket Transition (From -> To)
    from_bucket = models.CharField(max_length=20, blank=True, null=True) # e.g. 'sellable'
    to_bucket = models.CharField(max_length=20, blank=True, null=True)   # e.g. 'approval'
    
    # Directional quantities
    inward_qty = models.PositiveIntegerField(default=0)
    outward_qty = models.PositiveIntegerField(default=0)
    
    # Lot & Audit Tracking
    lot_number = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    item_barcode = models.CharField(max_length=64, blank=True, null=True, db_index=True) # Tagged unit
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Source Reference
    reference_type = models.CharField(max_length=50) # 'GRN', 'INVOICE', 'MEMO', 'QC_NOTE'
    reference_id = models.CharField(max_length=100, db_index=True)
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    created_by = models.ForeignKey("users.User", on_delete=models.SET_NULL, null=True, blank=True)
```

---

## 4. Inwarding with Lot / Batch & Physical Item Tagging

1. **Purchase Entry (GRN Header)**:
   - Supplier / Vendor (`VendorMaster`), Invoice No, Invoice Date.
2. **Lot Generation**:
   - Each inward creates a unique Lot Number: `LOT-YYYYMMDD-XXXX` (e.g. `LOT-20261001-0042`).
3. **Physical Item Barcode Tagging**:
   - When 20 pieces of `Men's Cotton Shirt` are inwarded in Lot 42, the system generates 20 scannable item barcodes (or lot stickers):
     `ITM-LOT42-001`, `ITM-LOT42-002`, ..., `ITM-LOT42-020`.
   - These stickers are printed directly at the inward station and attached to the garment polybags/tags.
   - When billing or dispatching, scanning this barcode immediately identifies the exact lot and purchase cost!

---

## 5. Stock Report Service Architecture (`StockReportService`)

Following Rule 8 and the Populate Engine Anti-If principle, custom aggregation logic lives in a dedicated domain service registered in `ServiceRegistry`:

```python
class StockReportService(BaseService):
    """
    Computes Opening, Inward, Outward, and Closing stock balances 
    across any date range with sub-second performance.
    """

    def generate_report(self, start_date, end_date, category_id=None, product_id=None):
        # 1. Base Filter for Products
        # 2. Opening Balance Subquery: All movements where created_at < start_date
        # 3. Period Inward Subquery: inward_qty where start_date <= created_at <= end_date
        # 4. Period Outward Subquery: outward_qty where start_date <= created_at <= end_date
        # 5. Bucket Breakdown: Current counts in Sellable, Approval, Quarantine, Repair
        # 6. Returns structured dataset for UI and Excel/PDF export
```

---

## 6. Frontend Report View (`/inventory/stock-report`)

- **Top Filter Bar**:
  - Date Range Picker (From Date $\rightarrow$ To Date)
  - Category Dropdown
  - Product Autocomplete Search
  - Export to Excel / CSV / Print Button
- **Summary Metrics Cards**:
  - Total Opening Units
  - Total Inwarded Units (+)
  - Total Outwarded Units (-)
  - Total Closing Sellable Stock
  - Stock Under Approval / Photoshoot Memo
  - Stock in Return Quarantine / Repair
- **Detailed Data Grid**:
  - `# ID`, `Product Name`, `Category`, `Opening`, `Inward (+)`, `Outward (-)`, `Closing (=)`, `In Approval`, `In Quarantine/Repair`, `Valuation (₹)`.
  - Expandable row showing lot-wise breakdown and individual transaction history.
