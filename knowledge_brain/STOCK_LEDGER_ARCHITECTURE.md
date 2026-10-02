# Stock Ledger Architecture: Inward/Outward Dynamic Report & Stock Buckets

## Overview

This document details the **Stock Ledger & Multi-Bucket Inventory System** based on [`Docs/STOCK_LEDGER_AND_BUCKETS_REPORT_PLAN.md`](../Docs/STOCK_LEDGER_AND_BUCKETS_REPORT_PLAN.md).

---

## 1. Dynamic Stock Accounting Formula

$$\begin{aligned}
\text{Opening} &= \sum_{t < \text{Start Date}} (\text{Inward Qty} - \text{Outward Qty}) \\
\text{Inward} &= \sum_{\text{Start Date} \le t \le \text{End Date}} \text{Inward Qty} \\
\text{Outward} &= \sum_{\text{Start Date} \le t \le \text{End Date}} \text{Outward Qty} \\
\text{Closing} &= \text{Opening} + \text{Inward} - \text{Outward}
\end{aligned}$$

---

## 2. Multi-Bucket Stock Segregation

1. **`sellable` (On-Hand)**: Live available inventory pushed to POS, Amazon, and Flipkart.
2. **`reserved`**: Claimed by unfulfilled online/marketplace orders.
3. **`approval` (Photoshoot / Memo)**: Physically out for marketing, media shoots, or PR approval. Still owned by company, but cannot be sold.
4. **`quarantine` (Customer Returns)**: Returned items held for quality inspection before restock.
5. **`repair` (Alterations)**: Items undergoing alteration or vendor repair.
6. **`damaged`**: Scrapped / unrecoverable stock.

---

## 3. Inward Lot & Item Tagging

- Every purchase inward generates a batch **Lot Number** (`LOT-YYYYMMDD-XXXX`).
- Generates unique physical **Item Barcodes / Tags** (`ITM-LOT-XXX`) attached to physical units.
- Moving stock between buckets (e.g. Sellable $\rightarrow$ Photoshoot Memo) creates a recorded double-entry event in `StockMovementLedger`.

---

## 4. Service Layer Execution

- Custom date-range aggregation is performed by `StockReportService` in the `services/` directory.
- Avoids domain logic inside generic engine stages (Anti-If rule compliance).
