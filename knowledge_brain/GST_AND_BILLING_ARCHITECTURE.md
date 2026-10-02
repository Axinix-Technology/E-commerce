# GST & Billing Architecture: Geography Masters, Customer Master & Tax Reporting

## Overview

This document defines the architectural blueprint for geographic location masters, customer classification, and automated GST reporting (GSTR-1, GSTR-3B) based on [`Docs/BILLING_GEOGRAPHY_AND_GST_REPORTING_PLAN.md`](../Docs/BILLING_GEOGRAPHY_AND_GST_REPORTING_PLAN.md).

---

## 1. Trade-Off Analysis: Masters vs. Frontend Selection

- **Why NOT full hierarchy (`Country -> State -> City -> Area`)**: Creates unbearable friction during billing. Cashiers and customers cannot complete orders if their village or area has not been pre-registered by an administrator.
- **Why NOT free-form text**: Completely breaks GST reporting. In India, tax split depends on **Place of Supply (POS)**. Typos like `"TN"`, `"Tamilnadu"`, `"Tamil Nadu"` break automated tax determination (CGST+SGST vs. IGST) and result in rejection by the GSTN portal during GSTR-1 JSON upload.
- **The Golden Solution (State Master + Pincode Intelligence)**:
  - **State Master (`state_master`)**: Seeded once with all 36 Indian States and Union Territories with their statutory 2-digit GST codes (e.g., `33` = Tamil Nadu, `27` = Maharashtra).
  - **City & Area**: Managed as text / auto-derived via 6-digit PIN code.
  - **Customer Master (`customer_master`)**: B2B (with GSTIN validation) and B2C retail consumers with a foreign key to `StateMaster`.

---

## 2. Dynamic GST Calculation Engine

Tax splitting is evaluated at line-item and invoice finalization:

- **Seller State Code == Customer POS State Code**:
  - `CGST = Taxable Value * (Rate / 2)`
  - `SGST = Taxable Value * (Rate / 2)`
  - `IGST = 0`
- **Seller State Code != Customer POS State Code**:
  - `IGST = Taxable Value * Rate`
  - `CGST = 0`, `SGST = 0`

---

## 3. GST Reporting Tables (GSTR-1 Ready)

1. **Table 4 (B2B Invoices)**: Customer GSTIN, Invoice No, Date, Taxable Value, CGST, SGST, IGST, POS.
2. **Table 5 (B2C Large)**: Interstate consumer sales > ₹2.5 Lakhs.
3. **Table 7 (B2C Small)**: Consolidated net sales grouped by POS and tax slab rate.
4. **Table 12 (HSN Summary)**: HSN code, UOM, total quantity, total value, taxable value, and tax breakdown.
