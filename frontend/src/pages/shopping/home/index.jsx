import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Star,
  Layers,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Badge } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function StorefrontHomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      populateApi.read("category_master", { limit: 8, filter: { status: 1 } }),
      populateApi.read("product_type", { limit: 8, filter: { status: 1 } }),
    ])
      .then(([catRes, prodRes]) => {
        if (catRes?.data) setCategories(catRes.data);
        if (prodRes?.data) setFeaturedProducts(prodRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Showcase Banner */}
      <div className="glass-panel relative overflow-hidden rounded-3xl border border-token p-6 sm:p-10 shadow-lg">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-brand-token/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-surface-elevated/80 text-brand-token border border-token">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autumn Couture Collection 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-token leading-tight">
            Curated Elegance, <br />
            <span className="text-brand-token">
              Engineered Precision.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-secondary-token leading-relaxed">
            Explore authentic handcrafted luxury, barcoded inventory accuracy, and PAN-India express delivery with statutory GST compliant billing.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/shopping/products">
              <Button variant="primary" size="md" icon={ShoppingBag}>
                Shop All Products
              </Button>
            </Link>

            <Link to="/shopping/home/create">
              <Button variant="secondary" size="md" icon={Plus}>
                Configure Banner
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Curated Lines: <strong className="text-primary-token font-medium">{formatQty(featuredProducts.length)}</strong></span>
        <span>•</span>
        <span>Categories: <strong className="text-brand-token font-medium">{formatQty(categories.length)}</strong></span>
        <span>•</span>
        <span>Logistics: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">PAN-India Air Express</strong></span>
        <span>•</span>
        <span>Statutory: <strong className="text-primary-token font-medium">100% ITC Eligible</strong></span>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Truck, title: "Express Logistics", desc: "Pan-India 24-48h air dispatch" },
          { icon: ShieldCheck, title: "100% Statutory GST", desc: "Input tax credit (ITC) invoices" },
          { icon: RotateCcw, title: "7-Day Easy Returns", desc: "Doorstep inspection & QC" },
          { icon: Star, title: "Verified Artisan Craft", desc: "Direct from master weavers" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-surface-elevated/40 border border-token flex items-start gap-3.5 shadow-xs"
          >
            <div className="p-2.5 rounded-xl bg-surface-elevated/80 border border-token text-brand-token shrink-0">
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-primary-token">{item.title}</h4>
              <p className="text-[11px] text-muted-token mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category Pills Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary-token">Browse Categories</h2>
            <p className="text-xs text-muted-token">Select an apparel line or accessory collection</p>
          </div>
          <Link
            to="/catalogue/categories"
            className="text-xs text-brand-token hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Manage Taxonomy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shopping/products?category=${cat.id}`}
              className="p-4 rounded-2xl bg-surface-elevated/40 hover:bg-surface-elevated/80 border border-token hover:border-brand-token/40 transition-all group flex flex-col items-center text-center space-y-2 shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-elevated/80 border border-token flex items-center justify-center text-brand-token group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-primary-token group-hover:text-brand-token">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary-token">Featured Collections</h2>
            <p className="text-xs text-muted-token">Precision cut, statutory tagged inventory</p>
          </div>
          <Link
            to="/shopping/products"
            className="text-xs text-brand-token hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All ({formatQty(featuredProducts.length)})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-surface-elevated/40 border border-token hover:border-brand-token/40 transition-all overflow-hidden flex flex-col group shadow-xs"
            >
              <div className="relative h-48 bg-surface-elevated/80 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    p.image_url ||
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
                  }
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface/80 text-primary-token backdrop-blur-md border border-token shadow-xs">
                  {p.brand || "Axinix"}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-primary-token line-clamp-1 group-hover:text-brand-token transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-muted-token mt-0.5 line-clamp-2">
                    {p.material || p.description || "Crafted with premium textile fibers."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-token">
                  <div>
                    <span className="text-sm font-extrabold text-brand-token">
                      {p.selling_price && Number(p.selling_price) > 0
                        ? `₹${Number(p.selling_price).toLocaleString("en-IN")}`
                        : "—"}
                    </span>
                    <span className="text-[10px] text-muted-token ml-1.5 font-medium">Incl. GST</span>
                  </div>

                  <Link
                    to={`/shopping/product-details?id=${p.id}&slug=${p.slug || ""}`}
                    className="p-2 rounded-xl bg-surface-elevated/60 hover:bg-surface-elevated/90 border border-token text-brand-token transition-all cursor-pointer shadow-xs"
                    title="View Product"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
