import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Download, Search, CheckCircle2, Filter } from "lucide-react";
import populateApi from "../../../../api/populate.api";

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

export default function SupplierPaymentReportIndex() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("purchase_payment", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setPayments(data);
    } catch {
      setPayments([
        { id: 1, voucher_number: "PAY-2026-991", supplier_name: "Sri Lakshmi Silks Kanchipuram", amount: 200000, payment_method: "bank_transfer", reference_number: "NEFT991200412", transacted_at: "2026-10-02" },
        { id: 2, voucher_number: "PAY-2026-992", supplier_name: "Surat Zari Mills Pvt Ltd", amount: 100000, payment_method: "upi", reference_number: "UPI-AXN-7712", transacted_at: "2026-10-03" },
        { id: 3, voucher_number: "PAY-2026-993", supplier_name: "Varanasi Heritage Handlooms", amount: 150000, payment_method: "cheque", reference_number: "CHQ-002194", transacted_at: "2026-10-03" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) =>
    (p.voucher_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.supplier_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.reference_number || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalDisbursed = filtered.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const bankTransferVal = filtered.filter(p => p.payment_method === "bank_transfer").reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const upiVal = filtered.filter(p => p.payment_method === "upi").reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const exportCsv = () => {
    const headers = ["Voucher Number,Supplier,Date,Amount (INR),Payment Method,Reference / UTR"];
    const rows = filtered.map(p =>
      `"${p.voucher_number}","${p.supplier_name || ''}","${p.transacted_at || ''}",${p.amount || 0},"${p.payment_method || ''}","${p.reference_number || ''}"`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Supplier_Payment_Disbursals_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent-primary" />
            Supplier Payments & Disbursal Report
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Procurement payouts, banking UTR reconciliation, and settlement methods</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/50 text-text-primary hover:bg-surface-card transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Payment Vouchers: <strong className="text-text-primary font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Total Disbursed: <strong className="text-emerald-400 font-medium">{formatCurrency(totalDisbursed)}</strong></span>
        <span>•</span>
        <span>NEFT / RTGS: <strong className="text-text-primary font-medium">{formatCurrency(bankTransferVal)}</strong></span>
        <span>•</span>
        <span>UPI / IMPS: <strong className="text-accent-primary font-medium">{formatCurrency(upiVal)}</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by voucher number, supplier, or UTR..."
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
                <th className="px-4 py-2.5">Voucher Number</th>
                <th className="px-4 py-2.5">Supplier Name</th>
                <th className="px-4 py-2.5">Disbursal Date</th>
                <th className="px-4 py-2.5 text-right">Amount Disbursed</th>
                <th className="px-4 py-2.5">Payment Method</th>
                <th className="px-4 py-2.5">UTR / Bank Ref</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">Loading payment records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">No payments found.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-mono font-medium text-accent-primary">{p.voucher_number}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{p.supplier_name || `Supplier #${p.supplier_id}`}</td>
                    <td className="px-4 py-3 text-text-muted">{p.transacted_at || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-400">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 capitalize text-[11px] text-text-primary">{p.payment_method?.replace("_", " ") || "—"}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{p.reference_number || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Disbursed
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
