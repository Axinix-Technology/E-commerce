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

        # 3. Seed Catalogue Submenus
        catalogue_submenus = [
            {
                "title": "Category",
                "icon": "FolderTree",
                "main_route": "/catalogue/categories",
                "order": 1,
                "parent": catalogue_root,
                "caps": ["catalogue.categories.read"],
            },
            {
                "title": "Product",
                "icon": "Package",
                "main_route": "/catalogue/products",
                "order": 2,
                "parent": catalogue_root,
                "caps": ["catalogue.products.read"],
            },
            {
                "title": "Vendor Registration",
                "icon": "Building2",
                "main_route": "/catalogue/vendors",
                "order": 3,
                "parent": catalogue_root,
                "caps": ["catalogue.vendors.read"],
            },
            {
                "title": "Customer Master",
                "icon": "Users",
                "main_route": "/catalogue/customers",
                "order": 4,
                "parent": catalogue_root,
                "caps": ["catalogue.customers.read"],
            },
            {
                "title": "GST Master",
                "icon": "ReceiptPercent",
                "main_route": "/catalogue/gst-slabs",
                "order": 5,
                "parent": catalogue_root,
                "caps": ["catalogue.gst.read"],
            },
        ]

        # 4. Inward Submenus
        inward_submenus = [
            {
                "title": "Purchase Inward (GRN)",
                "icon": "PackageCheck",
                "main_route": "/inward/purchase",
                "order": 1,
                "parent": inward_root,
                "caps": ["inward.purchase.read"],
            },
        ]

        # 5. Inventory Operations Submenus
        inventory_submenus = [
            {
                "title": "Barcode Tagging & Units",
                "icon": "QrCode",
                "main_route": "/inventory/tagging",
                "order": 1,
                "parent": inventory_root,
                "caps": ["inventory.tagging.read"],
            },
            {
                "title": "Stock Movements & Memo",
                "icon": "ArrowRightLeft",
                "main_route": "/inventory/movement",
                "order": 2,
                "parent": inventory_root,
                "caps": ["inventory.movement.create"],
            },
            {
                "title": "Branch Transfers",
                "icon": "Network",
                "main_route": "/inventory/branch-transfer",
                "order": 3,
                "parent": inventory_root,
                "caps": ["inventory.transfer.read"],
            },
        ]

        # 6. Reports & Analytics Submenus
        reports_submenus = [
            {
                "title": "Stock In/Out Summary",
                "icon": "FileSpreadsheet",
                "main_route": "/reports/stock-summary",
                "order": 1,
                "parent": reports_root,
                "caps": ["reports.stock_summary.read"],
            },
            {
                "title": "Detailed Stock Report",
                "icon": "Barcode",
                "main_route": "/reports/detailed-stock",
                "order": 2,
                "parent": reports_root,
                "caps": ["reports.detailed_stock.read"],
            },
        ]

        all_submenus = catalogue_submenus + inward_submenus + inventory_submenus + reports_submenus

        # Clean up any obsolete submenus
        Sidebar.objects.filter(main_route__in=["/catalogue/variants", "/inventory/stock-report"]).delete()

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
            for ckey in sm["caps"]:
                if ckey in cap_map:
                    sb_child.capabilities.add(cap_map[ckey])

        self.stdout.write(self.style.SUCCESS("Navigation sidebars and capabilities successfully seeded!"))
