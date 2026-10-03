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
  Tag,
  Layers
} from "lucide-react";
import populateApi from "../../../api/populate.api";

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
    <div className="space-y-10 pb-12">
      {/* Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1a24] via-[#112433] to-[#0a151e] border border-[rgba(0,210,210,0.25)] p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-[rgba(0,210,210,0.12)] rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(0,210,210,0.15)] text-[var(--brand-primary)] border border-[rgba(0,210,210,0.3)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autumn Couture Collection 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Curated Elegance, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[#00f2fe]">
              Engineered Precision.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Explore authentic handcrafted luxury, barcoded inventory accuracy, and PAN-India express delivery with statutory GST compliant billing.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/shopping/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-sm font-semibold shadow-lg transition-all"
            >
              <span>Shop All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/shopping/home/create"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-sm font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Banner</span>
            </Link>
          </div>
        </div>
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
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] text-[var(--brand-primary)] shrink-0">
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{item.title}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category Pills Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Browse Categories</h2>
            <p className="text-xs text-gray-400">Select an apparel line or accessory collection</p>
          </div>
          <Link
            to="/catalogue/categories"
            className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1 font-semibold"
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
              className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.08] hover:border-[rgba(0,210,210,0.3)] transition-all group flex flex-col items-center text-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-[rgba(0,210,210,0.1)] flex items-center justify-center text-[var(--brand-primary)] group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-gray-200 group-hover:text-white">
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
            <h2 className="text-lg font-bold text-white">Featured Collections</h2>
            <p className="text-xs text-gray-400">Precision cut, statutory tagged inventory</p>
          </div>
          <Link
            to="/shopping/products"
            className="text-xs text-[var(--brand-primary)] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All ({featuredProducts.length || "—"})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[rgba(0,210,210,0.3)] transition-all overflow-hidden flex flex-col group"
            >
              <div className="relative h-48 bg-gray-900/60 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    p.image_url ||
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
                  }
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10">
                  {p.brand || "Axinix"}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[var(--brand-primary)] transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                    {p.material || p.description || "Crafted with premium textile fibers."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <div>
                    <span className="text-sm font-extrabold text-[var(--brand-primary)]">
                      {p.selling_price && Number(p.selling_price) > 0
                        ? `₹${Number(p.selling_price).toLocaleString("en-IN")}`
                        : "—"}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1.5 font-medium">Incl. GST</span>
                  </div>

                  <Link
                    to={`/shopping/product-details?id=${p.id}&slug=${p.slug || ""}`}
                    className="p-2 rounded-xl bg-[rgba(0,210,210,0.1)] hover:bg-[var(--brand-primary)] hover:text-white text-[var(--brand-primary)] transition-all cursor-pointer"
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
