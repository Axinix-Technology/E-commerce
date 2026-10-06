import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  Layers,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function ProductCatalogPage() {
  const [searchParams] = useSearchParams();
  const selectedCatParam = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(selectedCatParam || "all");
  const [sortBy, setSortBy] = useState("newest");

  const loadData = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    loadData();
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

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              Product Catalogue
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Precision cut collections with real-time barcode inventory & statutory GST calculation
            </p>
          </div>
        </div>

        <Link to="/shopping/products/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total Catalogued: <strong className="text-primary-token font-medium">{formatQty(sortedProducts.length)}</strong></span>
        <span>•</span>
        <span>Categories: <strong className="text-brand-token font-medium">{formatQty(categories.length)}</strong></span>
        <span>•</span>
        <span>Statutory Invoicing: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">GST Compliant</strong></span>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by apparel name, brand, or material..."
        onReset={() => {
          setSearch("");
          setActiveCategory("all");
          setSortBy("newest");
        }}
        filters={
          <>
            <Select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              options={categoryOptions}
              size="xs"
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
              size="xs"
            />
          </>
        }
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={loadData}
          title="Refresh Catalog"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Product Cards Grid */}
      {sortedProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-elevated/40 border border-token space-y-3">
          <Layers className="w-10 h-10 mx-auto text-muted-token" />
          <p className="text-sm font-semibold text-secondary-token">No products match your criteria</p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
            className="text-xs text-brand-token hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedProducts.map((p) => (
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
                    {p.material || p.description || "Crafted with premium natural fibers."}
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

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => handleAddToCart(p, e)}
                    >
                      Add
                    </Button>
                    <Link
                      to={`/shopping/product-details?id=${p.id}&slug=${p.slug || ""}`}
                      className="p-1.5 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
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
