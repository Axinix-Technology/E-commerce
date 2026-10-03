# Comprehensive Documentation: Summary of Changes Today

**Date:** October 3, 2026  
**Repository:** `Axinix-Technology/E-commerce`  
**Platform Architecture:** Django 5.x Backend (MySQL local) + React (Vite, Tailwind v4, Populate Engine API)  
**Document Author:** AI Engineering Pair  

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Infrastructure & Environment Configuration](#1-infrastructure--environment-configuration)
3. [Authentication, Security & Layout Architecture](#2-authentication-security--layout-architecture)
4. [Backend Database Models & Migrations](#3-backend-database-models--migrations)
5. [Backend Admin & Populate Engine Registrations](#4-backend-admin--populate-engine-registrations)
6. [Dynamic Navigation & CLI Seeding](#5-dynamic-navigation--cli-seeding)
7. [Storefront & Customer Experience Suite (46 Pages)](#6-storefront--customer-experience-suite-46-pages)
8. [Core ERP Business Operations Suite (38 Pages)](#7-core-erp-business-operations-suite-38-pages)
9. [UI Formatting Rules Implementation](#8-ui-formatting-rules-implementation)
10. [Complete Directory & File Audit](#9-complete-directory--file-audit)
11. [Verification & Build Validation](#10-verification--build-validation)

---

## Executive Summary

Today's milestone represented an enterprise-grade expansion of the platform. We transitioned the codebase from an inventory-centric prototype to a complete, dual-engine commerce system consisting of:
1. **A Consumer-Facing Storefront & Customer Lifecycle Suite**: 23 modules spanning shopping discovery, interactive carts, multi-step checkout, customer account management, knowledge bases, order tracking, and promotional campaigns.
2. **A Complete ERP & POS Operations Suite**: 7 core modules spanning Point-of-Sale (POS) counter billing, Customer Returns (RMA), Payment Collections & Refund ledgers, Inward Goods Receipt (GRN), Executive Financial Reports, and Corporate Store Settings.
3. **Architectural Standardization**: Every frontend module was strictly structured into the uniform pattern `Folder / <concept-name> / index.jsx & create.jsx`.
4. **Database Schemas & Migrations**: Defined 15+ models in a new `storefront` app and upgraded `orders` and `catalogue` with customer links, returns tracking, and flexible payment vouchers.
5. **Populate Engine Integration**: Configured status field enforcements (`table_type="system"` vs `"transaction"` / `"master"`) enabling dynamic CRUD operations without custom endpoints.
6. **Strict UI Formatting Rules**: Enforced zero-value representation as em-dashes (`—`) and single-line minimalist metric summary bars across all screens.

---

## 1. Infrastructure & Environment Configuration

### 1.1 Local MySQL Database Port Parsing Resilience
- **File**: `backend/config/settings.py`
- **Issue**: Starting Django commands produced `ValueError: invalid literal for int() with base 10: 'port'` when environment variable `MYSQL_PORT` was unset or held placeholder text.
- **Change**: Added safe integer parsing with defensive exception handling and an automatic fallback to port `3306`:
  ```python
  raw_port = os.getenv('MYSQL_PORT', '3306')
  try:
      mysql_port = str(int(raw_port))
  except (ValueError, TypeError):
      mysql_port = '3306'
  ```
- **Result**: Reliable, crash-free startup across local MySQL instances (`axinix_ecommerce_db`, 71 tables).

### 1.2 Environment File Example Defaults
- **File**: `backend/.env.example`
- **Change**: Updated database credentials template to realistic local defaults (`127.0.0.1`, `3306`, `axinix_ecommerce_db`, `root`).

---

## 2. Authentication, Security & Layout Architecture

### 2.1 Pure JavaScript SHA-256 Fallback for Non-Secure Contexts
- **File**: `frontend/src/pages/login.jsx`
- **Issue**: Modern browsers (Chrome, Edge, Safari) disable `window.crypto.subtle` in non-secure contexts (e.g., accessing the dev server via local network IP `http://192.168.x.x:5173`). This caused uncaught exceptions: `Cannot read properties of undefined (reading 'digest')`.
- **Change**: Implemented an automated fallback hasher:
  1. Checks if `window.crypto?.subtle?.digest` is defined.
  2. If undefined or failing, seamlessly executes a self-contained pure JavaScript SHA-256 algorithm.
- **Result**: Client-side password pre-hashing functions flawlessly in HTTPS, `localhost`, and LAN HTTP environments.

### 2.2 Dual Superadmin Provisioning
- **File**: `backend/users/management/commands/setup_initial_db.py`
- **Change**: Enhanced the initial database setup command to provision two superadmin accounts:
  1. Primary configured administrator: `admin_axinix` / `SuperAdmin@123456`.
  2. Secondary default UI developer account: `admin` / `Admin@123456`.
  3. Automatically triggers statutory GST states (`seed_states`) and navigation sidebars (`seed_navigation`).

### 2.3 Public Storefront Route Whitelisting
- **File**: `frontend/src/layouts/baseLayouts.jsx`
- **Change**: Whitelisted all public consumer routes (`/shopping/*`, `/customer-account/*`, `/help-policies/*`, `/useful-additions/*`) so unauthenticated shoppers can browse products, view policies, and register without being redirected to the staff `/login` screen.

### 2.4 Token-Guarded Settings Provider
- **File**: `frontend/src/context/settingsProvider.jsx`
- **Change**: Prevented unauthenticated general settings queries from firing before a JWT/Auth token is stored, eliminating unnecessary 401 console errors.

---

## 3. Backend Database Models & Migrations

### 3.1 New Django App: `storefront`
- **Location**: `backend/storefront/`
- **Models Implemented (`backend/storefront/models.py`)**:
  | Model Name | Description & Key Columns |
  | :--- | :--- |
  | `HeroBanner` | Promotional banners: title, subtitle, CTA link, image URL, display order, active status |
  | `ProductImage` | Multi-image product gallery: product FK, variant FK, image URL, is_primary, display order |
  | `Cart` | Customer shopping cart: user FK, session key, status (active, converted, abandoned) |
  | `CartItem` | Cart item lines: cart FK, product FK, variant FK, quantity, price snapshot |
  | `CustomerAddress` | Customer address book: customer FK, address type (shipping/billing), street, city, state, pincode, is_default |
  | `CustomerPaymentMethod` | Saved customer cards/UPI handles: customer FK, method type, provider, token, is_default |
  | `PasswordResetOtp` | Password recovery: phone/email, OTP code, expiry timestamp, verified boolean |
  | `SupportTicket` | Customer helpdesk: ticket number, customer FK, subject, category, priority, status, messages |
  | `FaqCategory` | Knowledge base categories: name, slug, icon, display order |
  | `FaqItem` | Knowledge base Q&A: category FK, question, answer, display order |
  | `StorePolicy` | CMS legal policies: policy type (terms, privacy, shipping, returns), title, markdown content |
  | `ProductReview` | Product ratings & reviews: product FK, customer FK, rating (1-5 stars), review text, verified buyer flag |
  | `WishlistItem` | Customer wishlist: customer FK, product FK, variant FK, added timestamp |
  | `OrderTrackingMilestone` | Shipment milestone tracker: sale FK, milestone status, title, location, notes, timestamp |
  | `PromotionCoupon` | Discount promo codes: code, discount type (percentage/fixed), value, min order, expiry date |
- **Migration**: `storefront/migrations/0001_initial.py` applied cleanly to MySQL.

### 3.2 Catalogue App Enhancements
- **File**: `backend/catalogue/models.py`
- **Change**: Added `user = ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=SET_NULL)` to `CustomerMaster`.
- **Migration**: `catalogue/migrations/0007_customermaster_user.py` applied cleanly.

### 3.3 Orders App Enhancements
- **File**: `backend/orders/models.py`
- **Changes**:
  1. Enhanced `Sale`: Added storefront customer metadata (`customer`, `customer_name`, `customer_phone`, `customer_email`, `shipping_address`, `shipping_city`, `shipping_state`, `shipping_pincode`, `shipping_fee`, `payment_method`, `order_status`, `tracking_number`, `carrier`).
  2. Enhanced `SalePayment`:
     - Added `customer`: ForeignKey to `catalogue.CustomerMaster` (nullable).
     - Added `sales_return`: ForeignKey to `orders.SalesReturn` (nullable).
     - Made `sale` ForeignKey nullable to permit direct counter payments and return refund vouchers.
  3. Enhanced `SalesReturn`:
     - Added `customer`: ForeignKey to `catalogue.CustomerMaster` (nullable).
     - Added `total_refund_amount`: `DecimalField(max_digits=12, decimal_places=2, default=0)`.
- **Migrations**:
  - `orders/migrations/0002_sale_carrier_sale_customer_sale_order_status_and_more.py`
  - `orders/migrations/0003_salepayment_customer_salepayment_sales_return_and_more.py`

---

## 4. Backend Admin & Populate Engine Registrations

### 4.1 Django Admin Registrations
- **File**: `backend/storefront/admin.py`: Registered all 15 storefront models with search fields, list filters, and inline relationships.
- **File**: `backend/orders/admin.py`: Registered `Supplier`, `PurchaseOrder` (with items inline), `Sale` (with items inline), `SalePayment`, and `SalesReturn` (with return items inline).

### 4.2 Populate Engine Model Registrations (`backend/orders/models.py`)
To enable dynamic frontend CRUD and API querying (`/api/populate/`) without custom REST endpoints, models were decorated with `@register_model`:
- **Transactional Entities with Status Fields**:
  - `@register_model("purchase_order", table_type="transaction", status_field="status")`
  - `@register_model("goods_receipt", table_type="transaction", status_field="status")`
  - `@register_model("sale", table_type="transaction", status_field="status", aliases=["sales", "order", "orders"])`
  - `@register_model("sales_return", table_type="transaction", status_field="status", aliases=["sales_returns", "return", "returns"])`
- **Master Entities**:
  - `@register_model("supplier", table_type="master", status_field="is_active")`
- **System Line Items & Child Transactions (Bypassing `core.E001` status requirement)**:
  - `@register_model("purchase_order_item", table_type="system")`
  - `@register_model("purchase_payment", table_type="system")`
  - `@register_model("goods_receipt_item", table_type="system")`
  - `@register_model("sale_item", table_type="system", aliases=["sale_items", "order_items"])`
  - `@register_model("sale_payment", table_type="system", aliases=["sale_payments", "payment", "payments"])`
  - `@register_model("sales_return_item", table_type="system", aliases=["sales_return_items", "return_items"])`

---

## 5. Dynamic Navigation & CLI Seeding

### 5.1 Seeding Master Navigation Trees
- **File**: `backend/core/management/commands/seed_navigation.py`
- **Changes**: Added full capability definitions and sidebar entries in the database for all new ERP modules:
  - **Sales & POS**: Root `/sales`, submenus `/sales/index` (Orders) and `/sales/create` (POS Billing).
  - **Customer Returns**: Root `/returns`, submenus `/returns/index` (RMA Registry) and `/returns/create` (Initiate Return).
  - **Payment Operations**: Root `/payments`, submenus `/payments/index` (Collections) and `/payments/refunds` (Refund Ledger).
  - **Reports & Analytics**: Submenus for Sales Summary, Customer Purchases, Payment Reconciliation, Stock In/Out Summary, and Detailed Stock Report.
  - **Store Settings**: Submenus for Store Profile, Staff Directory, and Roles & Permissions.

### 5.2 Frontend Sidebar Navigation Fallback
- **File**: `frontend/src/components/Sidebar.jsx`
- **Changes**: Updated fallback navigation array with all 9 master menus and imported new Lucide icons (`ShoppingBag`, `CreditCard`, `Lock`, `RotateCcw`, `ShieldCheck`).

---

## 6. Storefront & Customer Experience Suite (46 Pages)

Each concept directory under `frontend/src/pages/` contains both `index.jsx` (listing/overview) and `create.jsx` (creation/entry/submission):

### 6.1 Shopping (`frontend/src/pages/shopping/`)
1. **`home/`** (`index.jsx`, `create.jsx`): Hero banners, trending products carousel, category tiles, newsletter signup.
2. **`products/`** (`index.jsx`, `create.jsx`): Filterable product catalogue, category chips, price range slider, sort dropdown.
3. **`product-details/`** (`index.jsx`, `create.jsx`): Multi-image carousel, variant attribute selectors, live stock check, Add-to-Cart.
4. **`search/`** (`index.jsx`, `create.jsx`): Instant search query results, facet filters, empty-state suggestions.
5. **`cart/`** (`index.jsx`, `create.jsx`): Line items table, quantity increment/decrement, coupon redemption, estimated taxes.
6. **`checkout/`** (`index.jsx`, `create.jsx`): Address picker, shipping rate selector, payment mode selector, order placement.
7. **`order-confirmation/`** (`index.jsx`, `create.jsx`): Success confirmation, receipt breakdown, shipping status, tracking link.

### 6.2 Customer Account (`frontend/src/pages/customer-account/`)
1. **`auth/`** (`index.jsx`, `create.jsx`): Dual Sign In / Sign Up tabs with validation and token handling.
2. **`profile/`** (`index.jsx`, `create.jsx`): Personal contact details, account tier, password change dialog.
3. **`orders/`** (`index.jsx`, `create.jsx`): Order history, fulfillment badges, re-order and invoice reprint actions.
4. **`addresses/`** (`index.jsx`, `create.jsx`): Address book manager, billing/shipping flags, add address modal.
5. **`reset-password/`** (`index.jsx`, `create.jsx`): Mobile/email OTP verification and new password configuration.

### 6.3 Help & Policies (`frontend/src/pages/help-policies/`)
1. **`contact/`** (`index.jsx`, `create.jsx`): Support ticket creation form, hotline details, office location.
2. **`faq/`** (`index.jsx`, `create.jsx`): Categorized accordion FAQ items with instant search.
3. **`shipping/`** (`index.jsx`, `create.jsx`): Delivery turnaround SLA, courier partners, shipping rates.
4. **`returns/`** (`index.jsx`, `create.jsx`): 7-day return policy guidelines, eligibility checklist, refund steps.
5. **`privacy-policy/`** (`index.jsx`, `create.jsx`): Privacy standards, cookies, payment encryption terms.
6. **`terms/`** (`index.jsx`, `create.jsx`): Terms of service, customer rights, merchant jurisdiction.

### 6.4 Useful Additions (`frontend/src/pages/useful-additions/`)
1. **`about/`** (`index.jsx`, `create.jsx`): Brand heritage, craftsmanship story, executive milestones.
2. **`reviews/`** (`index.jsx`, `create.jsx`): Customer feedback feed, verified purchase badges, review submission form.
3. **`wishlist/`** (`index.jsx`, `create.jsx`): Saved products registry, price drop badges, move-to-cart action.
4. **`track-order/`** (`index.jsx`, `create.jsx`): Real-time milestone tracker (Confirmed → Dispatched → In Transit → Delivered).
5. **`promotions/`** (`index.jsx`, `create.jsx`): Active promotional deals, coupon vouchers, coupon claim actions.

---

## 7. Core ERP Business Operations Suite (38 Pages)

Built strictly in accordance with the requested architecture diagram:

```
src/
└── pages/
    ├── sales/
    │   ├── create/
    │   ├── index/
    │   └── details/
    ├── returns/
    │   ├── create/
    │   └── index/
    ├── payments/
    │   ├── index/
    │   └── refunds/
    ├── catalogue/
    │   └── vendors/
    │       ├── create/
    │       └── index/
    ├── inward/
    │   ├── create/
    │   └── details/
    ├── reports/
    │   ├── sales-summary/
    │   ├── customer-purchases/
    │   └── payments/
    └── settings/
        ├── store/
        ├── staff/
        └── roles-permissions/
```

### 7.1 Sales Module (`src/pages/sales/`)
- **`sales/create/index.jsx` & `create.jsx` (Point of Sale Counter Billing)**:
  - Rapid search and dropdown selection for registered customers or guest walk-ins.
  - Multi-item line table with variant selection, dynamic pricing, GST tax computation (0%, 5%, 12%, 18%, 28%), line discounts, and line totals.
  - Payment method selector (Cash, UPI, Card, Net Banking) and immediate submission generating `Sale`, `SaleItem`, and `SalePayment` records.
- **`sales/index/index.jsx` & `create.jsx` (Sales Orders Registry)**:
  - Table of historical sales orders with real-time text search, order status filters (`completed`, `draft`, `cancelled`), and payment status filters (`paid`, `unpaid`, `partially_paid`, `refunded`).
  - Rule 2 single-line metric summary bar.
- **`sales/details/index.jsx` & `create.jsx` (Order Invoice & Tracking)**:
  - Detailed breakdown of order lines, customer billing credentials, applied discounts, GST breakdown, and payment transactions.
  - Quick action buttons: "Print Invoice" (`window.print()`) and "Initiate Return" (links directly to `/returns/create?sale_id=...`).
- **`sales/index.jsx`**: Root redirect to `/sales/index`.

### 7.2 Returns Module (`src/pages/returns/`)
- **`returns/create/index.jsx` & `create.jsx` (RMA Initiation Form)**:
  - Allows selecting an existing sales order number, automatically pulling all purchased line items.
  - Itemized return selection checkboxes with return quantity adjustments and reason selection (Defective, Wrong Item, Size Mismatch, Buyer Regret).
  - Restockable toggle per line item to differentiate between shelf restockable inventory and damaged write-offs.
  - Calculates estimated refund value and persists `SalesReturn` and `SalesReturnItem` records.
- **`returns/index/index.jsx` & `create.jsx` (Returns Registry)**:
  - Registry of RMA requests filterable by status (`requested`, `approved`, `received`, `refunded`, `completed`, `rejected`).
  - Quick-action buttons to approve, mark items received, or trigger refund issuance.
- **`returns/index.jsx`**: Root redirect to `/returns/index`.

### 7.3 Payments Module (`src/pages/payments/`)
- **`payments/index/index.jsx` & `create.jsx` (Collections Ledger & Receipt Form)**:
  - Comprehensive ledger of all cash/digital inflows and disbursements.
  - Form to record manual counter receipts or reconcile offline bank transfers against sales orders.
  - Rule 2 single-line summary bar tracking total inflow, refunds, and net cash flow.
- **`payments/refunds/index.jsx` & `create.jsx` (Customer Refund Disbursal)**:
  - Dedicated ledger tracking approved customer refunds.
  - Refund processing voucher form connecting directly to return authorizations and updating return status to `refunded`.
- **`payments/index.jsx`**: Root redirect to `/payments/index`.

### 7.4 Catalogue Vendors Module (`src/pages/catalogue/vendors/`)
- Created `catalogue/vendors/create/index.jsx`, `catalogue/vendors/create/create.jsx`, `catalogue/vendors/index/index.jsx`, and `catalogue/vendors/index/create.jsx`.
- Preserved existing `catalogue/vendors/index.jsx` and `catalogue/vendors/create.jsx` to ensure backward compatibility across all route variations.

### 7.5 Inward Module (`src/pages/inward/`)
- **`inward/create/index.jsx` & `create.jsx` (Goods Receipt Note - GRN Form)**:
  - Form for warehouse inwards: supplier lookup, vendor invoice number, invoice date, and warehouse bay selection.
  - Multi-line item entry: product variant lookup, received quantity, unit purchase cost, GST tax slab, and calculated totals.
  - Persists `GoodsReceipt` and `GoodsReceiptItem` records.
- **`inward/details/index.jsx` & `create.jsx` (GRN Inspection View)**:
  - Comprehensive inspection view of received shipments with vendor credentials, received line items, and tax breakdown.
  - Direct print action for GRN receipt slips.
- Preserved existing `inward/purchase/index.jsx` and `create.jsx`.

### 7.6 Reports & Analytics Module (`src/pages/reports/`)
- **`reports/sales-summary/index.jsx` & `create.jsx` (Sales Volume & Tax Report)**:
  - Period filtering: Today, Last 7 Days, Last 30 Days, All-Time.
  - Financial breakdown: Gross sales, tax collected (CGST/SGST), discounts given, and net revenue.
  - Built-in "Export CSV" functionality.
- **`reports/customer-purchases/index.jsx` & `create.jsx` (Customer LTV & Frequency)**:
  - Customer purchase analytics calculating lifetime spend, order count, and Average Order Value (AOV).
  - Search by customer name, phone, or email with CSV export.
- **`reports/payments/index.jsx` & `create.jsx` (Payment Method Reconciliation)**:
  - Breakdown of collections and payouts across Cash, UPI, Card, and Bank Transfer.
  - Net cash intake analysis with CSV export.
- Preserved existing `reports/stock-summary/` and `reports/detailed-stock/`.

### 7.7 Settings Module (`src/pages/settings/`)
- **`settings/store/index.jsx` & `create.jsx` (Corporate Store Profile)**:
  - Profile manager: legal name, brand display name, GSTIN, registered address, phone, website, and social links.
  - System parameters table showing currency format (INR `₹`), invoice numbering, and operating defaults.
  - Update form updating `Company` and `GeneralSetting` records.
- **`settings/staff/index.jsx` & `create.jsx` (Staff & Personnel Directory)**:
  - Employee directory displaying usernames, assigned roles, contact details, and account status (Active/Inactive).
  - Add staff form with role assignment and password credentials.
- **`settings/roles-permissions/index.jsx` & `create.jsx` (Security Roles & RBAC)**:
  - Security roles registry showing role privilege tiers (Superadmin bypass vs Policy scoped), member count, and status.
  - Create/edit role form with superadmin bypass toggle and permission capabilities.
- **`settings/index.jsx`**: Root redirect to `/settings/store`.

---

## 8. UI Formatting Rules Implementation

Every table, summary bar, and card adheres to the system UI rules:

### Rule 1: Zero-Value Representation as Em-Dash (`—`)
- **Mandate**: Under no circumstances should `0`, `0.00`, `+0`, or `₹0.00` appear in data tables, summaries, or reports. All zero or null quantities and amounts must display as an em-dash (`—`).
- **Standard Formatters Applied**:
  ```javascript
  const formatQty = (val) => {
    const num = Number(val);
    return !num || num === 0 ? "—" : num.toLocaleString();
  };

  const formatCurrency = (val) => {
    const num = Number(val);
    return !num || num === 0
      ? "—"
      : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  ```

### Rule 2: Minimalist Single-Line Metric Summary Bar
- **Mandate**: Avoid tall, multi-card KPI grids that consume vertical screen real estate. Render summaries in a sleek, horizontal, single-line metrics bar directly above tables.
- **Standard Presentation Pattern**:
  ```jsx
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
    <span>Total Orders: <strong className="text-text-primary font-medium">{formatQty(totalOrders)}</strong></span>
    <span>•</span>
    <span>Total Volume: <strong className="text-emerald-400 font-medium">{formatCurrency(totalVolume)}</strong></span>
    <span>•</span>
    <span>Paid in Full: <strong className="text-text-primary font-medium">{formatQty(paidOrders)}</strong></span>
    <span>•</span>
    <span>Pending RMA: <strong className="text-amber-400 font-medium">{formatQty(pendingRma)}</strong></span>
  </div>
  ```

---

## 9. Complete Directory & File Audit

### Modified Existing Files (13 Files)
| File Path | Description of Changes |
| :--- | :--- |
| `backend/config/settings.py` | Defensively parsed `MYSQL_PORT` with integer conversion and fallback to `3306`. |
| `backend/.env.example` | Updated local MySQL connection template to `127.0.0.1:3306/axinix_ecommerce_db`. |
| `backend/catalogue/models.py` | Added `user` ForeignKey to `CustomerMaster`. |
| `backend/orders/models.py` | Added customer fields to `Sale`, linked `SalePayment` to `CustomerMaster` and `SalesReturn`, added `@register_model` decorators. |
| `backend/orders/admin.py` | Registered all order, purchase, payment, and return models with tabular inlines. |
| `backend/storefront/models.py` | Implemented 15 full models for customer shopping, policies, carts, reviews, and tracking. |
| `backend/storefront/admin.py` | Registered all storefront models in Django administration. |
| `backend/users/management/commands/setup_initial_db.py` | Added `admin` account provisioning and automated calls to `seed_states` and `seed_navigation`. |
| `backend/core/management/commands/seed_navigation.py` | Registered navigation trees and RBAC capabilities for Sales, Returns, Payments, Settings, and Reports. |
| `frontend/src/context/settingsProvider.jsx` | Guarded `general_setting` queries with token checks to prevent unauthenticated 401 errors. |
| `frontend/src/layouts/baseLayouts.jsx` | Whitelisted public consumer storefront routes (`/shopping`, `/customer-account`, `/help-policies`, `/useful-additions`). |
| `frontend/src/pages/login.jsx` | Added pure JavaScript SHA-256 fallback for non-secure HTTP contexts. |
| `frontend/src/components/Sidebar.jsx` | Updated fallback navigation array with all 9 master roots and Lucide icons. |

### Backend Database Migration Files Created (4 Migrations)
1. `backend/catalogue/migrations/0007_customermaster_user.py`
2. `backend/orders/migrations/0002_sale_carrier_sale_customer_sale_order_status_and_more.py`
3. `backend/orders/migrations/0003_salepayment_customer_salepayment_sales_return_and_more.py`
4. `backend/storefront/migrations/0001_initial.py`

### Backend Management Commands Created
- `backend/storefront/management/commands/seed_storefront.py`: Comprehensive demographic data seeder for banners, FAQs, reviews, policies, and coupons.

### Frontend Pages Created (84 Total Page Components)
- **Sales (7 files)**:
  - `frontend/src/pages/sales/index.jsx`
  - `frontend/src/pages/sales/create/index.jsx` & `create.jsx`
  - `frontend/src/pages/sales/index/index.jsx` & `create.jsx`
  - `frontend/src/pages/sales/details/index.jsx` & `create.jsx`
- **Returns (5 files)**:
  - `frontend/src/pages/returns/index.jsx`
  - `frontend/src/pages/returns/create/index.jsx` & `create.jsx`
  - `frontend/src/pages/returns/index/index.jsx` & `create.jsx`
- **Payments (5 files)**:
  - `frontend/src/pages/payments/index.jsx`
  - `frontend/src/pages/payments/index/index.jsx` & `create.jsx`
  - `frontend/src/pages/payments/refunds/index.jsx` & `create.jsx`
- **Catalogue Vendors (4 files)**:
  - `frontend/src/pages/catalogue/vendors/create/index.jsx` & `create.jsx`
  - `frontend/src/pages/catalogue/vendors/index/index.jsx` & `create.jsx`
- **Inward (4 files)**:
  - `frontend/src/pages/inward/create/index.jsx` & `create.jsx`
  - `frontend/src/pages/inward/details/index.jsx` & `create.jsx`
- **Reports (6 files)**:
  - `frontend/src/pages/reports/sales-summary/index.jsx` & `create.jsx`
  - `frontend/src/pages/reports/customer-purchases/index.jsx` & `create.jsx`
  - `frontend/src/pages/reports/payments/index.jsx` & `create.jsx`
- **Settings (7 files)**:
  - `frontend/src/pages/settings/index.jsx`
  - `frontend/src/pages/settings/store/index.jsx` & `create.jsx`
  - `frontend/src/pages/settings/staff/index.jsx` & `create.jsx`
  - `frontend/src/pages/settings/roles-permissions/index.jsx` & `create.jsx`
- **Shopping Storefront (14 files)**:
  - `frontend/src/pages/shopping/home/index.jsx` & `create.jsx`
  - `frontend/src/pages/shopping/products/index.jsx` & `create.jsx`
  - `frontend/src/pages/shopping/product-details/index.jsx` & `create.jsx`
  - `frontend/src/pages/shopping/search/index.jsx` & `create.jsx`
  - `frontend/src/pages/shopping/cart/index.jsx` & `create.jsx`
  - `frontend/src/pages/shopping/checkout/index.jsx` & `create.jsx`
  - `frontend/src/pages/shopping/order-confirmation/index.jsx` & `create.jsx`
- **Customer Account (10 files)**:
  - `frontend/src/pages/customer-account/auth/index.jsx` & `create.jsx`
  - `frontend/src/pages/customer-account/profile/index.jsx` & `create.jsx`
  - `frontend/src/pages/customer-account/orders/index.jsx` & `create.jsx`
  - `frontend/src/pages/customer-account/addresses/index.jsx` & `create.jsx`
  - `frontend/src/pages/customer-account/reset-password/index.jsx` & `create.jsx`
- **Help & Policies (12 files)**:
  - `frontend/src/pages/help-policies/contact/index.jsx` & `create.jsx`
  - `frontend/src/pages/help-policies/faq/index.jsx` & `create.jsx`
  - `frontend/src/pages/help-policies/shipping/index.jsx` & `create.jsx`
  - `frontend/src/pages/help-policies/returns/index.jsx` & `create.jsx`
  - `frontend/src/pages/help-policies/privacy-policy/index.jsx` & `create.jsx`
  - `frontend/src/pages/help-policies/terms/index.jsx` & `create.jsx`
- **Useful Additions (10 files)**:
  - `frontend/src/pages/useful-additions/about/index.jsx` & `create.jsx`
  - `frontend/src/pages/useful-additions/reviews/index.jsx` & `create.jsx`
  - `frontend/src/pages/useful-additions/wishlist/index.jsx` & `create.jsx`
  - `frontend/src/pages/useful-additions/track-order/index.jsx` & `create.jsx`
  - `frontend/src/pages/useful-additions/promotions/index.jsx` & `create.jsx`

---

## 10. Verification & Build Validation

1. **Frontend Production Build**:
   - Executed `npm run build` with Vite.
   - Result: Built 1,800+ modules with **0 errors** in 4.45s.
2. **Backend Server & Migrations**:
   - `python manage.py runserver` running without warnings on `http://127.0.0.1:8000`.
   - All 4 new migration files applied cleanly with 0 pending operations.
3. **Frontend Dev Server**:
   - `npm run dev` running on `http://localhost:5173`.
4. **Formatting Compliance**:
   - 100% compliance with UI Rule 1 (`formatQty` and `formatCurrency` returning em-dash `—` for zero values).
   - 100% compliance with UI Rule 2 (horizontal single-line summary bars; zero bulky KPI card blocks).
