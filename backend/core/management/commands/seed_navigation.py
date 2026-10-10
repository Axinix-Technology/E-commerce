from django.core.management.base import BaseCommand
from core.models import Sidebar, Capability


class Command(BaseCommand):
    help = "Seeds Master Navigation Sidebars and Capabilities matching tracker-v2 architecture"

    def handle(self, *args, **options):
        self.stdout.write("Seeding Capabilities and Sidebars...")

        # 1. Seed Capabilities
        capabilities_def = [
            # Core
            ("core.dashboard.read", "read", "View Dashboard", "Access platform overview metrics", "core"),

            # Catalogue
            ("catalogue.categories.read", "read", "View Categories", "View category master list", "catalogue"),
            ("catalogue.categories.create", "create", "Create Category", "Create product categories", "catalogue"),
            ("catalogue.categories.update", "update", "Update Category", "Edit existing category details", "catalogue"),
            ("catalogue.categories.delete", "delete", "Delete Category", "Soft delete category", "catalogue"),

            ("catalogue.products.read", "read", "View Products", "View products catalogue", "catalogue"),
            ("catalogue.products.create", "create", "Create Product", "Create product", "catalogue"),
            ("catalogue.products.update", "update", "Update Product", "Update product", "catalogue"),
            ("catalogue.products.delete", "delete", "Delete Product", "Delete product", "catalogue"),

            ("catalogue.vendors.read", "read", "View Vendors", "View vendor master records", "catalogue"),
            ("catalogue.vendors.create", "create", "Create Vendor", "Register new vendor/supplier", "catalogue"),
            ("catalogue.vendors.update", "update", "Update Vendor", "Edit vendor details", "catalogue"),
            ("catalogue.vendors.delete", "delete", "Delete Vendor", "Soft delete vendor", "catalogue"),

            ("catalogue.customers.read", "read", "View Customers", "View registered customers", "catalogue"),
            ("catalogue.customers.create", "create", "Create Customer", "Register customer/business", "catalogue"),
            ("catalogue.customers.update", "update", "Update Customer", "Edit customer details", "catalogue"),
            ("catalogue.customers.delete", "delete", "Delete Customer", "Soft delete customer", "catalogue"),

            ("catalogue.gst.read", "read", "View GST Slabs", "View tax slabs and rates", "catalogue"),
            ("catalogue.gst.create", "create", "Create GST Slab", "Add new GST tax rate", "catalogue"),
            ("catalogue.gst.update", "update", "Update GST Slab", "Edit GST tax rate", "catalogue"),
            ("catalogue.gst.delete", "delete", "Delete GST Slab", "Delete GST tax rate", "catalogue"),

            # Inward
            ("inward.purchase.read", "read", "View Inwards", "View purchase inward records", "inward"),
            ("inward.purchase.create", "create", "Create Inward", "Receive purchase shipment", "inward"),

            # Inventory Operations
            ("inventory.tagging.read", "read", "View Barcode Tagging", "Manage physical barcode tags", "inventory"),
            ("inventory.movement.create", "create", "Stock Movement", "Move stock across buckets/memos", "inventory"),
            ("inventory.transfer.read", "read", "Branch Transfer", "Multi-branch stock transfer", "inventory"),

            # Reports & Analytics
            ("reports.stock_summary.read", "read", "View Stock Summary", "Aggregated 4-pillar stock report", "reports"),
            ("reports.detailed_stock.read", "read", "View Detailed Stock", "Unit-level barcode registry report", "reports"),
        ]

        # Purge any obsolete variant capabilities
        Capability.objects.filter(key__startswith="catalogue.variants").delete()

        cap_map = {}
        for key, action, label, desc, mod in capabilities_def:
            cap, _ = Capability.objects.update_or_create(
                key=key,
                defaults={
                    "action": action,
                    "label": label,
                    "description": desc,
                    "module": mod,
                    "status": 1,
                }
            )
            cap_map[key] = cap

        # 2. Seed Root Sidebars
        dashboard_sb, _ = Sidebar.objects.update_or_create(
            main_route="/dashboard",
            defaults={
                "title": "Dashboard",
                "icon": "LayoutDashboard",
                "icon_package": "lucide",
                "visibility": "protected",
                "module_key": "core",
                "order": 1,
                "is_parent": False,
                "has_children": False,
                "status": 1,
            }
        )

        catalogue_root, _ = Sidebar.objects.update_or_create(
            title="Catalogue Master",
            is_parent=True,
            defaults={
                "title": "Catalogue Master",
                "icon": "Tags",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "catalogue",
                "order": 2,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        inward_root, _ = Sidebar.objects.update_or_create(
            title="Inward Management",
            is_parent=True,
            defaults={
                "title": "Inward Management",
                "icon": "Truck",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "inward",
                "order": 3,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        inventory_root, _ = Sidebar.objects.update_or_create(
            title="Inventory Operations",
            is_parent=True,
            defaults={
                "title": "Inventory Operations",
                "icon": "Boxes",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "inventory",
                "order": 4,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        reports_root, _ = Sidebar.objects.update_or_create(
            title="Reports & Analytics",
            is_parent=True,
            defaults={
                "title": "Reports & Analytics",
                "icon": "BarChart3",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "reports",
                "order": 5,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        sales_root, _ = Sidebar.objects.update_or_create(
            title="Sales & POS",
            is_parent=True,
            defaults={
                "title": "Sales & POS",
                "icon": "ShoppingBag",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "sales",
                "order": 6,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        returns_root, _ = Sidebar.objects.update_or_create(
            title="Customer Returns",
            is_parent=True,
            defaults={
                "title": "Customer Returns",
                "icon": "RotateCcw",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "returns",
                "order": 7,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        payments_root, _ = Sidebar.objects.update_or_create(
            title="Payment Operations",
            is_parent=True,
            defaults={
                "title": "Payment Operations",
                "icon": "CreditCard",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "payments",
                "order": 8,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        settings_root, _ = Sidebar.objects.update_or_create(
            title="Store Settings",
            is_parent=True,
            defaults={
                "title": "Store Settings",
                "icon": "ShieldCheck",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "settings",
                "order": 9,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        # 2b. Masters Root
        masters_root, _ = Sidebar.objects.update_or_create(
            title="Master Setup",
            is_parent=True,
            defaults={
                "title": "Master Setup",
                "icon": "FolderKanban",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "masters",
                "order": 2,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        # 2c. Purchase Root
        purchase_root, _ = Sidebar.objects.update_or_create(
            title="Purchase & Procurement",
            is_parent=True,
            defaults={
                "title": "Purchase & Procurement",
                "icon": "Truck",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "purchase",
                "order": 4,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        # 2d. Billing Root
        billing_root, _ = Sidebar.objects.update_or_create(
            title="Billing & Cash",
            is_parent=True,
            defaults={
                "title": "Billing & Cash",
                "icon": "Wallet",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "billing",
                "order": 7,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        # 2e. Orders Root
        orders_root, _ = Sidebar.objects.update_or_create(
            title="Orders & Advances",
            is_parent=True,
            defaults={
                "title": "Orders & Advances",
                "icon": "Coins",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "orders",
                "order": 8,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        # 2f. Audit Log Root
        audit_log_root, _ = Sidebar.objects.update_or_create(
            title="Audit Logs",
            is_parent=False,
            defaults={
                "title": "Audit Logs",
                "icon": "ShieldAlert",
                "icon_package": "lucide",
                "main_route": "/audit-log",
                "visibility": "protected",
                "module_key": "audit-log",
                "order": 13,
                "is_parent": False,
                "has_children": False,
                "status": 1,
            }
        )

        # 3. Masters Submenus
        masters_submenus = [
            {"title": "Employees Directory", "icon": "Users", "main_route": "/masters/employees", "order": 1, "parent": masters_root, "caps": []},
            {"title": "Branches", "icon": "Building", "main_route": "/masters/branches", "order": 2, "parent": masters_root, "caps": []},
            {"title": "Professions", "icon": "Briefcase", "main_route": "/masters/professions", "order": 3, "parent": masters_root, "caps": []},
            {"title": "Departments", "icon": "Network", "main_route": "/masters/departments", "order": 4, "parent": masters_root, "caps": []},
            {"title": "Designations", "icon": "Award", "main_route": "/masters/designations", "order": 5, "parent": masters_root, "caps": []},
            {"title": "Payment Gateways", "icon": "CreditCard", "main_route": "/masters/gateways", "order": 6, "parent": masters_root, "caps": []},
            {"title": "Shop Integrations", "icon": "ShoppingBag", "main_route": "/masters/shop-integrations", "order": 7, "parent": masters_root, "caps": []},
        ]

        # 4. Catalogue Submenus
        catalogue_submenus = [
            {"title": "Category", "icon": "FolderTree", "main_route": "/catalogue/categories", "order": 1, "parent": catalogue_root, "caps": ["catalogue.categories.read"]},
            {"title": "Product", "icon": "Package", "main_route": "/catalogue/products", "order": 2, "parent": catalogue_root, "caps": ["catalogue.products.read"]},
            {"title": "Vendor Registration", "icon": "Building2", "main_route": "/catalogue/vendors", "order": 3, "parent": catalogue_root, "caps": ["catalogue.vendors.read"]},
            {"title": "Customer Master", "icon": "Users", "main_route": "/catalogue/customers", "order": 4, "parent": catalogue_root, "caps": ["catalogue.customers.read"]},
            {"title": "GST Master", "icon": "ReceiptPercent", "main_route": "/catalogue/gst-slabs", "order": 5, "parent": catalogue_root, "caps": ["catalogue.gst.read"]},
            {"title": "Materials & Fabrics", "icon": "Layers", "main_route": "/catalogue/materials", "order": 6, "parent": catalogue_root, "caps": []},
            {"title": "Designs & Patterns", "icon": "Palette", "main_route": "/catalogue/designs", "order": 7, "parent": catalogue_root, "caps": []},
            {"title": "Brands", "icon": "Tag", "main_route": "/catalogue/brands", "order": 8, "parent": catalogue_root, "caps": []},
            {"title": "Sizes", "icon": "Ruler", "main_route": "/catalogue/sizes", "order": 9, "parent": catalogue_root, "caps": []},
            {"title": "Age Groups", "icon": "UserCheck", "main_route": "/catalogue/age-groups", "order": 10, "parent": catalogue_root, "caps": []},
        ]

        # 5. Purchase Submenus
        purchase_submenus = [
            {"title": "Lot Generation", "icon": "Boxes", "main_route": "/purchase/lot-generate", "order": 1, "parent": purchase_root, "caps": []},
            {"title": "Supplier Outstanding", "icon": "DollarSign", "main_route": "/purchase/supplier-outstanding", "order": 2, "parent": purchase_root, "caps": []},
            {"title": "GRN Report", "icon": "FileText", "main_route": "/purchase/reports/grn-report", "order": 3, "parent": purchase_root, "caps": []},
            {"title": "Purchase Return Report", "icon": "RotateCcw", "main_route": "/purchase/reports/purchase-return-report", "order": 4, "parent": purchase_root, "caps": []},
            {"title": "Supplier Ledger", "icon": "BookOpen", "main_route": "/purchase/reports/supplier-ledger", "order": 5, "parent": purchase_root, "caps": []},
            {"title": "Supplier Payment Report", "icon": "CreditCard", "main_route": "/purchase/reports/supplier-payment-report", "order": 6, "parent": purchase_root, "caps": []},
        ]

        # 6. Inward Submenus
        inward_submenus = [
            {"title": "Purchase Inward (GRN)", "icon": "PackageCheck", "main_route": "/inward/purchase", "order": 1, "parent": inward_root, "caps": ["inward.purchase.read"]},
        ]

        # 7. Inventory Operations Submenus
        inventory_submenus = [
            {"title": "Barcode Tagging & Units", "icon": "QrCode", "main_route": "/inventory/tagging", "order": 1, "parent": inventory_root, "caps": ["inventory.tagging.read"]},
            {"title": "Stock Movements & Memo", "icon": "ArrowRightLeft", "main_route": "/inventory/movement", "order": 2, "parent": inventory_root, "caps": ["inventory.movement.create"]},
            {"title": "Branch Transfers", "icon": "Network", "main_route": "/inventory/branch-transfer", "order": 3, "parent": inventory_root, "caps": ["inventory.transfer.read"]},
            {"title": "Barcode Edit", "icon": "Edit3", "main_route": "/inventory/barcode-edit", "order": 4, "parent": inventory_root, "caps": []},
            {"title": "Duplicate Barcode Scan", "icon": "Copy", "main_route": "/inventory/duplicate-barcode", "order": 5, "parent": inventory_root, "caps": []},
            {"title": "Barcode Edit Log", "icon": "FileSpreadsheet", "main_route": "/inventory/barcode-edit-log", "order": 6, "parent": inventory_root, "caps": []},
            {"title": "Duplicate Barcode Log", "icon": "AlertTriangle", "main_route": "/inventory/duplicate-barcode-log", "order": 7, "parent": inventory_root, "caps": []},
            {"title": "Order Barcode Link", "icon": "Link", "main_route": "/inventory/order-link", "order": 8, "parent": inventory_root, "caps": []},
            {"title": "Order Barcode Unlink", "icon": "Unlink", "main_route": "/inventory/order-unlink", "order": 9, "parent": inventory_root, "caps": []},
            {"title": "Re-barcoding Workflow", "icon": "QrCode", "main_route": "/inventory/re-barcoding", "order": 10, "parent": inventory_root, "caps": []},
        ]

        # 8. Billing Submenus
        billing_submenus = [
            {"title": "Petty Cash Vouchers", "icon": "Wallet", "main_route": "/billing/petty-cash", "order": 1, "parent": billing_root, "caps": []},
            {"title": "Billing Receipts", "icon": "Receipt", "main_route": "/billing/receipts", "order": 2, "parent": billing_root, "caps": []},
        ]

        # 9. Orders Submenus
        orders_submenus = [
            {"title": "Customer Advances", "icon": "Coins", "main_route": "/orders/advance", "order": 1, "parent": orders_root, "caps": []},
            {"title": "Orders Report", "icon": "FileBarChart", "main_route": "/orders/report", "order": 2, "parent": orders_root, "caps": []},
        ]

        # 10. Reports & Analytics Submenus
        reports_submenus = [
            {"title": "Sales Summary", "icon": "BarChart3", "main_route": "/reports/sales-summary", "order": 1, "parent": reports_root, "caps": []},
            {"title": "Customer Purchases", "icon": "Users", "main_route": "/reports/customer-purchases", "order": 2, "parent": reports_root, "caps": []},
            {"title": "Payment Reconciliation", "icon": "CreditCard", "main_route": "/reports/payments", "order": 3, "parent": reports_root, "caps": []},
            {"title": "Stock In/Out Summary", "icon": "FileSpreadsheet", "main_route": "/reports/stock-summary", "order": 4, "parent": reports_root, "caps": ["reports.stock_summary.read"]},
            {"title": "Detailed Stock Report", "icon": "Barcode", "main_route": "/reports/detailed-stock", "order": 5, "parent": reports_root, "caps": ["reports.detailed_stock.read"]},
            {"title": "GST Tax Report", "icon": "ReceiptPercent", "main_route": "/reports/gst", "order": 6, "parent": reports_root, "caps": []},
            {"title": "Available Sellable Stock", "icon": "PackageCheck", "main_route": "/reports/available-stock", "order": 7, "parent": reports_root, "caps": []},
            {"title": "Stock In/Out Movement", "icon": "ArrowRightLeft", "main_route": "/reports/stock-in-out", "order": 8, "parent": reports_root, "caps": []},
            {"title": "Branch Transfer Report", "icon": "Truck", "main_route": "/reports/branch-transfer", "order": 9, "parent": reports_root, "caps": []},
            {"title": "Lot vs Barcode", "icon": "Barcode", "main_route": "/reports/lot-vs-barcode", "order": 10, "parent": reports_root, "caps": []},
            {"title": "Re-barcoding Report", "icon": "QrCode", "main_route": "/reports/re-barcoding", "order": 11, "parent": reports_root, "caps": []},
        ]

        # 11. Sales Submenus
        sales_submenus = [
            {"title": "Sales Orders", "icon": "ShoppingBag", "main_route": "/sales/index", "order": 1, "parent": sales_root, "caps": []},
            {"title": "New Sale (POS)", "icon": "Receipt", "main_route": "/sales/create", "order": 2, "parent": sales_root, "caps": []},
        ]

        # 12. Returns Submenus
        returns_submenus = [
            {"title": "Returns (RMA)", "icon": "RotateCcw", "main_route": "/returns/index", "order": 1, "parent": returns_root, "caps": []},
            {"title": "Initiate Return", "icon": "ArrowRightLeft", "main_route": "/returns/create", "order": 2, "parent": returns_root, "caps": []},
        ]

        # 13. Payments Submenus
        payments_submenus = [
            {"title": "Payment Collections", "icon": "CreditCard", "main_route": "/payments/index", "order": 1, "parent": payments_root, "caps": []},
            {"title": "Customer Refunds", "icon": "RotateCcw", "main_route": "/payments/refunds", "order": 2, "parent": payments_root, "caps": []},
        ]

        # 14. Settings Submenus
        settings_submenus = [
            {"title": "Store Profile", "icon": "Building2", "main_route": "/settings/store", "order": 1, "parent": settings_root, "caps": []},
            {"title": "Roles & Permissions", "icon": "ShieldCheck", "main_route": "/settings/roles-permissions", "order": 2, "parent": settings_root, "caps": []},
        ]

        # 15. Consumer Storefront Roots & Submenus
        shopping_root, _ = Sidebar.objects.update_or_create(
            title="Shopping",
            is_parent=True,
            defaults={
                "title": "Shopping",
                "icon": "ShoppingBag",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "shopping",
                "order": 14,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        customer_root, _ = Sidebar.objects.update_or_create(
            title="Customer Account",
            is_parent=True,
            defaults={
                "title": "Customer Account",
                "icon": "Users",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "customer_account",
                "order": 15,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        help_root, _ = Sidebar.objects.update_or_create(
            title="Help & Policies",
            is_parent=True,
            defaults={
                "title": "Help & Policies",
                "icon": "ShieldCheck",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "help_policies",
                "order": 16,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        useful_root, _ = Sidebar.objects.update_or_create(
            title="Useful Additions",
            is_parent=True,
            defaults={
                "title": "Useful Additions",
                "icon": "Tags",
                "icon_package": "lucide",
                "main_route": None,
                "visibility": "protected",
                "module_key": "useful_additions",
                "order": 17,
                "is_parent": True,
                "has_children": True,
                "status": 1,
            }
        )

        shopping_submenus = [
            {"title": "Storefront Home", "icon": "Package", "main_route": "/shopping", "order": 1, "parent": shopping_root, "caps": []},
            {"title": "Product Catalogue", "icon": "Tags", "main_route": "/shopping/products", "order": 2, "parent": shopping_root, "caps": []},
            {"title": "Shopping Cart", "icon": "Boxes", "main_route": "/shopping/cart", "order": 3, "parent": shopping_root, "caps": []},
            {"title": "Checkout", "icon": "Receipt", "main_route": "/shopping/checkout", "order": 4, "parent": shopping_root, "caps": []},
        ]

        customer_submenus = [
            {"title": "Sign In / Sign Up", "icon": "Users", "main_route": "/customer-account/auth", "order": 1, "parent": customer_root, "caps": []},
            {"title": "Account Profile", "icon": "Building2", "main_route": "/customer-account/profile", "order": 2, "parent": customer_root, "caps": []},
            {"title": "Order History", "icon": "PackageCheck", "main_route": "/customer-account/orders", "order": 3, "parent": customer_root, "caps": []},
            {"title": "Saved Addresses", "icon": "FolderTree", "main_route": "/customer-account/addresses", "order": 4, "parent": customer_root, "caps": []},
        ]

        help_submenus = [
            {"title": "Contact Support", "icon": "Users", "main_route": "/help-policies/contact", "order": 1, "parent": help_root, "caps": []},
            {"title": "FAQ & Help", "icon": "FileSpreadsheet", "main_route": "/help-policies/faq", "order": 2, "parent": help_root, "caps": []},
            {"title": "Shipping Policy", "icon": "Truck", "main_route": "/help-policies/shipping", "order": 3, "parent": help_root, "caps": []},
            {"title": "Returns & Refunds", "icon": "ArrowRightLeft", "main_route": "/help-policies/returns", "order": 4, "parent": help_root, "caps": []},
            {"title": "Privacy Policy", "icon": "ShieldCheck", "main_route": "/help-policies/privacy-policy", "order": 5, "parent": help_root, "caps": []},
            {"title": "Terms & Conditions", "icon": "FileSpreadsheet", "main_route": "/help-policies/terms", "order": 6, "parent": help_root, "caps": []},
        ]

        useful_submenus = [
            {"title": "About Us", "icon": "Building2", "main_route": "/useful-additions/about", "order": 1, "parent": useful_root, "caps": []},
            {"title": "Customer Reviews", "icon": "FileSpreadsheet", "main_route": "/useful-additions/reviews", "order": 2, "parent": useful_root, "caps": []},
            {"title": "Saved Wishlist", "icon": "Tags", "main_route": "/useful-additions/wishlist", "order": 3, "parent": useful_root, "caps": []},
            {"title": "Track an Order", "icon": "QrCode", "main_route": "/useful-additions/track-order", "order": 4, "parent": useful_root, "caps": []},
            {"title": "Promotions & Sale", "icon": "Tags", "main_route": "/useful-additions/promotions", "order": 5, "parent": useful_root, "caps": []},
        ]

        all_submenus = (
            masters_submenus +
            catalogue_submenus +
            purchase_submenus +
            inward_submenus +
            inventory_submenus +
            billing_submenus +
            orders_submenus +
            reports_submenus +
            sales_submenus +
            returns_submenus +
            payments_submenus +
            settings_submenus +
            shopping_submenus +
            customer_submenus +
            help_submenus +
            useful_submenus
        )

        for sm in all_submenus:
            sb_child, _ = Sidebar.objects.update_or_create(
                main_route=sm["main_route"],
                defaults={
                    "title": sm["title"],
                    "icon": sm["icon"],
                    "icon_package": "lucide",
                    "visibility": "protected",
                    "module_key": sm["main_route"].split("/")[1],
                    "parent": sm["parent"],
                    "is_parent": False,
                    "has_children": False,
                    "order": sm["order"],
                    "status": 1,
                }
            )
            for ckey in sm.get("caps", []):
                if ckey in cap_map:
                    sb_child.capabilities.add(cap_map[ckey])

        self.stdout.write(self.style.SUCCESS("All navigation sidebars and capabilities successfully seeded!"))

