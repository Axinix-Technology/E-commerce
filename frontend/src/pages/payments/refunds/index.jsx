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
  ArrowDownLeft,
  CreditCard,
  User,
  ShoppingBag
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

export default function RefundsListPage() {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Metrics for single-line summary bar (Rule 2)
  const [totalRefundVal, setTotalRefundVal] = useState(0);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const filter = {
        transaction_type: "refund",
      };
      if (search.trim()) {
        filter["reference_number.icontains"] = search.trim();
      }

      const res = await populateApi.read("sale_payment", {
        filter,
        page,
        limit: 15,
        populate: {
          sale: ["id", "sale_number", "customer_name"],
          customer: ["id", "name", "phone"],
          sales_return: ["id", "return_number"],
        },
        sort: ["-transacted_at"],
      });

      if (res?.data) {
        setRefunds(res.data);
        setTotalCount(res.count || 0);
        setTotalPages(res.metadata?.total_pages || 1);

        const totalVal = res.data.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        setTotalRefundVal(totalVal);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load refund transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [page, search]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Customer Refunds</h1>
            <p className="text-xs text-text-muted">Process and track customer refund vouchers and payout reversals</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRefunds}
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
            title="Refresh Refunds"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/payments/refunds/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Process Refund
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Refund Vouchers: <strong className="text-text-primary font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Total Disbursed: <strong className="text-rose-400 font-semibold">{formatCurrency(totalRefundVal)}</strong></span>
        <span>•</span>
        <span>Direct Gateways: <strong className="text-text-primary font-medium">Auto-Reversal</strong></span>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by refund reference (e.g. REF-2026)..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-9 pr-4 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Refunds Table */}
      <div className="rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-surface-card/80 text-text-muted font-medium">
                <th className="py-3 px-4">Refund Ref #</th>
                <th className="py-3 px-4">Sale Order #</th>
                <th className="py-3 px-4">Return #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Refund Amount</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading refunds...
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    No refund vouchers found.
                  </td>
                </tr>
              ) : (
                refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-rose-400">
                      {r.reference_number || `REF-${r.id}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-primary">
                      {r.sale?.sale_number ? (
                        <Link to={`/sales/details?id=${r.sale.id}`} className="hover:underline">
                          {r.sale.sale_number}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-text-muted">
                      {r.sales_return?.return_number || "—"}
                    </td>
                    <td className="py-3 px-4 font-medium text-text-primary">
                      {r.customer?.name || r.sale?.customer_name || "Guest Customer"}
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      {r.transacted_at ? new Date(r.transacted_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4 capitalize text-text-muted">
                      {r.payment_method?.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-rose-400">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-text-muted">
                      {r.notes || "—"}
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
              Page {page} of {totalPages} ({totalCount} total refund records)
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
