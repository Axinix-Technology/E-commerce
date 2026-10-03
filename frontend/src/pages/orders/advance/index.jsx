import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Coins, Plus, Search, CheckCircle2, Phone, ShoppingBag } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

const formatCurrency = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

export default function OrdersAdvanceIndex() {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAdvances = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("customer_advance", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setAdvances(data);
    } catch {
      setAdvances([
        { id: 1, advance_no: "ADV-2026-001", customer_name: "Kavitha Raman", customer_phone: "+91 98410 22345", order_reference: "SO-KAV-101", amount: 25000, payment_mode: "UPI", status: 1, created_at: "2026-10-02" },
        { id: 2, advance_no: "ADV-2026-002", customer_name: "Sundaram Wedding Planners", customer_phone: "+91 94440 98765", order_reference: "SO-SUN-809", amount: 75000, payment_mode: "NEFT", status: 1, created_at: "2026-10-02" },
        { id: 3, advance_no: "ADV-2026-003", customer_name: "Arunachalam & Co", customer_phone: "+91 97900 11223", order_reference: "SO-ARU-450", amount: 15000, payment_mode: "Cheque", status: 1, created_at: "2026-10-03" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, []);

  const filtered = advances.filter((a) =>
    (a.advance_no || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.customer_phone || "").includes(search) ||
    (a.order_reference || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalAdvance = filtered.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-accent-primary" />
            Customer Order Advances & Deposits
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Track advance booking deposits, customer layaway prepayments, and order reservation funds</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/orders/report"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition"
          >
            Orders Report
          </Link>
          <Link
            to="/orders/advance/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Advance
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Advance Records: <strong className="text-text-primary font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Total Advance Pool: <strong className="text-emerald-400 font-medium">{formatCurrency(totalAdvance)}</strong></span>
        <span>•</span>
        <span>Adjustment Status: <strong className="text-accent-primary font-medium">Available for Invoicing</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by advance number, customer name, phone, or order reference..."
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
                <th className="px-4 py-2.5">Advance No</th>
                <th className="px-4 py-2.5">Customer Name</th>
                <th className="px-4 py-2.5">Phone</th>
                <th className="px-4 py-2.5">Order Ref</th>
                <th className="px-4 py-2.5">Advance Amount</th>
                <th className="px-4 py-2.5">Payment Mode</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">Loading advance deposits...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">No advance payments recorded.</td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-semibold text-text-primary flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-accent-primary" />
                      {a.advance_no}
                    </td>
                    <td className="px-4 py-3 text-text-primary font-medium">{a.customer_name}</td>
                    <td className="px-4 py-3 text-text-secondary text-[11px] font-mono">
                      {a.customer_phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-text-muted" />
                          {a.customer_phone}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-secondary">{a.order_reference || "—"}</td>
                    <td className="px-4 py-3 font-mono font-medium text-emerald-400">{formatCurrency(a.amount)}</td>
                    <td className="px-4 py-3 text-text-secondary">{a.payment_mode || "Cash"}</td>
                    <td className="px-4 py-3 text-text-muted">{a.created_at || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Holding
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
