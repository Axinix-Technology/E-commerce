import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RotateCcw,
  Plus,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Package,
  CreditCard,
  Filter
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

// Rule 1: Zero values rendered as em-dash
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

export default function ReturnsListPage() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

      if (res?.data) {
        setReturns(res.data);
        setTotalCount(res.count || 0);
        setTotalPages(res.metadata?.total_pages || 1);

        const totalVal = res.data.reduce((sum, r) => sum + (Number(r.total_refund_amount) || 0), 0);
        const req = res.data.filter((r) => r.status === "requested").length;
        const app = res.data.filter((r) => r.status === "approved").length;
        const comp = res.data.filter((r) => r.status === "completed" || r.status === "refunded").length;

        setMetrics({
          totalRefundsVal: totalVal,
          requestedCount: req,
          approvedCount: app,
          completedCount: comp,
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [page, search, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> {status}
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Requested
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Customer Returns (RMA)</h1>
            <p className="text-xs text-text-muted">Manage product returns, refund approvals, and restock inspections</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReturns}
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
            title="Refresh Returns"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/returns/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Return Request
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Total Returns: <strong className="text-text-primary font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Refunds Value: <strong className="text-rose-400 font-medium">{formatCurrency(metrics.totalRefundsVal)}</strong></span>
        <span>•</span>
        <span>Pending Review: <strong className="text-amber-400 font-medium">{formatQty(metrics.requestedCount)}</strong></span>
        <span>•</span>
        <span>Approved: <strong className="text-blue-400 font-medium">{formatQty(metrics.approvedCount)}</strong></span>
        <span>•</span>
        <span>Completed: <strong className="text-emerald-400 font-medium">{formatQty(metrics.completedCount)}</strong></span>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search return number (e.g. RET-2026)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-surface-card border border-border/60 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-text-primary text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="approved">Approved</option>
              <option value="received">Received</option>
              <option value="refunded">Refunded</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-surface-card/80 text-text-muted font-medium">
                <th className="py-3 px-4">Return #</th>
                <th className="py-3 px-4">Original Sale #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Requested At</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Refund Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading returns...
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    No customer returns found.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-rose-400">
                      {ret.return_number}
                    </td>
                    <td className="py-3 px-4 font-mono text-primary">
                      {ret.sale?.sale_number || "—"}
                    </td>
                    <td className="py-3 px-4 font-medium text-text-primary">
                      {ret.customer?.name || ret.sale?.customer_name || "Guest Customer"}
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      {ret.requested_at ? new Date(ret.requested_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-text-muted">
                      {ret.reason || "Customer return request"}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(ret.status)}</td>
                    <td className="py-3 px-4 text-right font-medium text-rose-400">
                      {formatCurrency(ret.total_refund_amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/returns/create?id=${ret.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-card/80 border border-border/60 text-text-muted hover:text-text-primary text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 text-xs text-text-muted">
            <span>
              Page {page} of {totalPages} ({totalCount} total returns)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-border/60 disabled:opacity-40 hover:bg-surface-card transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-border/60 disabled:opacity-40 hover:bg-surface-card transition-colors"
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
