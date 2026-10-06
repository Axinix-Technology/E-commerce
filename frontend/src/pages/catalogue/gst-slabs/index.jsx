import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgePercent,
  Plus,
  RefreshCw,
  Edit2,
  Trash2
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function GstListPage() {
  const navigate = useNavigate();
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rateFilter, setRateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSlabs = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["name.icontains"] = search.trim();
      }
      if (rateFilter !== "all") {
        filter.rate = Number(rateFilter);
      }

      const res = await populateApi.read("gst_master", {
        filter,
        page,
        limit: 15,
        sort: ["rate"],
      });

      if (res?.data) {
        setSlabs(res.data);
        setTotalCount(res.count || 0);
        setTotalPages(res.metadata?.total_pages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load GST slabs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlabs();
  }, [page, search, rateFilter]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete GST Slab "${item.name}"?`)) return;

    try {
      await populateApi.delete("gst_master", item.id);
      toast.success("GST Slab deleted successfully");
      fetchSlabs();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to delete slab");
    }
  };

  const columns = [
    {
      header: "# ID",
      accessor: "id",
      className: "font-mono text-muted-token text-xs w-16",
    },
    {
      header: "Slab Name",
      accessor: "name",
      className: "font-semibold text-primary-token text-xs",
    },
    {
      header: "Total GST Rate",
      render: (s) => (
        <Badge variant="primary" size="sm" className="font-mono">
          {s.rate}%
        </Badge>
      ),
    },
    {
      header: "CGST",
      render: (s) => (
        <span className="font-mono text-xs text-secondary-token">
          {s.cgst_rate !== undefined && s.cgst_rate !== null ? `${s.cgst_rate}%` : "—"}
        </span>
      ),
    },
    {
      header: "SGST",
      render: (s) => (
        <span className="font-mono text-xs text-secondary-token">
          {s.sgst_rate !== undefined && s.sgst_rate !== null ? `${s.sgst_rate}%` : "—"}
        </span>
      ),
    },
    {
      header: "IGST",
      render: (s) => (
        <span className="font-mono text-xs text-brand-token font-medium">
          {s.igst_rate !== undefined && s.igst_rate !== null ? `${s.igst_rate}%` : "—"}
        </span>
      ),
    },
    {
      header: "Tax Specification",
      accessor: "description",
      className: "text-muted-token text-xs max-w-sm",
    },
    {
      header: "Actions",
      className: "text-right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            onClick={() => navigate(`/catalogue/gst-slabs/create?id=${s.id}`)}
            title="Edit GST Slab"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="hover:text-rose-600 dark:hover:text-rose-400"
            onClick={() => handleDelete(s)}
            title="Delete GST Slab"
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
            <BadgePercent className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">GST Tax Slabs Master</h1>
            <p className="text-xs text-muted-token">
              Define statutory Goods & Services Tax percentage splits (CGST, SGST, IGST)
            </p>
          </div>
        </div>

        <Link to="/catalogue/gst-slabs/create">
          <Button variant="primary" size="sm" icon={Plus}>
            New GST Slab
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Configured Slabs: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Tax Authority: <strong className="text-brand-token font-medium">CBIC India</strong></span>
        <span>•</span>
        <span>Statutory Status: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Rate Schedule</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search GST slab name..."
        filters={
          <Select
            size="xs"
            value={rateFilter}
            onChange={(e) => {
              setRateFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { label: "All Tax Rates", value: "all" },
              { label: "0% (Nil / Exempt)", value: "0" },
              { label: "5% (Essential Goods)", value: "5" },
              { label: "12% (Standard Low)", value: "12" },
              { label: "18% (Standard Apparel)", value: "18" },
              { label: "28% (Luxury / Sin)", value: "28" },
            ]}
          />
        }
        onReset={() => {
          setSearch("");
          setRateFilter("all");
          setPage(1);
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchSlabs}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Table */}
      <Table
        columns={columns}
        data={slabs}
        loading={loading}
        emptyMessage="No GST tax slabs registered yet."
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
