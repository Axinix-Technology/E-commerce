# Stock Report Engine & Marketplace Integration (Amazon & Flipkart)

## Overview

This document details the **Stock Report Engine** and its bidirectional integration with **Amazon (SP-API)** and **Flipkart Marketplace** based on [`Docs/STOCK_REPORT_AND_MARKETPLACE_INTEGRATION_PLAN.md`](../Docs/STOCK_REPORT_AND_MARKETPLACE_INTEGRATION_PLAN.md).

---

## 1. Inventory Mathematics & Availability

- **Quantity on Hand (QOH)**: Physical units in warehouse.
- **Quantity Reserved**: Units claimed by unfulfilled marketplace or POS orders.
- **Available to Promise (ATP)**:
  $$\text{ATP} = \text{Quantity on Hand} - \text{Quantity Reserved}$$
  *ATP is the live figure broadcast to Amazon and Flipkart inventory feeds.*

---

## 2. Omnichannel Sync Engine

1. **Mapping Layer (`ChannelListing`)**:
   - Internal `ProductType` mapped to Amazon ASIN/SellerSKU and Flipkart FSN/Listing ID.
2. **Event-Driven Sync**:
   - Triggered on Purchase Inward (+), POS Sale (-), or Marketplace Order (-).
   - Asynchronously sends inventory feeds to Amazon SP-API and Flipkart Marketplace API.
3. **Overselling Prevention**:
   - Atomic database locking (`select_for_update`) during order reservation.
   - Configurable safety stock buffer.

---

## 3. Stock Report Views

- **Consolidated Stock Ledger**: QOH, Reserved, Available, Unit Cost, and Inventory Valuation.
- **Channel Inventory Monitor**: Sync status, last feed timestamp, error logs.
- **Movement History Audit**: Complete trail of every inward, sale, return, and adjustment.
- **Reorder Alert Report**: Items below minimum safety threshold.
