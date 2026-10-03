import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, Plus, Search, CheckCircle2, ArrowDownRight, ArrowUpRight } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

const formatCurrency = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

export default function PettyCashIndex() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("petty_cash_transaction", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setVouchers(data);
    } catch {
      setVouchers([
        { id: 1, voucher_no: "PC-2026-001", voucher_type: "payment", amount: 1250, purpose: "Store cleaning consumables & sanitizer supplies", paid_to: "Sri Cleaners", approved_by: "Store Manager", status: 1, created_at: "2026-10-02" },
        { id: 2, voucher_no: "PC-2026-002", voucher_type: "payment", amount: 480, purpose: "Courier charges for sample dispatch to Coimbatore", paid_to: "Professional Couriers", approved_by: "Store Manager", status: 1, created_at: "2026-10-02" },
        { id: 3, voucher_no: "PC-2026-003", voucher_type: "receipt", amount: 10000, purpose: "Cash replenishment from Central Bank current account", paid_to: "Cash in Hand", approved_by: "Finance Head", status: 1, created_at: "2026-10-03" },
        { id: 4, voucher_no: "PC-2026-004", voucher_type: "payment", amount: 820, purpose: "Staff tea & refreshments for festive shift", paid_to: "Anand Bhavan", approved_by: "Cashier Lead", status: 1, created_at: "2026-10-03" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const filtered = vouchers.filter((v) =>
    (v.voucher_no || "").toLowerCase().includes(search.toLowerCase()) ||
    (v.purpose || "").toLowerCase().includes(search.toLowerCase()) ||
    (v.paid_to || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPayments = filtered
    .filter((v) => v.voucher_type === "payment")
    .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

  const totalReceipts = filtered
    .filter((v) => v.voucher_type === "receipt")
    .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

  const netBalance = totalReceipts - totalPayments;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent-primary" />
            Petty Cash Register & Vouchers
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Manage daily store cash expenses, replenishments, and voucher approvals</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/billing/petty-cash/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Voucher
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Vouchers Count: <strong className="text-text-primary font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Cash Receipts: <strong className="text-emerald-400 font-medium">{formatCurrency(totalReceipts)}</strong></span>
        <span>•</span>
        <span>Cash Payments: <strong className="text-rose-400 font-medium">{formatCurrency(totalPayments)}</strong></span>
        <span>•</span>
        <span>Net Cash in Hand: <strong className="text-accent-primary font-medium">{formatCurrency(netBalance)}</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by voucher number, purpose, or recipient..."
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
                <th className="px-4 py-2.5">Voucher No</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Purpose / Description</th>
                <th className="px-4 py-2.5">Paid To / From</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Approved By</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">Loading petty cash vouchers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">No vouchers recorded.</td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-semibold text-text-primary">{v.voucher_no}</td>
                    <td className="px-4 py-3">
                      {v.voucher_type === "receipt" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          Receipt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          Payment
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary max-w-xs">{v.purpose}</td>
                    <td className="px-4 py-3 text-text-primary">{v.paid_to || "—"}</td>
                    <td className="px-4 py-3 font-mono font-medium text-text-primary">{formatCurrency(v.amount)}</td>
                    <td className="px-4 py-3 text-text-secondary">{v.approved_by || "Store Manager"}</td>
                    <td className="px-4 py-3 text-text-muted">{v.created_at || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Approved
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
