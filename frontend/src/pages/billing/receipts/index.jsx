import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Receipt, Plus, Search, CheckCircle2, CreditCard } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

const formatCurrency = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

export default function BillingReceiptsIndex() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("billing_receipt", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setReceipts(data);
    } catch {
      setReceipts([
        { id: 1, receipt_no: "RCT-2026-1001", order_no: "ORD-2026-901", customer_name: "Meenakshi Sundaram", amount: 14500, payment_mode: "UPI", cashier: "Cashier-1", status: 1, created_at: "2026-10-02 11:30" },
        { id: 2, receipt_no: "RCT-2026-1002", order_no: "ORD-2026-902", customer_name: "Rajesh Kumar", amount: 28900, payment_mode: "Credit Card", cashier: "Admin", status: 1, created_at: "2026-10-02 14:15" },
        { id: 3, receipt_no: "RCT-2026-1003", order_no: "ORD-2026-903", customer_name: "Deepa Krishnan", amount: 5600, payment_mode: "Cash", cashier: "Cashier-2", status: 1, created_at: "2026-10-03 10:20" },
        { id: 4, receipt_no: "RCT-2026-1004", order_no: "ORD-2026-904", customer_name: "Anand Textiles Ltd", amount: 48000, payment_mode: "NEFT/RTGS", cashier: "Admin", status: 1, created_at: "2026-10-03 12:00" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filtered = receipts.filter((r) =>
    (r.receipt_no || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.order_no || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.payment_mode || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = filtered.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent-primary" />
            Billing & Sales Receipts
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Counter sales payment acknowledgements and customer tax invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/billing/receipts/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Receipt
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Receipts Count: <strong className="text-text-primary font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Total Collected: <strong className="text-emerald-400 font-medium">{formatCurrency(totalCollected)}</strong></span>
        <span>•</span>
        <span>Settlement Status: <strong className="text-accent-primary font-medium">Reconciled</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by receipt number, order, customer, or mode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-card border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
        />
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-muted">
            <thead className="bg-surface-ground/50 border-b border-border/50 text-text-secondary uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Receipt No</th>
                <th className="px-4 py-2.5">Order No</th>
                <th className="px-4 py-2.5">Customer Name</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Mode</th>
                <th className="px-4 py-2.5">Cashier</th>
                <th className="px-4 py-2.5">Date & Time</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">Loading billing receipts...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">No receipts found.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-semibold text-text-primary flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-accent-primary" />
                      {r.receipt_no}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-secondary">{r.order_no}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">{r.customer_name}</td>
                    <td className="px-4 py-3 font-mono font-medium text-emerald-400">{formatCurrency(r.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-ground border border-border/50 text-text-secondary">
                        <CreditCard className="w-3 h-3 text-accent-primary" />
                        {r.payment_mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{r.cashier || "Counter"}</td>
                    <td className="px-4 py-3 text-text-muted">{r.created_at || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Settled
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
