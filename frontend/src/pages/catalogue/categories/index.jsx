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
import {
  Button,
  Input,
  Badge,
  FilterBar,
  Select,
  Table,
  MetricBar,
  PageHeader,
} from "../../../components/ui";

export default function CategoryListPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hierarchyFilter, setHierarchyFilter] = useState("all");
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
      if (statusFilter !== "all") {
        filter.status = parseInt(statusFilter, 10);
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
  }, [page, search, statusFilter]);

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

  const displayCategories = categories.filter((cat) => {
    if (hierarchyFilter === "root" && cat.parent) return false;
    if (hierarchyFilter === "sub" && !cat.parent) return false;
    return true;
  });

  const columns = [
    {
      key: "id",
      header: "# ID",
      width: "80px",
      render: (id) => <span className="font-mono text-muted-token">{id}</span>,
    },
    {
      key: "name",
      header: "Category Name",
      render: (_, cat) => (
        <div>
          <span className="font-semibold text-primary-token">{cat.name}</span>
          {cat.description && (
            <p className="text-[10px] text-muted-token font-normal truncate max-w-xs">{cat.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "parent",
      header: "Parent Category",
      render: (_, cat) =>
        cat.parent ? (
          <Badge variant="neutral">{cat.parent.name}</Badge>
        ) : (
          <span className="text-muted-token text-[11px]">— Root —</span>
        ),
    },
    {
      key: "hsn_code",
      header: "HSN Code",
      render: (hsn) => <span className="font-mono text-secondary-token">{hsn || "—"}</span>,
    },
    {
      key: "tax_group",
      header: "GST Slab",
      render: (_, cat) =>
        cat.tax_group ? (
          <Badge variant="amber">
            {cat.tax_group.name} ({cat.tax_group.rate}%)
          </Badge>
        ) : (
          <span className="text-muted-token text-[11px]">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (status) => (
        <Badge variant={status === 1 ? "emerald" : "rose"} dot>
          {status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, cat) => (
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
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Category Master"
        subtitle="Manage product taxonomy, nested hierarchies, and HSN tax codes."
        icon={FolderTree}
        actions={
          <Link to="/catalogue/categories/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Add Category
            </Button>
          </Link>
        }
      />

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <MetricBar
        items={[
          { label: "Total Categories", value: totalCount, isQty: true },
          {
            label: "Active Categories",
            value: categories.filter((c) => c.status !== 0).length,
            isQty: true,
            variant: "emerald",
          },
          { label: "Page", value: `${page} of ${totalPages}`, variant: "brand" },
        ]}
      />

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search category by name or HSN..."
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
            <Select
              size="xs"
              value={hierarchyFilter}
              onChange={(e) => setHierarchyFilter(e.target.value)}
              options={[
                { label: "All Levels", value: "all" },
                { label: "Root Categories Only", value: "root" },
                { label: "Sub-Categories Only", value: "sub" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setHierarchyFilter("all");
          setPage(1);
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchCategories}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Data Table */}
      <Table
        columns={columns}
        data={displayCategories}
        loading={loading}
        emptyMessage="No categories found matching your search filters."
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          totalItems: totalCount,
        }}
      />
    </div>
  );
}
