# Stock Report Engine & Marketplace Integration Plan (Amazon SP-API & Flipkart)

## Executive Summary

This document establishes the architecture for the **Stock Report Engine** and its direct integration with **Amazon (SP-API)** and **Flipkart Marketplace**.

The primary objective is **real-time omnichannel stock visibility and automated inventory synchronization**, ensuring zero overselling, automated stock ledger auditing, and live multi-channel inventory feeds.

---

## 1. Stock Report Engine Architecture

A true enterprise stock report is not merely a static counter; it is a **double-entry inventory ledger** tracking every unit from physical inwarding to customer doorstep.

### 1.1. Core Inventory Metrics

| Metric | Calculation | Purpose |
|---|---|---|
| **Quantity on Hand (QOH)** | $\text{Total Inward} - \text{Total Fulfilled} - \text{Damaged}$ | Physical count present in the warehouse. |
| **Quantity Reserved** | $\sum \text{Pending Orders (POS + Amazon + Flipkart)}$ | Units locked in unfulfilled or processing orders. |
| **Available to Promise (ATP)** | $\text{Quantity on Hand} - \text{Quantity Reserved}$ | **The exact number pushed to Amazon & Flipkart.** |
| **Reorder Threshold** | Configurable per product (e.g. 10 units) | Triggers PO generation when ATP drops below limit. |
| **Stock Valuation** | $\text{QOH} \times \text{Weighted Average Cost Price}$ | Financial asset valuation for balance sheets. |

---

### 1.2. Stock Movement Types (`StockMovement`)
Every stock change writes an immutable audit record:
- `purchase_inward`: (+) Stock added via GRN from Vendor.
- `pos_sale`: (-) Stock deducted via in-store billing.
- `amazon_sale`: (-) Stock deducted from Amazon order fulfillment.
- `flipkart_sale`: (-) Stock deducted from Flipkart order fulfillment.
- `customer_return`: (+) Restocked from returned order (after inspection).
- `vendor_return`: (-) Damaged goods returned to supplier.
- `audit_adjustment`: (+/-) Physical stock audit reconciliation.

---

## 2. Omnichannel Marketplace Integration: Amazon & Flipkart

### 2.1. The Channel Mapping Layer (`ChannelListing`)
Each internal product must be mapped to its external marketplace identifiers:

```
[Local Product / SKU]
         │
         ├──► Amazon Mapping:
         │      - Seller SKU: "COT-POLO-BLK-L"
         │      - ASIN: "B09X12345"
         │      - Fulfillment: MFN (Merchant Fulfilled) or FBA
         │
         └──► Flipkart Mapping:
                - Listing ID: "LSTXYZ12345"
                - FSN: "TSHEF12345"
                - SKU ID: "FP-COT-BLK-L"
```

### Database Model: `ChannelListing`
```python
@register_model("channel_listing", table_type="master", status_field="status")
class ChannelListing(models.Model):
    product = models.ForeignKey("catalogue.ProductType", on_delete=models.CASCADE, related_name="channel_listings")
    channel = models.ForeignKey("channels.SalesChannel", on_delete=models.CASCADE, related_name="listings")
    channel_sku = models.CharField(max_length=100, db_index=True)
    external_listing_id = models.CharField(max_length=100, blank=True, null=True)  # ASIN / FSN / Listing ID
    listing_price = models.DecimalField(max_digits=10, decimal_places=2)
    sync_inventory = models.BooleanField(default=True, help_text="Auto-push live stock")
    last_synced_at = models.DateTimeField(blank=True, null=True)
    last_sync_status = models.CharField(max_length=50, default="synced")
```

---

## 3. Real-Time Inventory Sync Flow (Zero Overselling)

```
                     ┌───────────────────────────────────┐
                     │   Stock Event Occurs              │
                     │  - Inward Received (+50)          │
                     │  - POS Offline Sale (-2)          │
                     │  - Amazon/Flipkart Order (-1)     │
                     └─────────────────┬─────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │ Calculate Available to Promise:   │
                     │    ATP = QOH - Reserved           │
                     └─────────────────┬─────────────────┘
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
   ┌───────────────────────────┐               ┌───────────────────────────┐
   │ Amazon SP-API Sync Worker │               │ Flipkart API Sync Worker  │
   │  Endpoint:                │               │  Endpoint:                │
   │  /listings/2021-08-01/    │               │  /v3/listings/update      │
   │  Payload: { quantity: ATP }│               │  Payload: { listing: ATP }│
   └───────────────────────────┘               └───────────────────────────┘
```

### Safety Controls:
1. **Safety Stock Buffer**: Option to reserve a buffer (e.g. keep 2 units offline) so fast-selling items don't hit zero mid-sync.
2. **Lock Window**: Atomic row locking (`select_for_update`) during order reservation ensures two channels cannot sell the same physical unit concurrently.
3. **Webhook Ingestion**: Amazon SQS / Notification API and Flipkart Webhooks notify incoming orders instantly to reserve stock before picking.

---

## 4. Stock Reports & Dashboards

The Stock Report module provides 4 specialized views:

1. **Live Stock Ledger (Consolidated)**:
   - Product Name, Category, Brand, Inwarded, Sold (POS vs. Channels), Current QOH, Reserved, Available (ATP), Unit Value, Total Valuation.
2. **Channel Sync Health Dashboard**:
   - Status of every SKU on Amazon & Flipkart (Synced, Pending, Feed Error, Out of Stock).
3. **Movement History Audit Trail**:
   - Filterable date-wise ledger: Reference ID (Invoice/PO), Event Type, Quantity Change, User, Timestamp.
4. **Low Stock Alert & Reorder Report**:
   - SKUs where `Available <= Reorder Level` with 1-click Purchase Order creation to the registered Vendor.

---

## 5. Execution Roadmap

```
Step 1: Inventory Core & Stock Ledger
   ├── Inventory & StockMovement models connected to ProductType
   └── Real-time Stock Report UI with live calculation (QOH, Reserved, Available)

Step 2: Channel Listing Mapping
   ├── SalesChannel setup (Amazon, Flipkart)
   └── ChannelListing mapping UI (Product <-> ASIN / FSN / SellerSKU)

Step 3: Background Marketplace Sync Engine
   ├── Amazon SP-API integration client (Listings Items & Feeds API)
   ├── Flipkart Marketplace API integration client
   └── Async task queue pushing ATP updates on stock changes

Step 4: Marketplace Order Ingestion
   ├── Automated order pulling (Amazon Orders API & Flipkart API)
   ├── Instant stock reservation
   └── Fulfillment status update (tracking number push)
```
