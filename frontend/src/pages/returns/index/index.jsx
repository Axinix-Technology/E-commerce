import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RotateCcw,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Package,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Select, Table, Badge, FilterBar } from "../../../components/ui";

export default function ReturnsListPage() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Metrics for single-line summary bar (Rule 2)
  const [metrics, setMetrics] = useState({
    totalRefundsVal: 0,
    requestedCount: 0,
    approvedCount: 0,
    completedCount: 0,
  });

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["return_number.icontains"] = search.trim();
      }
      if (statusFilter !== "all") {
        filter["status"] = statusFilter;
      }
      if (reasonFilter !== "all") {
        filter["reason.icontains"] = reasonFilter;
      }

      const res = await populateApi.read("sales_return", {
        filter,
        page,
        limit: 15,
        populate: {
          sale: ["id", "sale_number", "customer_name", "total_amount"],
          customer: ["id", "name", "phone"],
        },
        sort: ["-requested_at"],
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      setReturns(list);
      setTotalCount(res?.count || list.length);
      setTotalPages(res?.metadata?.total_pages || Math.ceil(list.length / 15) || 1);

      const totalVal = list.reduce((sum, r) => sum + (Number(r.total_refund_amount) || 0), 0);
      const req = list.filter((r) => r.status === "requested").length;
      const app = list.filter((r) => r.status === "approved").length;
      const comp = list.filter((r) => r.status === "completed" || r.status === "refunded").length;

      setMetrics({
        totalRefundsVal: totalVal,
        requestedCount: req,
        approvedCount: app,
        completedCount: comp,
      });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [page, search, statusFilter, reasonFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setReasonFilter("all");
    setPage(1);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge variant="cyan" dot>Approved</Badge>;
      case "completed":
      case "refunded":
        return <Badge variant="emerald" dot>Refunded</Badge>;
      case "rejected":
        return <Badge variant="rose" dot>Rejected</Badge>;
      default:
        return <Badge variant="amber" dot>Requested</Badge>;
    }
  };

  const columns = [
    {
      key: "return_number",
      header: "RMA # / Date",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val || `RMA-${row.id}`}</span>
          <span className="text-[10px] text-muted-token">
            {row.requested_at ? new Date(row.requested_at).toLocaleString() : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "sale",
      header: "Original Sale Order",
      render: (val) => (
        <span className="font-mono text-xs text-brand-token font-semibold">
          {val?.sale_number || "—"}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary-token">
            {val?.name || row.sale?.customer_name || "Guest Customer"}
          </span>
          <span className="text-[10px] text-muted-token">{val?.phone || "—"}</span>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Return Reason",
      render: (val) => (
        <span className="text-secondary-token text-xs truncate max-w-[200px] block" title={val}>
          {val || "Unspecified"}
        </span>
      ),
    },
    {
      key: "total_refund_amount",
      header: "Refund (₹)",
      align: "right",
      render: (val) => (
        <span className="font-bold text-rose-700 dark:text-rose-400 font-mono">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "status",
      header: "RMA Status",
      render: (val) => renderStatusBadge(val),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <Link to={`/returns/create?id=${row.id}&sale_id=${row.sale_id || row.sale?.id || ""}`}>
          <Button size="xs" variant="ghost" icon={Eye}>
            Details
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
            <RotateCcw className="w-5 h-5 text-brand-token" />
            Sales Returns & RMA
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Process return merchandise authorizations, restocking, and customer refunds
          </p>
        </div>
        <Link to="/returns/create">
          <Button variant="primary" size="sm" icon={Plus}>
            New RMA Request
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total Returns: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Refund Sum: <strong className="text-rose-700 dark:text-rose-400 font-semibold">{formatCurrency(metrics.totalRefundsVal)}</strong></span>
        <span>•</span>
        <span>Pending Approval: <strong className="text-amber-800 dark:text-amber-400 font-medium">{formatQty(metrics.requestedCount)}</strong></span>
        <span>•</span>
        <span>Approved: <strong className="text-cyan-800 dark:text-cyan-400 font-medium">{formatQty(metrics.approvedCount)}</strong></span>
        <span>•</span>
        <span>Settled: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatQty(metrics.completedCount)}</strong></span>
      </div>

      {/* Standard Reusable Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search RMA number or customer..."
        onReset={handleResetFilters}
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
                { label: "Requested", value: "requested" },
                { label: "Approved", value: "approved" },
                { label: "Completed / Refunded", value: "completed" },
                { label: "Rejected", value: "rejected" },
              ]}
            />
            <Select
              size="xs"
              value={reasonFilter}
              onChange={(e) => {
                setReasonFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Return Reasons", value: "all" },
                { label: "Damaged / Defect", value: "defect" },
                { label: "Size Mismatch", value: "size" },
                { label: "Customer Request", value: "customer" },
              ]}
            />
          </>
        }
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchReturns}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Standard Data Table */}
      <Table
        columns={columns}
        data={returns}
        loading={loading}
        emptyMessage="No return requests recorded."
        onRowClick={(row) => navigate(`/returns/create?id=${row.id}&sale_id=${row.sale_id || row.sale?.id || ""}`)}
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-token">
          <span>Page {page} of {totalPages} ({formatQty(totalCount)} total RMAs)</span>
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
