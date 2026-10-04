import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Plus,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  DollarSign,
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

export default function PaymentsListPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Metrics for single-line summary bar (Rule 2)
  const [metrics, setMetrics] = useState({
    totalInflow: 0,
    totalRefunds: 0,
    upiCount: 0,
    cashCount: 0,
    cardCount: 0,
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["reference_number.icontains"] = search.trim();
      }
      if (methodFilter !== "all") {
        filter["payment_method"] = methodFilter;
      }
      if (typeFilter !== "all") {
        filter["transaction_type"] = typeFilter;
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
        setPayments(res.data);
        setTotalCount(res.count || 0);
        setTotalPages(res.metadata?.total_pages || 1);

        const inflow = res.data
          .filter((p) => p.transaction_type === "payment")
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const refunds = res.data
          .filter((p) => p.transaction_type === "refund")
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const upi = res.data.filter((p) => p.payment_method === "upi").length;
        const cash = res.data.filter((p) => p.payment_method === "cash").length;
        const card = res.data.filter((p) => p.payment_method === "card").length;

        setMetrics({
          totalInflow: inflow,
          totalRefunds: refunds,
          upiCount: upi,
          cashCount: cash,
          cardCount: card,
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load payment transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, search, methodFilter, typeFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Payment Collections</h1>
            <p className="text-xs text-text-muted">Track customer payment receipts, UPI collections, and cash settlements</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPayments}
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
            title="Refresh Transactions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/payments/index/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Transactions: <strong className="text-text-primary font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Collections Inflow: <strong className="text-emerald-400 font-medium">{formatCurrency(metrics.totalInflow)}</strong></span>
        <span>•</span>
        <span>Total Refunds: <strong className="text-rose-400 font-medium">{formatCurrency(metrics.totalRefunds)}</strong></span>
        <span>•</span>
        <span>Net Cash Flow: <strong className="text-emerald-400 font-semibold">{formatCurrency(metrics.totalInflow - metrics.totalRefunds)}</strong></span>
        <span>•</span>
        <span>UPI: <strong className="text-text-primary font-medium">{formatQty(metrics.upiCount)}</strong></span>
        <span>•</span>
        <span>Cash: <strong className="text-text-primary font-medium">{formatQty(metrics.cashCount)}</strong></span>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by reference number (e.g. PAY-2026)..."
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
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-text-primary text-xs focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="payment">Payments Only</option>
              <option value="refund">Refunds Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-card border border-border/60 rounded-xl px-2.5 py-1.5 text-xs">
            <CreditCard className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-text-primary text-xs focus:outline-none"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-surface-card/80 text-text-muted font-medium">
                <th className="py-3 px-4">Voucher / Ref #</th>
                <th className="py-3 px-4">Sale Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    No payment transactions found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isRefund = p.transaction_type === "refund";
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-text-primary">
                        {p.reference_number || `TX-${p.id}`}
                      </td>
                      <td className="py-3 px-4 font-mono text-primary">
                        {p.sale?.sale_number ? (
                          <Link to={`/sales/details?id=${p.sale.id}`} className="hover:underline">
                            {p.sale.sale_number}
                          </Link>
                        ) : p.sales_return?.return_number ? (
                          <span className="text-rose-400">{p.sales_return.return_number}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4 text-text-primary font-medium">
                        {p.customer?.name || p.sale?.customer_name || "Guest Customer"}
                      </td>
                      <td className="py-3 px-4 text-text-muted">
                        {p.transacted_at ? new Date(p.transacted_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isRefund
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isRefund ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          <span className="capitalize">{p.transaction_type}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize text-text-muted">
                        {p.payment_method?.replace("_", " ")}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          isRefund ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {isRefund ? `-${formatCurrency(p.amount)}` : formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-text-muted">
                        {p.notes || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 text-xs text-text-muted">
            <span>
              Page {page} of {totalPages} ({totalCount} total transactions)
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
