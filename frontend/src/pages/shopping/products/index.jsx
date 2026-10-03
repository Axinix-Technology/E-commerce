import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  ShoppingBag,
  SlidersHorizontal,
  Plus,
  Layers,
  ArrowRight
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function ProductCatalogPage() {
  const [searchParams] = useSearchParams();
  const selectedCatParam = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(selectedCatParam || "all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    Promise.all([
      populateApi.read("product_type", {
        limit: 50,
        filter: { status: 1 },
        populate: { category: ["id", "name"] },
      }),
      populateApi.read("category_master", { limit: 50, filter: { status: 1 } }),
    ])
      .then(([prodRes, catRes]) => {
        if (prodRes?.data) setProducts(prodRes.data);
        if (catRes?.data) setCategories(catRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      activeCategory === "all" ||
      String(p.category?.id || p.category_id) === String(activeCategory);
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") return Number(a.selling_price) - Number(b.selling_price);
    if (sortBy === "price_desc") return Number(b.selling_price) - Number(a.selling_price);
    return b.id - a.id;
  });

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem("customer_cart") || "[]");
    const itemIdx = existing.findIndex((item) => item.product_id === product.id);

    if (itemIdx >= 0) {
      existing[itemIdx].quantity += 1;
    } else {
      existing.push({
        id: Date.now(),
        product_id: product.id,
        name: product.name,
        brand: product.brand,
        selling_price: Number(product.selling_price) || 0,
        sku: product.slug || `SKU-${product.id}`,
        quantity: 1,
        image_url:
          product.image_url ||
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
      });
    }

    localStorage.setItem("customer_cart", JSON.stringify(existing));
    toast.success(`Added "${product.name}" to cart`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Product Catalogue</span>
          </h1>
          <p className="text-xs text-gray-400">
            Precision cut collections with real-time barcode inventory & statutory GST calculation
          </p>
        </div>

        <Link
          to="/shopping/products/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar (UI Rule 2) */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex flex-wrap items-center gap-y-1 gap-x-3">
        <span>
          Total Catalogued: <strong className="text-white">{sortedProducts.length || "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Categories: <strong className="text-white">{categories.length || "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Statutory Invoicing: <strong className="text-[var(--brand-primary)]">GST Compliant</strong>
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by apparel name, brand, or material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-gray-900 text-white">
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
          >
            <option value="newest" className="bg-gray-900">Newest</option>
            <option value="price_asc" className="bg-gray-900">Price: Low to High</option>
            <option value="price_desc" className="bg-gray-900">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      {sortedProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-gray-400 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-gray-500" />
          <p className="text-sm font-semibold text-gray-300">No products match your criteria</p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
            className="text-xs text-[var(--brand-primary)] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {sortedProducts.map((p) => (
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
                    {p.material || p.description || "Crafted with premium natural fibers."}
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

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleAddToCart(p, e)}
                      className="px-2.5 py-1.5 rounded-xl bg-[rgba(0,210,210,0.15)] hover:bg-[var(--brand-primary)] text-[var(--brand-primary)] hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Add</span>
                    </button>
                    <Link
                      to={`/shopping/product-details?id=${p.id}&slug=${p.slug || ""}`}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
