import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  RefreshCw,
  Download,
  ShoppingBag,
  TrendingUp,
  UserCheck
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

export default function CustomerPurchasesReportPage() {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, salesRes] = await Promise.all([
        populateApi.read("customer_master", { limit: 200, sort: ["name"] }),
        populateApi.read("sale", { limit: 500, sort: ["-sold_at"] }),
      ]);

      const customerList = custRes?.data || [];
      const salesList = salesRes?.data || [];

      // Compute lifetime purchase aggregates per customer
      const aggregated = customerList.map((c) => {
        const custSales = salesList.filter(
          (s) => String(s.customer_id) === String(c.id) || (s.customer_phone && s.customer_phone === c.phone)
        );

        const totalSpent = custSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
        const orderCount = custSales.length;
        const avgOrder = orderCount > 0 ? totalSpent / orderCount : 0;
        const lastOrder = custSales.length > 0 ? custSales[0].sold_at : null;

        return {
          id: c.id,
          name: c.name,
          phone: c.phone || "—",
          email: c.email || "—",
          city: c.city || "—",
          orderCount,
          totalSpent,
          avgOrder,
          lastOrder,
        };
      });

      // Sort by total spent descending
      aggregated.sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(aggregated);
      setSales(salesList);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load customer purchase report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalPurchasingCustomers = customers.filter((c) => c.orderCount > 0).length;
  const overallAvg =
    totalPurchasingCustomers > 0 ? totalRevenue / totalPurchasingCustomers : 0;

  const handleExportCSV = () => {
    const headers = "Customer Name,Phone,Email,City,Total Orders,Lifetime Spend,Avg Order Value,Last Order\n";
    const rows = filteredCustomers
      .map(
        (c) =>
          `"${c.name}","${c.phone}","${c.email}","${c.city}",${c.orderCount},${c.totalSpent},${c.avgOrder},"${c.lastOrder || "—"}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customer_purchases_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Customer Purchase Analytics</h1>
            <p className="text-xs text-text-muted">Customer lifetime value, purchase frequency, and average basket size</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
            title="Refresh Analytics"
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
        <span>Registered Customers: <strong className="text-text-primary font-medium">{formatQty(customers.length)}</strong></span>
        <span>•</span>
        <span>Active Buyers: <strong className="text-text-primary font-medium">{formatQty(totalPurchasingCustomers)}</strong></span>
        <span>•</span>
        <span>Cumulative Spend: <strong className="text-emerald-400 font-semibold">{formatCurrency(totalRevenue)}</strong></span>
        <span>•</span>
        <span>Avg Lifetime Value: <strong className="text-emerald-400 font-medium">{formatCurrency(overallAvg)}</strong></span>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Filter by customer name, phone number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Customers Analytics Table */}
      <div className="rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-surface-card/80 text-text-muted font-medium">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4 text-center">Total Orders</th>
                <th className="py-3 px-4 text-right">Avg Order Value</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
                <th className="py-3 px-4 text-center">Last Purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Calculating customer metrics...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    No customer purchase data matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-medium text-text-primary">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-text-muted">{c.phone}</td>
                    <td className="py-3 px-4 text-text-muted">{c.city}</td>
                    <td className="py-3 px-4 text-center font-medium">
                      {formatQty(c.orderCount)}
                    </td>
                    <td className="py-3 px-4 text-right text-text-muted">
                      {formatCurrency(c.avgOrder)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-center text-text-muted">
                      {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString() : "—"}
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
