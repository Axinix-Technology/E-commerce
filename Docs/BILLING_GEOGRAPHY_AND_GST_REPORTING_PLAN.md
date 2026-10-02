# Billing Architecture: Geography Masters, Customer Master & GST Reporting Plan

## Executive Summary

When designing an enterprise billing and invoicing engine for Indian e-commerce & retail, location data directly governs **statutory tax calculation (CGST + SGST vs. IGST)** and **GST reporting (GSTR-1, GSTR-3B)**.

This document analyzes whether to use full database masters (`Country -> State -> City -> Area`) versus frontend selections, evaluates their impact on compliance and operational velocity, and outlines the complete blueprint for billing and GST reporting.

---

## 1. Architectural Trade-Off Analysis

| Approach | Architecture | Operational UX Impact | GST Reporting Impact | Recommendation |
|---|---|---|---|---|
| **Approach 1: Deep Master Hierarchy** | 4 separate relational tables: `Country -> State -> City -> Area` | ❌ **High Friction**: User cannot complete billing or registration if a small town/area is not pre-registered in master tables. | ✅ High integrity, but high administrative burden. | **Not Recommended** (Overkill for e-commerce/retail) |
| **Approach 2: Pure Free-form Frontend Text** | Plain text inputs for State, City, Area with no backend validation | ✅ **Zero Setup**: Fast to code. | ❌ **Catastrophic Failure**: Typos like `"TN"`, `"Tamilnadu"`, `"Tamil Nadu"` break GST Place of Supply (POS), corrupt tax splits, and cause GSTN portal JSON upload rejections. | **Strictly Forbidden** for GST compliance |
| **Approach 3: Statutory State Master + Pincode Intelligence (Enterprise Standard)** | - **State Master**: Static statutory seed of 36 Indian States/UTs with 2-digit GST Codes.<br>- **City & Area**: Clean address fields populated via standard Pincode or quick input.<br>- **Customer Master**: B2B (with GSTIN) and B2C. | ⭐️ **Frictionless**: Seamless checkout & fast POS billing.<br>Auto-fills state and district from 6-digit Pincode. | ⭐️ **100% Tax Accuracy**: Exact 2-digit GST State Code guarantees accurate POS determination and GSTR-1 Table 4, 5, 7, 12 generation. | **RECOMMENDED (Gold Standard)** |

---

## 2. Why the State Master is Non-Negotiable for GST

Under the Indian GST regime, every tax calculation is decided by the **Place of Supply (POS)**:

$$\text{Tax Mode} = \begin{cases} \text{CGST } (50\%) + \text{SGST } (50\%) & \text{if } \text{Company State Code} == \text{Customer State Code} \\ \text{IGST } (100\%) & \text{if } \text{Company State Code} \neq \text{Customer State Code} \end{cases}$$

### Statutory 2-Digit GST State Codes
Every State and Union Territory in India has an immutable statutory code (e.g., `33` = Tamil Nadu, `27` = Maharashtra, `29` = Karnataka, `07` = Delhi). 

- A customer's GSTIN begins with this 2-digit code (e.g., `33AAAAA0000A1Z5` $\rightarrow$ State Code `33`).
- If a state is selected from a standardized master, the billing engine:
  1. Automatically cross-checks customer GSTIN vs. Selected State.
  2. Automatically applies CGST + SGST or IGST with 0% margin of error.
  3. Prepares GSTR-1 reports grouped by POS state codes without manual data cleanup.

---

## 3. Database Model Architecture

### 3.1. `StateMaster` (Seeded Once, Immutable)
```python
@register_model("state_master", table_type="master", status_field="status")
class StateMaster(models.Model):
    code = models.CharField(max_length=2, unique=True, help_text="Statutory 2-digit GST State Code (e.g. 33)")
    name = models.CharField(max_length=60, unique=True, help_text="State / UT Name (e.g. Tamil Nadu)")
    tin = models.CharField(max_length=2, blank=True, null=True)
    is_union_territory = models.BooleanField(default=False)
    status = models.SmallIntegerField(default=1, choices=[(1, "Active"), (0, "Inactive")], db_index=True)
```

