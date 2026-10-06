import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PackageCheck,
  Plus,
  Eye,
  Building2,
  Calendar,
  FileText,
  Barcode,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function PurchaseInwardListPage() {
  const navigate = useNavigate();
  const [inwards, setInwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [inwardStatusFilter, setInwardStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchInwards = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["inward_number.icontains"] = search.trim();
      }
      if (inwardStatusFilter !== "all") {
        filter.inward_status = inwardStatusFilter;
      }

      const res = await populateApi.read("purchase_inward", {
        filter,
        page,
        limit: 15,
        populate: {
          vendor: ["id", "name", "vendor_code"],
        },
        sort: ["-id"],
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      setInwards(list);
      setTotalCount(res?.count || list.length);
      setTotalPages(res?.metadata?.total_pages || Math.ceil(list.length / 15) || 1);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load purchase inwards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInwards();
  }, [page, search, inwardStatusFilter]);

  const vendorOptions = [
    { label: "All Vendors", value: "all" },
    ...Array.from(new Set(inwards.map((i) => i.vendor?.name).filter(Boolean))).map((vn) => ({
      label: vn,
      value: vn,
    })),
  ];

  const filteredInwards = inwards.filter((i) => {
    if (vendorFilter !== "all" && i.vendor?.name !== vendorFilter) return false;
    return true;
  });

  const totalInwardVal = filteredInwards.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);

  const columns = [
    {
      key: "inward_number",
      header: "GRN Number / Date",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val || `GRN-${row.id}`}</span>
          <span className="text-[10px] text-muted-token">
            {row.inward_date || (row.created_at ? new Date(row.created_at).toLocaleDateString() : "—")}
          </span>
        </div>
      ),
    },
    {
      key: "vendor",
      header: "Vendor / Supplier",
      render: (val) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary-token">{val?.name || "Standard Vendor"}</span>
          <span className="text-[10px] text-brand-token font-mono">{val?.vendor_code || "—"}</span>
        </div>
      ),
    },
    {
      key: "invoice_number",
      header: "Vendor Invoice #",
      render: (val) => (
        <span className="font-mono text-xs text-secondary-token font-semibold">
          {val || "—"}
        </span>
      ),
    },
    {
      key: "total_amount",
      header: "Invoice Value (₹)",
      align: "right",
      render: (val) => (
        <span className="font-bold text-primary-token font-mono">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "inward_status",
      header: "Status",
      render: (val) => (
        <Badge variant={val === "received" || !val ? "emerald" : "amber"} dot>
          {val ? val.toUpperCase() : "RECEIVED"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <Link to={`/inward/details?id=${row.id}`}>
          <Button size="xs" variant="ghost" icon={Eye}>
            View GRN
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-brand-token" />
            Purchase Inward (GRN)
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Log inward consignments, verify supplier invoices, and generate inventory barcodes
          </p>
        </div>
        <Link to="/inward/create">
          <Button variant="primary" size="sm" icon={Plus}>
            New Inward Entry
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total GRNs: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Consignment Total: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(totalInwardVal)}</strong></span>
        <span>•</span>
        <span>Stock Audit: <strong className="text-brand-token font-medium">Auto Tagged</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search GRN # or vendor invoice..."
        filters={
          <>
            <Select
              size="xs"
              value={inwardStatusFilter}
              onChange={(e) => {
                setInwardStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All GRN Statuses", value: "all" },
                { label: "Received / Stocked", value: "received" },
                { label: "Draft Consignment", value: "draft" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
            <Select
              size="xs"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              options={vendorOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setInwardStatusFilter("all");
          setVendorFilter("all");
          setPage(1);
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchInwards}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Standard Reusable Data Table */}
      <Table
        columns={columns}
        data={filteredInwards}
        loading={loading}
        emptyMessage="No purchase inward consignments found."
        onRowClick={(row) => navigate(`/inward/details?id=${row.id}`)}
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-token">
          <span>Page {page} of {totalPages} ({formatQty(totalCount)} total GRNs)</span>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="xs"
              variant="outline"
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
