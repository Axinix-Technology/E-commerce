import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Tag
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

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

export default function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    populateApi.read("category", { limit: 100 })
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data || [];
        setCategories(data);
      })
      .catch(() => {});
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["name.icontains"] = search.trim();
      }
      if (statusFilter !== "all") {
        filter["status"] = Number(statusFilter);
      }
      if (categoryFilter !== "all") {
        filter["category_id"] = Number(categoryFilter);
      }

      const res = await populateApi.read("product_type", {
        filter,
        page,
        limit: 15,
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
  }, [page, search, statusFilter, categoryFilter]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete product "${item.name}"?`)) return;

    try {
      await populateApi.delete("product_type", item.id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to delete product");
    }
  };

  const activeCount = products.filter((p) => p.status === 1).length;

  const columns = [
    {
      header: "# ID",
      accessor: "id",
      className: "font-mono text-muted-token text-xs w-16",
    },
    {
      header: "Product Item",
      render: (p) => (
        <div>
          <div className="font-semibold text-primary-token text-xs">{p.name}</div>
          {p.slug && (
            <span className="font-mono text-[11px] text-muted-token">
              /{p.slug}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Category",
      render: (p) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-elevated border border-token text-secondary-token uppercase tracking-wide">
          {p.category?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      header: "Brand & Material",
      render: (p) => (
        <div className="text-xs space-y-0.5">
          <div className="text-primary-token font-medium">{p.brand || "—"}</div>
          {p.material && <div className="text-muted-token text-[11px]">{p.material}</div>}
        </div>
      ),
    },
    {
      header: "Selling Price",
      render: (p) => (
        <span className="font-mono font-semibold text-primary-token text-xs">
          {formatCurrency(p.selling_price)}
        </span>
      ),
    },
    {
      header: "Status",
      render: (p) => (
        <Badge variant={p.status === 1 ? "success" : "neutral"} size="sm">
          {p.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            onClick={() => navigate(`/catalogue/products/create?id=${p.id}`)}
            title="Edit Product"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="hover:text-rose-600 dark:hover:text-rose-400"
            onClick={() => handleDelete(p)}
            title="Delete Product"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">Product Types & Articles</h1>
            <p className="text-xs text-muted-token">
              Manage product types, attributes, default retail price points, and classification
            </p>
          </div>
        </div>

        <Link to="/catalogue/products/create">
          <Button variant="primary" size="sm" icon={Plus}>
            New Product
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="glass-panel flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-xl text-xs text-secondary-token shadow-xs">
        <span>Total Articles: <strong className="text-primary-token font-bold">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Active on Page: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatQty(activeCount)}</strong></span>
        <span>•</span>
        <span>Article Status: <strong className="text-teal-600 dark:text-cyan-400 font-bold">Standardized</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search product by title or code..."
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Active", value: "1" },
                { label: "Inactive", value: "0" },
              ]}
            />
            {categories.length > 0 && (
              <Select
                size="xs"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { label: "All Categories", value: "all" },
                  ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
                ]}
              />
            )}
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setCategoryFilter("all");
          setPage(1);
        }}
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchProducts}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Table */}
      <Table
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="No product items registered yet. Register your base products before creating stock tags."
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-token flex items-center justify-between text-xs text-secondary-token">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
