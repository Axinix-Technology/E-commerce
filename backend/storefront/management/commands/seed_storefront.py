from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import Role
from catalogue.models import GstMaster, CategoryMaster, ProductType, ProductVariant
from inventory.models import InventoryStock
from storefront.models import (
    HeroBanner,
    ProductImage,
    PromotionCoupon,
    FaqCategory,
    FaqItem,
    StorePolicy,
    ProductReview,
)


class Command(BaseCommand):
    help = "Seed initial database tables for Storefront, Shopping, Customer Account, Help & Policies, and Useful Additions"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("--- Starting Storefront & Catalogue Seeding ---"))

        # 1. Seed Customer Role
        cust_role, created = Role.objects.get_or_create(
            name="Customer",
            defaults={
                "description": "Retail consumer and verified buyer account",
                "is_superadmin": False,
                "status": 1,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("[OK] Created 'Customer' Role"))
        else:
            self.stdout.write("  'Customer' Role already present")

        # 2. Seed GST Masters
        gst_slabs = [
            {"name": "GST 0% (Exempt)", "rate": Decimal("0.00"), "cgst": Decimal("0.00"), "sgst": Decimal("0.00"), "igst": Decimal("0.00")},
            {"name": "GST 5% (Apparel < ₹1k)", "rate": Decimal("5.00"), "cgst": Decimal("2.50"), "sgst": Decimal("2.50"), "igst": Decimal("5.00")},
            {"name": "GST 12% (Apparel > ₹1k)", "rate": Decimal("12.00"), "cgst": Decimal("6.00"), "sgst": Decimal("6.00"), "igst": Decimal("12.00")},
            {"name": "GST 18% (Standard Goods)", "rate": Decimal("18.00"), "cgst": Decimal("9.00"), "sgst": Decimal("9.00"), "igst": Decimal("18.00")},
            {"name": "GST 28% (Luxury Goods)", "rate": Decimal("28.00"), "cgst": Decimal("14.00"), "sgst": Decimal("14.00"), "igst": Decimal("28.00")},
        ]
        gst_map = {}
        for slab in gst_slabs:
            obj, _ = GstMaster.objects.get_or_create(
                name=slab["name"],
                defaults={
                    "rate": slab["rate"],
                    "cgst_rate": slab["cgst"],
                    "sgst_rate": slab["sgst"],
                    "igst_rate": slab["igst"],
                    "status": 1,
                }
            )
            gst_map[slab["rate"]] = obj
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(gst_slabs)} GST Tax Masters"))

        # 3. Seed Categories
        categories_data = [
            {"name": "Men's Apparel", "hsn_code": "6203", "description": "Shirts, Trousers, Suits and Ethnic Wear for Men", "tax_rate": Decimal("12.00")},
            {"name": "Women's Couture", "hsn_code": "6204", "description": "Designer Dresses, Sarees, Tunics and Blouses", "tax_rate": Decimal("12.00")},
            {"name": "Footwear", "hsn_code": "6403", "description": "Formal Leather Shoes, Sneakers and Loafers", "tax_rate": Decimal("18.00")},
            {"name": "Accessories", "hsn_code": "4202", "description": "Bags, Wallets, Belts and Timepieces", "tax_rate": Decimal("18.00")},
            {"name": "Electronics", "hsn_code": "8517", "description": "Smart Accessories, Earbuds and Chargers", "tax_rate": Decimal("18.00")},
        ]
        cat_map = {}
        for c in categories_data:
            cat_obj, _ = CategoryMaster.objects.get_or_create(
                name=c["name"],
                defaults={
                    "description": c["description"],
                    "hsn_code": c["hsn_code"],
                    "tax_group": gst_map.get(c["tax_rate"]),
                    "status": 1,
                }
            )
            cat_map[c["name"]] = cat_obj
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(categories_data)} Product Categories"))

        # 4. Seed Showcase Products & Variants
        products_data = [
            {
                "category": cat_map["Men's Apparel"],
                "name": "Heritage Linen Oxford Button-Down",
                "slug": "heritage-linen-oxford-button-down",
                "brand": "Axinix Tailors",
                "material": "100% Organic European Linen",
                "care_instructions": "Machine wash cold gentle cycle. Warm iron while damp.",
                "age_group": "Adult",
                "gender_label": "Men",
                "selling_price": Decimal("2499.00"),
                "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
                "variants": [
                    {"sku": "HL-OXF-WHT-M", "size": "M", "color": "Crisp White", "barcode": "890123400101", "cost_price": Decimal("950.00"), "qty": 45},
                    {"sku": "HL-OXF-WHT-L", "size": "L", "color": "Crisp White", "barcode": "890123400102", "cost_price": Decimal("950.00"), "qty": 30},
                    {"sku": "HL-OXF-NAV-M", "size": "M", "color": "Navy Blue", "barcode": "890123400103", "cost_price": Decimal("950.00"), "qty": 25},
                ]
            },
            {
                "category": cat_map["Women's Couture"],
                "name": "Kashmir Pashmina Silk Jacquard Stole",
                "slug": "kashmir-pashmina-silk-jacquard-stole",
                "brand": "Axinix Artisan",
                "material": "70% Cashmere Pashmina, 30% Mulberry Silk",
                "care_instructions": "Professional dry clean only. Store wrapped in muslin cloth.",
                "age_group": "Adult",
                "gender_label": "Women",
                "selling_price": Decimal("4850.00"),
                "image_url": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=800",
                "variants": [
                    {"sku": "PAS-STOLE-MRN-OS", "size": "One Size", "color": "Imperial Maroon", "barcode": "890123400201", "cost_price": Decimal("2100.00"), "qty": 18},
                    {"sku": "PAS-STOLE-GLD-OS", "size": "One Size", "color": "Antique Gold", "barcode": "890123400202", "cost_price": Decimal("2100.00"), "qty": 12},
                ]
            },
            {
                "category": cat_map["Footwear"],
                "name": "Artisan Full-Grain Goodyear Derby",
                "slug": "artisan-full-grain-goodyear-derby",
                "brand": "Axinix Cordwainers",
                "material": "Top-Grain Italian Calf Leather",
                "care_instructions": "Condition leather monthly. Use cedar shoe trees.",
                "age_group": "Adult",
                "gender_label": "Men",
                "selling_price": Decimal("6999.00"),
                "image_url": "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
                "variants": [
                    {"sku": "GY-DRB-BRN-42", "size": "UK 8 (EU 42)", "color": "Tobacco Brown", "barcode": "890123400301", "cost_price": Decimal("3200.00"), "qty": 14},
                    {"sku": "GY-DRB-BLK-42", "size": "UK 8 (EU 42)", "color": "Midnight Onyx", "barcode": "890123400302", "cost_price": Decimal("3200.00"), "qty": 10},
                ]
            },
            {
                "category": cat_map["Accessories"],
                "name": "Chronograph Stainless Chronometer 42mm",
                "slug": "chronograph-stainless-chronometer-42mm",
                "brand": "Axinix Horology",
                "material": "316L Surgical Stainless Steel & Sapphire Glass",
                "care_instructions": "Water resistant up to 10 ATM. Wipe clean with microfiber cloth.",
                "age_group": "Adult",
                "gender_label": "Unisex",
                "selling_price": Decimal("12499.00"),
                "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
                "variants": [
                    {"sku": "CHRN-42-SLV-OS", "size": "42mm Dial", "color": "Silver & Sunburst Blue", "barcode": "890123400401", "cost_price": Decimal("6400.00"), "qty": 8},
                ]
            },
        ]

        for p in products_data:
            prod_obj, _ = ProductType.objects.get_or_create(
                slug=p["slug"],
                defaults={
                    "category": p["category"],
                    "name": p["name"],
                    "brand": p["brand"],
                    "material": p["material"],
                    "care_instructions": p["care_instructions"],
                    "age_group": p["age_group"],
                    "gender_label": p["gender_label"],
                    "selling_price": p["selling_price"],
                    "is_active": True,
                    "status": 1,
                }
            )

            # Product Cover Image
            ProductImage.objects.get_or_create(
                product=prod_obj,
                is_primary=True,
                defaults={
                    "image_url": p["image_url"],
                    "alt_text": p["name"],
                    "display_order": 0,
                    "status": 1,
                }
            )

            # Variants & Inventory
            total_sellable = 0
            for v in p["variants"]:
                var_obj, _ = ProductVariant.objects.get_or_create(
                    sku=v["sku"],
                    defaults={
                        "product": prod_obj,
                        "size": v["size"],
                        "color": v["color"],
                        "barcode": v["barcode"],
                        "selling_price": p["selling_price"],
                        "cost_price": v["cost_price"],
                        "is_active": True,
                        "status": 1,
                    }
                )
                total_sellable += v["qty"]

            # Inventory stock record
            InventoryStock.objects.update_or_create(
                product=prod_obj,
                defaults={
                    "quantity_on_hand": total_sellable + 5,
                    "sellable_stock": total_sellable,
                    "reserved_stock": 3,
                    "reorder_level": 10,
                    "status": 1,
                }
            )

        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(products_data)} Catalogue Products with Variants & Inventory Stocks"))

        # 5. Seed Hero Banners
        banners = [
            {
                "title": "Axinix Autumn Couture 2026",
                "subtitle": "Precision Tailored Luxury with Pan-India Express Delivery & Statutory GST Invoicing",
                "badge_text": "NEW COLLECTION 2026",
                "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200",
                "cta_text": "Explore New Arrivals",
                "cta_link": "/shopping/products",
                "display_order": 1,
            },
            {
                "title": "Enterprise B2B Wholesale Deals",
                "subtitle": "Exclusive GST Input Tax Credit (ITC) compliant billing with tiered bulk order savings",
                "badge_text": "B2B SPECIAL",
                "image_url": "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200",
                "cta_text": "View B2B Catalogue",
                "cta_link": "/shopping/products",
                "display_order": 2,
            },
        ]
        for b in banners:
            HeroBanner.objects.get_or_create(
                title=b["title"],
                defaults={**b, "is_active": True, "status": 1}
            )
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(banners)} Homepage Hero Banners"))

        # 6. Seed Promotion Coupons
        coupons = [
            {
                "code": "AXINIX10",
                "title": "Flat 10% Off Everything",
                "description": "Valid on all catalogue collections. Max discount ₹500.",
                "discount_type": "percentage",
                "discount_value": Decimal("10.00"),
                "min_order_value": Decimal("999.00"),
                "max_discount_amount": Decimal("500.00"),
                "valid_from": timezone.now(),
                "usage_limit": 10000,
            },
            {
                "code": "WELCOME15",
                "title": "First Time Shopper Welcome Bonus",
                "description": "Exclusive 15% discount for first-time retail buyers.",
                "discount_type": "percentage",
                "discount_value": Decimal("15.00"),
                "min_order_value": Decimal("1499.00"),
                "max_discount_amount": Decimal("750.00"),
                "valid_from": timezone.now(),
                "usage_limit": 5000,
            },
            {
                "code": "BULK25",
                "title": "B2B Enterprise Volume Discount",
                "description": "Save 25% on volume orders above ₹5,000.",
                "discount_type": "percentage",
                "discount_value": Decimal("25.00"),
                "min_order_value": Decimal("5000.00"),
                "max_discount_amount": Decimal("2500.00"),
                "valid_from": timezone.now(),
                "usage_limit": 2000,
            },
        ]
        for c in coupons:
            PromotionCoupon.objects.get_or_create(
                code=c["code"],
                defaults={**c, "is_active": True, "status": 1}
            )
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(coupons)} Promotion Coupons"))

        # 7. Seed FAQ Categories & Items
        faq_data = [
            {
                "cat": "Orders & Shipping",
                "slug": "orders-shipping",
                "icon": "Package",
                "faqs": [
                    {"q": "How can I track my shipment in real-time?", "a": "You can track your parcel live on our 'Track an Order' page using either your Statutory Sale Order Number (e.g., SO-202610-1001) or carrier AWB tracking number."},
                    {"q": "What are the standard shipping timelines?", "a": "Metro locations receive deliveries within 24 to 48 hours via Air Express. Rest of India surface deliveries arrive within 3 to 5 business days."},
                    {"q": "Is delivery free across India?", "a": "Yes! We provide complimentary standard shipping on all orders exceeding ₹999. Orders below ₹999 incur a flat ₹99 delivery fee."},
                ]
            },
            {
                "cat": "Returns & Refunds",
                "slug": "returns-refunds",
                "icon": "RotateCcw",
                "faqs": [
                    {"q": "What is the return and exchange window?", "a": "We offer a 7-day hassle-free inspection return policy from the date of confirmed delivery. Items must retain intact barcode tags and original packaging."},
                    {"q": "How long do refunds take to credit?", "a": "Instant UPI refunds reflect within 15 minutes of QC inspection at our warehouse. Credit card / Net Banking refunds take 3 to 5 business banking days."},
                ]
            },
            {
                "cat": "Statutory GST & Invoicing",
                "slug": "gst-invoicing",
                "icon": "Receipt",
                "faqs": [
                    {"q": "Can I claim GST Input Tax Credit (ITC) for business purchases?", "a": "Yes! Enter your registered 15-character GSTIN and Company Name during checkout. Your Tax Invoice will automatically reflect CGST/SGST or IGST for GSTR-2B compliance."},
                    {"q": "Where can I download my official Tax Invoice?", "a": "Tax Invoices are emailed immediately upon order confirmation and can also be downloaded directly from your Customer Account under 'Order History'."},
                ]
            },
        ]
        total_faqs = 0
        for fd in faq_data:
            cat_obj, _ = FaqCategory.objects.get_or_create(
                name=fd["cat"],
                defaults={"slug": fd["slug"], "icon": fd["icon"], "status": 1}
            )
            for f in fd["faqs"]:
                FaqItem.objects.get_or_create(
                    category=cat_obj,
                    question=f["q"],
                    defaults={"answer": f["a"], "is_published": True, "status": 1}
                )
                total_faqs += 1
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(faq_data)} FAQ Categories and {total_faqs} FAQ Items"))

        # 8. Seed Store Policies
        policies = [
            {
                "policy_type": "shipping_delivery",
                "title": "Shipping and Fulfillment Policy",
                "content": """### Pan-India Express Logistics
All orders placed before 2:00 PM IST are dispatched on the same business day from our fulfillment centers.

#### Delivery Tiers
- **Metro Express**: 24-48 Hours delivery across Tier-1 cities (Delhi NCR, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata).
- **Surface Logistics**: 3-5 Business days across Tier-2 and regional PIN codes.
- **Statutory Tracking**: Live carrier tracking numbers are issued with tamper-proof barcoded packaging.
                """,
            },
            {
                "policy_type": "returns_refunds",
                "title": "Customer Returns & Refund Policy",
                "content": """### 7-Day Inspection Window
We want you to love your purchase. If you need a size exchange or wish to return an item:
1. Initiate return within 7 days of delivery.
2. Ensure barcode tags and security seals remain untampered.
3. Our courier will pick up from your doorstep at zero cost.
4. Refunds are processed to original payment method or UPI immediately upon automated QC scan.
                """,
            },
            {
                "policy_type": "privacy_policy",
                "title": "Privacy Policy & Data Protection",
                "content": """### DPDP Act 2023 Compliance
Axinix Technologies adheres strictly to the Digital Personal Data Protection Act (DPDP), 2023.
- **Zero Third-Party Data Selling**: Your phone, address, and shopping preferences are never monetized.
- **Payment Tokenization**: Card information is processed via PCI-DSS Level 1 certified gateways.
- **Customer Control**: You may export or purge your customer data anytime from your profile settings.
                """,
            },
            {
                "policy_type": "terms_conditions",
                "title": "Terms and Conditions of Sale",
                "content": """### Statutory Commercial Agreement
All commercial sales executed on Axinix E-Commerce are governed under Indian commercial laws.
- **GST Compliance**: Tax invoices are generated with HSN codes and statutory GST state codes.
- **Pricing**: All displayed retail prices (M.R.P.) include applicable GST.
- **Jurisdiction**: Any dispute arising from transactions is subject to the exclusive jurisdiction of Coimbatore courts.
                """,
            },
            {
                "policy_type": "about_us",
                "title": "About Axinix E-Commerce",
                "content": """### Enterprise Retail Redefined
Axinix E-Commerce combines precision ERP inventory management with world-class consumer shopping.

Built on statutory GST accuracy, instant barcode serialization, and multi-channel synchronization with major marketplaces, we deliver exceptional craftsmanship and transparency at every step.
                """,
            },
        ]
        for pol in policies:
            StorePolicy.objects.get_or_create(
                policy_type=pol["policy_type"],
                defaults={
                    "title": pol["title"],
                    "content": pol["content"].strip(),
                    "version": "1.0",
                    "effective_date": timezone.now().date(),
                    "is_published": True,
                    "status": 1,
                }
            )
        self.stdout.write(self.style.SUCCESS(f"[OK] Seeded {len(policies)} Statutory Store Policies"))

        # 9. Seed Sample Reviews
        first_prod = ProductType.objects.first()
        if first_prod:
            ProductReview.objects.get_or_create(
                product=first_prod,
                reviewer_name="Dr. Raghavan Nair",
                defaults={
                    "rating": 5,
                    "title": "Superb fabric quality and finish",
                    "content": "The stitching precision and natural drape exceeded my expectations. Prompt delivery and authentic GST invoice provided.",
                    "verified_purchase": True,
                    "helpful_votes": 14,
                    "status": 1,
                }
            )
            ProductReview.objects.get_or_create(
                product=first_prod,
                reviewer_name="Ananya Sharma",
                defaults={
                    "rating": 5,
                    "title": "Perfect fit and breathable linen",
                    "content": "Wore it for an outdoor conference. Extremely comfortable and stays crisp throughout the day. Highly recommended!",
                    "verified_purchase": True,
                    "helpful_votes": 8,
                    "status": 1,
                }
            )
            self.stdout.write(self.style.SUCCESS("[OK] Seeded sample Product Reviews"))

        self.stdout.write(self.style.SUCCESS("--- All Storefront & Catalogue Tables Successfully Seeded! ---"))
