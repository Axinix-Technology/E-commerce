import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  ShoppingBag,
  CreditCard,
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

export default function SalesSummaryReportPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  const [aggregates, setAggregates] = useState({
    totalOrders: 0,
    grossSales: 0,
    totalTax: 0,
    totalDiscount: 0,
    netSales: 0,
  });

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("sale", {
        limit: 500,
        sort: ["-sold_at"],
      });

      if (res?.data) {
        let filtered = res.data;
        const now = new Date();

        if (period === "today") {
          const todayStr = now.toISOString().split("T")[0];
          filtered = filtered.filter((s) => s.sold_at?.startsWith(todayStr));
        } else if (period === "7days") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((s) => new Date(s.sold_at) >= weekAgo);
        } else if (period === "30days") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((s) => new Date(s.sold_at) >= monthAgo);
        }

        setSales(filtered);

        const totalOrders = filtered.length;
        const grossSales = filtered.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
        const totalTax = filtered.reduce((sum, s) => sum + (Number(s.tax_amount) || 0), 0);
        const totalDiscount = filtered.reduce((sum, s) => sum + (Number(s.discount_amount) || 0), 0);
        const netSales = grossSales - totalTax;

        setAggregates({
          totalOrders,
          grossSales,
          totalTax,
          totalDiscount,
          netSales,
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load sales summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [period]);

  const handleExportCSV = () => {
    const headers = "Sale Number,Sold At,Customer,Status,Payment Status,Subtotal,Tax,Discount,Total\n";
    const rows = sales
      .map(
        (s) =>
          `"${s.sale_number}","${s.sold_at}","${s.customer_name || "Guest"}","${s.status}","${s.payment_status}",${s.subtotal},${s.tax_amount},${s.discount_amount},${s.total_amount}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sales_summary_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Sales Summary Report</h1>
            <p className="text-xs text-text-muted">Aggregated store revenue, GST tax collections, and transaction velocity</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-surface-card border border-border/60 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-text-primary text-xs focus:outline-none"
            >
              <option value="all">All-Time Cumulative</option>
              <option value="today">Today Only</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          <button
            onClick={fetchSalesData}
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
        <span>Orders: <strong className="text-text-primary font-medium">{formatQty(aggregates.totalOrders)}</strong></span>
        <span>•</span>
        <span>Gross Volume: <strong className="text-emerald-400 font-semibold">{formatCurrency(aggregates.grossSales)}</strong></span>
        <span>•</span>
        <span>GST Collected: <strong className="text-emerald-400 font-medium">{formatCurrency(aggregates.totalTax)}</strong></span>
        <span>•</span>
        <span>Discounts Given: <strong className="text-rose-400 font-medium">{formatCurrency(aggregates.totalDiscount)}</strong></span>
        <span>•</span>
        <span>Net Revenue: <strong className="text-text-primary font-medium">{formatCurrency(aggregates.netSales)}</strong></span>
      </div>

      {/* Orders Breakdown Table */}
      <div className="rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-surface-card/80 text-text-muted font-medium">
                <th className="py-3 px-4">Sale Order #</th>
                <th className="py-3 px-4">Sold At</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
                <th className="py-3 px-4 text-right">Tax (GST)</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Calculating sales metrics...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    No sales data found for the selected period.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-mono font-medium text-primary">
                      <Link to={`/sales/details?id=${s.id}`} className="hover:underline">
                        {s.sale_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      {s.sold_at ? new Date(s.sold_at).toLocaleString() : "—"}
                    </td>
                    <td className="py-3 px-4 font-medium text-text-primary">
                      {s.customer_name || "Guest Customer"}
                    </td>
                    <td className="py-3 px-4 text-right text-text-muted">
                      {formatCurrency(s.subtotal)}
                    </td>
                    <td className="py-3 px-4 text-right text-text-muted">
                      {formatCurrency(s.tax_amount)}
                    </td>
                    <td className="py-3 px-4 text-right text-rose-400">
                      {formatCurrency(s.discount_amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-400">
                      {formatCurrency(s.total_amount)}
                    </td>
                    <td className="py-3 px-4 text-center capitalize">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-white/[0.04] text-text-muted">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