### 3.2. `CustomerMaster` (B2C & B2B)
Supports both quick walk-in retail buyers and registered B2B corporate clients:
```python
@register_model("customer_master", table_type="master", status_field="status")
class CustomerMaster(models.Model):
    CUSTOMER_TYPES = [
        ("b2c", "Retail Consumer (B2C)"),
        ("b2b", "Registered Business (B2B)"),
    ]
    customer_type = models.CharField(max_length=10, choices=CUSTOMER_TYPES, default="b2c")
    name = models.CharField(max_length=150, help_text="Customer / Business Trade Name")
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(max_length=120, blank=True, null=True)
    
    # B2B Tax Credentials
    gstin = models.CharField(max_length=15, blank=True, null=True, help_text="15-digit GSTIN (B2B only)")
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    company_name = models.CharField(max_length=150, blank=True, null=True)
    
    # Address & Tax Determination (Place of Supply)
    billing_address = models.TextField(blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=60, blank=True, null=True)
    state = models.ForeignKey(StateMaster, on_delete=models.PROTECT, related_name="customers")
    pincode = models.CharField(max_length=10, blank=True, null=True)
    
    status = models.SmallIntegerField(default=1, choices=[(1, "Active"), (0, "Inactive")], db_index=True)
```

---

## 4. GST Reporting Architecture (GSTR-1 & GSTR-3B)

With this hybrid architecture, all billing data cleanly aggregates into government-prescribed reporting tables:

```
                  ┌──────────────────────────────────────────────┐
                  │               Sales Invoice                  │
                  │  - Invoice No, Date, Total, Taxable Value    │
                  │  - Customer State (POS Code)                 │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
       [Customer has GSTIN?]                           [Interstate > 2.5L?]
         /               \                               /               \
       YES                NO                           YES                NO
        │                  │                            │                  │
        ▼                  ▼                            ▼                  ▼
┌──────────────┐   ┌──────────────┐            ┌──────────────┐   ┌──────────────┐
│ GSTR-1 B2B   │   │ Retail Sale  │            │ GSTR-1 B2C-L │   │ GSTR-1 B2C-S │
│ (Table 4A)   │   │ Evaluation   │            │ (Table 5A)   │   │ (Table 7)    │
└──────────────┘   └──────────────┘            └──────────────┘   └──────────────┘
```

### Key GSTR-1 Output Tables:
1. **Table 4 (B2B Invoices)**:
   - Output fields: Customer GSTIN, Customer Legal Name, Invoice No, Invoice Date, Invoice Value, Place of Supply (POS 2-digit code), Reverse Charge Flag, Taxable Value, Integrated Tax (IGST), Central Tax (CGST), State Tax (SGST).
2. **Table 5 (B2C Large Invoices)**:
   - Interstate invoices issued to unregistered customers where invoice value exceeds ₹2,50,000.
3. **Table 7 (B2C Small Consolidated)**:
   - Consolidated summary of retail sales grouped by:
     - Place of Supply (POS)
     - Applicable Tax Rate (e.g. 5%, 12%, 18%)
     - Taxable Amount, CGST, SGST, IGST.
4. **Table 12 (HSN Summary of Outward Supplies)**:
   - Summary grouped by `hsn_code`: Total Quantity, Total Value, Taxable Value, IGST, CGST, SGST.
5. **Table 13 (Documents Issued)**:
   - Serial number range (From Invoice No to To Invoice No), Total count, Cancelled count, Net issued.

---

## 5. End-to-End Recommended Roadmap

```
Phase 1: Foundation Masters (Catalogue Master)
   ├── 1. Category Master (Done)
   ├── 2. Product Master with MRP (Done)
   ├── 3. GST Tax Slabs (Done)
   ├── 4. Vendor Registration (Done)
   └── 5. State Master (36 Indian States Seeded) & Customer Master

Phase 2: Purchase & Inward Module (GRN)
   ├── Purchase Order / Vendor Bill Entry
   ├── Inward Quantity & Cost Price Input
   └── Physical Inventory Barcode Sticker Generator

Phase 3: Sales POS & Billing Engine
   ├── POS Billing Terminal / Web Invoice Entry
   ├── Automatic CGST/SGST vs IGST Calculation based on POS
   ├── Printable Tax Invoice (B2B / B2C)
   └── Stock Deduction from Inventory

Phase 4: GST Compliance & Reporting Suite
   ├── GSTR-1 Live Dashboard & JSON Export
   ├── GSTR-3B Monthly Tax Summary
   └── HSN-wise Sales and Purchase Tax Audit Ledger
```
