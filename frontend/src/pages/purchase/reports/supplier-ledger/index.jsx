import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Download, Search, Calendar, FileText } from "lucide-react";
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

export default function SupplierLedgerIndex() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLedger = async () => {
    setLoading(true);
    try {
      setEntries([
        { id: 1, date: "2026-10-01", supplier_name: "Sri Lakshmi Silks Kanchipuram", voucher_type: "GRN Inward Bill", voucher_no: "GRN-2026-001", debit: 0, credit: 441000, balance: 441000 },
        { id: 2, date: "2026-10-02", supplier_name: "Sri Lakshmi Silks Kanchipuram", voucher_type: "RTV Debit Note", voucher_no: "RTV-2026-001", debit: 22500, credit: 0, balance: 418500 },
        { id: 3, date: "2026-10-02", supplier_name: "Sri Lakshmi Silks Kanchipuram", voucher_type: "NEFT Bank Payment", voucher_no: "PAY-2026-991", debit: 200000, credit: 0, balance: 218500 },
        { id: 4, date: "2026-10-02", supplier_name: "Surat Zari Mills Pvt Ltd", voucher_type: "GRN Inward Bill", voucher_no: "GRN-2026-002", debit: 0, credit: 189000, balance: 189000 },
        { id: 5, date: "2026-10-03", supplier_name: "Surat Zari Mills Pvt Ltd", voucher_type: "IMPS Payout", voucher_no: "PAY-2026-992", debit: 100000, credit: 0, balance: 89000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const filtered = entries.filter((e) =>
    (e.supplier_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.voucher_no || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.voucher_type || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCredits = filtered.reduce((acc, e) => acc + (Number(e.credit) || 0), 0);
  const totalDebits = filtered.reduce((acc, e) => acc + (Number(e.debit) || 0), 0);
  const netClosingBalance = totalCredits - totalDebits;

  const exportCsv = () => {
    const headers = ["Date,Supplier,Voucher Type,Voucher No,Debit Paid (INR),Credit Billed (INR),Balance (INR)"];
    const rows = filtered.map(e =>
      `"${e.date}","${e.supplier_name}","${e.voucher_type}","${e.voucher_no}",${e.debit || 0},${e.credit || 0},${e.balance || 0}`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Supplier_Ledger_Statement_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-primary" />
            Supplier Account Statement & Ledger
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Chronological double-entry debit and credit transactions with running balance</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/50 text-text-primary hover:bg-surface-card transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export Statement
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Vouchers: <strong className="text-text-primary font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Total Billed (Cr): <strong className="text-text-primary font-medium">{formatCurrency(totalCredits)}</strong></span>
        <span>•</span>
        <span>Total Disbursed (Dr): <strong className="text-emerald-400 font-medium">{formatCurrency(totalDebits)}</strong></span>
        <span>•</span>
        <span>Net Closing Balance: <strong className="text-amber-400 font-medium">{formatCurrency(netClosingBalance)}</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by supplier name or voucher reference..."
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
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Supplier Name</th>
                <th className="px-4 py-2.5">Transaction Type</th>
                <th className="px-4 py-2.5">Voucher Reference</th>
                <th className="px-4 py-2.5 text-right">Debit (Payment/RTV)</th>
                <th className="px-4 py-2.5 text-right">Credit (Purchases)</th>
                <th className="px-4 py-2.5 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">Loading supplier ledger...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">No transactions found.</td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 text-text-muted">{e.date}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{e.supplier_name}</td>
                    <td className="px-4 py-3 text-[11px] text-text-primary">{e.voucher_type}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-accent-primary">{e.voucher_no}</td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-400">{formatCurrency(e.debit)}</td>
                    <td className="px-4 py-3 text-right font-medium text-text-primary">{formatCurrency(e.credit)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-400">{formatCurrency(e.balance)}</td>
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
