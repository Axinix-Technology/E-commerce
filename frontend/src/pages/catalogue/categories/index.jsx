import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty } from "../../../utils/formatters";
import { Button, Input, Badge } from "../../../components/ui";

export default function CategoryListPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["name.icontains"] = search.trim();
      }

      const res = await populateApi.read("category_master", {
        filter,
        page,
        limit: 10,
        populate: {
          parent: ["id", "name"],
          tax_group: ["id", "name", "rate"],
        },
        sort: ["-id"],
      });

      if (res?.data) {
        setCategories(res.data);
        setTotalCount(res.count || 0);
        setTotalPages(res.metadata?.total_pages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete category "${item.name}"?`)) return;

    try {
      await populateApi.delete("category_master", item.id);
      toast.success("Category soft-deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.25)] text-brand-token shadow-xs">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-primary-token">Category Master</h1>
              </div>
              <p className="text-xs text-secondary-token">
                Manage product taxonomy, nested hierarchies, and HSN tax codes.
              </p>
            </div>
          </div>
        </div>

        <Link to="/catalogue/categories/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Category
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total Categories: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Active Categories: <strong className="text-emerald-400 font-medium">{formatQty(categories.filter(c => c.status !== 0).length)}</strong></span>
        <span>•</span>
        <span>Page: <strong className="text-brand-token font-medium">{page} of {totalPages}</strong></span>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel p-3 rounded-2xl border border-token flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search by category name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onClear={() => {
              setSearch("");
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchCategories}
            title="Refresh list"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-token overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/60 text-secondary-token uppercase tracking-wider font-semibold border-b border-token">
              <tr>
                <th className="py-3 px-4"># ID</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Parent Category</th>
                <th className="py-3 px-4">HSN Code</th>
                <th className="py-3 px-4">GST Slab</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-token text-primary-token">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-muted-token">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-token" />
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-muted-token">
                    <p className="font-semibold text-secondary-token mb-1">No categories found</p>
                    <p className="text-xs text-muted-token mb-3">Create your first category to build the product hierarchy.</p>
                    <Link to="/catalogue/categories/create">
                      <Button variant="primary" size="xs" icon={Plus}>
                        Add Category
                      </Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-muted-token">{cat.id}</td>
                    <td className="py-3 px-4 font-semibold text-primary-token">
                      {cat.name}
                      {cat.description && (
                        <p className="text-[10px] text-muted-token font-normal truncate max-w-xs">{cat.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-secondary-token">
                      {cat.parent ? (
                        <Badge variant="neutral">{cat.parent.name}</Badge>
                      ) : (
                        <span className="text-muted-token text-[11px]">— Root —</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-secondary-token">{cat.hsn_code || "—"}</td>
                    <td className="py-3 px-4 text-secondary-token">
                      {cat.tax_group ? (
                        <Badge variant="amber">{cat.tax_group.name} ({cat.tax_group.rate}%)</Badge>
                      ) : (
                        <span className="text-muted-token text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={cat.status === 1 ? "emerald" : "rose"} dot>
                        {cat.status === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/catalogue/categories/create?id=${cat.id}`} title="Edit Category">
                          <Button size="xs" variant="ghost" icon={Edit2} />
                        </Link>
                        <Button
                          size="xs"
                          variant="danger"
                          icon={Trash2}
                          onClick={() => handleDelete(cat)}
                          title="Delete Category"
                        />
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
              <Button
                variant="outline"
                size="xs"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="xs"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
