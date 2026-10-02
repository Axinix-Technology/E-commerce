# Vendor Master: Supplier Registration & Trade Credentials

## Overview

The `VendorMaster` entity represents authorized suppliers, textile mills, manufacturers, and trade partners who deliver inventory into the warehouse. It provides the foundation for purchase orders and GRN (Goods Receipt Note) inward entries.

---

## 1. Database Model (`catalogue.VendorMaster`)

Registered with the Django + MySQL Populate Engine as `vendor_master`:

```python
@register_model("vendor_master", table_type="master", status_field="status")
class VendorMaster(models.Model):
    name = models.CharField(max_length=150, unique=True, verbose_name="Vendor / Supplier Name")
    vendor_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=120, blank=True, null=True)
    gstin = models.CharField(max_length=15, blank=True, null=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=60, blank=True, null=True)
    state = models.CharField(max_length=60, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    ifsc_code = models.CharField(max_length=20, blank=True, null=True)
    status = models.SmallIntegerField(default=1, choices=[(1, "Active"), (0, "Inactive")], db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## 2. Inward Module Linkage

During **Purchase Entry / Inwarding**:
- Each Inward / GRN header references `vendor_id`.
- Supplier GSTIN is automatically pulled for tax credit and purchase invoice validation.
- Deactivated vendors (`status = 0`) are filtered out from selection dropdowns.

---

## 3. UI Implementation (No Popups)

- **Listing View**: [`/catalogue/vendors/index.jsx`](file:///e:/Loigmax/E-commerce/frontend/src/pages/catalogue/vendors/index.jsx)
- **Full-Page Form**: [`/catalogue/vendors/create.jsx`](file:///e:/Loigmax/E-commerce/frontend/src/pages/catalogue/vendors/create.jsx) (Supports Create and Edit via `?id=`)
