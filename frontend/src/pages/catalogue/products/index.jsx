import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["name.icontains"] = search.trim();
      }

      const res = await populateApi.read("product_type", {
        filter,
        page,
        limit: 10,
        populate: {
          category: ["id", "name"],
        },
        sort: ["-id"],
      });

      if (res?.data) {
        setProducts(res.data);
        setTotalCount(res.count || 0);
        setTotalPages(res.metadata?.total_pages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete product "${item.name}"?`)) return;

    try {
      await populateApi.delete("product_type", item.id);
      toast.success("Product soft-deleted successfully");
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.25)] text-brand-token shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-primary-token">Product Types</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[rgba(0,210,210,0.12)] text-brand-token border border-[rgba(0,210,210,0.25)]">
                  {totalCount} Products
                </span>
              </div>
              <p className="text-xs text-secondary-token">
                Manage core product profiles, materials, categories, and merchandising classifications.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/catalogue/products/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-token flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-token absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-elevated border border-token text-xs text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-secondary-token">
          <span>Total: <strong className="text-primary-token font-mono">{totalCount}</strong></span>
          <button
            onClick={fetchProducts}
            title="Refresh list"
            className="p-1.5 rounded-lg hover:bg-surface-elevated text-muted-token hover:text-primary-token transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-token" : ""}`} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-token overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/60 text-secondary-token uppercase tracking-wider font-semibold border-b border-token">
              <tr>
                <th className="py-3 px-4"># ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Selling Price (M.R.P.)</th>
                <th className="py-3 px-4">Material</th>
                <th className="py-3 px-4">Gender / Age</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-token text-primary-token">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-muted-token">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-token" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-muted-token">
                    <p className="font-semibold text-secondary-token mb-1">No products found</p>
                    <p className="text-xs text-muted-token mb-3">Add product definitions to populate the catalogue.</p>
                    <Link
                      to="/catalogue/products/create"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-muted-token">{prod.id}</td>
                    <td className="py-3 px-4 font-semibold text-primary-token">
                      {prod.name}
                      <span className="block text-[10px] text-muted-token font-mono">{prod.slug}</span>
                    </td>
                    <td className="py-3 px-4">
                      {prod.category ? (
                        <span className="px-2 py-0.5 rounded-md bg-surface-elevated border border-token text-[11px]">
                          {prod.category.name}
                        </span>
                      ) : (
                        <span className="text-muted-token text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-secondary-token">{prod.brand || "—"}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                      ₹{parseFloat(prod.selling_price || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-secondary-token">{prod.material || "—"}</td>
                    <td className="py-3 px-4 text-secondary-token">
                      {prod.gender_label || prod.age_group ? (
                        <span>{[prod.gender_label, prod.age_group].filter(Boolean).join(" / ")}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {prod.status === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                          <AlertCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/catalogue/products/create?id=${prod.id}`}
                          title="Edit Product"
                          className="p-1.5 rounded-lg hover:bg-surface-elevated text-secondary-token hover:text-brand-token transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod)}
                          title="Delete Product"
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-secondary-token hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-token flex items-center justify-between text-xs text-secondary-token">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-token disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-token disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
