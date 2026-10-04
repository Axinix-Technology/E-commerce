import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Search,
  RefreshCw,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
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

export default function PaymentsReportPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("all");

  const [metrics, setMetrics] = useState({
    totalInflow: 0,
    totalRefunds: 0,
    netIntake: 0,
    cashTotal: 0,
    upiTotal: 0,
    cardTotal: 0,
    bankTotal: 0,
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("sale_payment", {
        limit: 500,
        populate: {
          sale: ["id", "sale_number", "customer_name"],
          customer: ["id", "name"],
        },
        sort: ["-transacted_at"],
      });

      if (res?.data) {
        let list = res.data;
        if (methodFilter !== "all") {
          list = list.filter((p) => p.payment_method === methodFilter);
        }
        setPayments(list);

        const inflow = list
          .filter((p) => p.transaction_type === "payment")
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const refunds = list
          .filter((p) => p.transaction_type === "refund")
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const cash = list
          .filter((p) => p.payment_method === "cash")
          .reduce((sum, p) => sum + (p.transaction_type === "payment" ? Number(p.amount) : -Number(p.amount)), 0);
        const upi = list
          .filter((p) => p.payment_method === "upi")
          .reduce((sum, p) => sum + (p.transaction_type === "payment" ? Number(p.amount) : -Number(p.amount)), 0);
        const card = list
          .filter((p) => p.payment_method === "card")
          .reduce((sum, p) => sum + (p.transaction_type === "payment" ? Number(p.amount) : -Number(p.amount)), 0);
        const bank = list
          .filter((p) => p.payment_method === "bank_transfer")
          .reduce((sum, p) => sum + (p.transaction_type === "payment" ? Number(p.amount) : -Number(p.amount)), 0);

        setMetrics({
          totalInflow: inflow,
          totalRefunds: refunds,
          netIntake: inflow - refunds,
          cashTotal: cash,
          upiTotal: upi,
          cardTotal: card,
          bankTotal: bank,
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load payments report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter]);

  const handleExportCSV = () => {
    const headers = "Reference #,Sale Number,Customer,Type,Method,Amount,Transacted At,Notes\n";
    const rows = payments
      .map(
        (p) =>
          `"${p.reference_number || "—"}","${p.sale?.sale_number || "—"}","${p.customer?.name || "Guest"}","${p.transaction_type}","${p.payment_method}",${p.amount},"${p.transacted_at}","${p.notes || "—"}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `payment_reconciliation_${methodFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Payment Reconciliation Report</h1>
            <p className="text-xs text-text-muted">Reconciliation across Cash counter, UPI, POS cards, and net deposits</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-surface-card border border-border/60 rounded-xl px-2.5 py-1.5 text-xs">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-transparent text-text-primary text-xs focus:outline-none capitalize"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash Only</option>
              <option value="upi">UPI Only</option>
              <option value="card">Card Only</option>
              <option value="bank_transfer">Bank Transfer Only</option>
            </select>
          </div>

          <button
            onClick={fetchPayments}
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
            title="Refresh Report"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Inflow: <strong className="text-emerald-400 font-medium">{formatCurrency(metrics.totalInflow)}</strong></span>
        <span>•</span>
        <span>Refunds: <strong className="text-rose-400 font-medium">{formatCurrency(metrics.totalRefunds)}</strong></span>
        <span>•</span>
        <span>Net Cash Flow: <strong className="text-emerald-400 font-semibold">{formatCurrency(metrics.netIntake)}</strong></span>
        <span>•</span>
        <span>UPI Net: <strong className="text-text-primary font-medium">{formatCurrency(metrics.upiTotal)}</strong></span>
        <span>•</span>
        <span>Cash Net: <strong className="text-text-primary font-medium">{formatCurrency(metrics.cashTotal)}</strong></span>
        <span>•</span>
        <span>Card Net: <strong className="text-text-primary font-medium">{formatCurrency(metrics.cardTotal)}</strong></span>
      </div>

      {/* Reconciliation Table */}
      <div className="rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-surface-card/80 text-text-muted font-medium">
                <th className="py-3 px-4">Ref / Voucher #</th>
                <th className="py-3 px-4">Sale Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Reconciling payment ledgers...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    No payment transactions found for this selection.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const isRefund = p.transaction_type === "refund";
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono font-medium text-text-primary">
                        {p.reference_number || `TX-${p.id}`}
                      </td>
                      <td className="py-3 px-4 font-mono text-primary">
                        {p.sale?.sale_number ? (
                          <Link to={`/sales/details?id=${p.sale.id}`} className="hover:underline">
                            {p.sale.sale_number}
                          </Link>
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
