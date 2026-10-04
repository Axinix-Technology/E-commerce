import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Download, Search, CheckCircle2, Filter } from "lucide-react";
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

export default function PurchaseReturnReportIndex() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchReturns = async () => {
    setLoading(true);
    try {
      setReturns([
        { id: 1, rtv_number: "RTV-2026-001", grn_ref: "GRN-2026-001", supplier_name: "Sri Lakshmi Silks Kanchipuram", return_date: "2026-10-02", returned_units: 15, debit_note_amount: 22500, reason: "Zari Weave Defect / Slub", status: "completed" },
        { id: 2, rtv_number: "RTV-2026-002", grn_ref: "GRN-2026-002", supplier_name: "Surat Zari Mills Pvt Ltd", return_date: "2026-10-03", returned_units: 20, debit_note_amount: 18000, reason: "Color Bleed / Dye Bleach", status: "completed" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const filtered = returns.filter((r) =>
    (r.rtv_number || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.supplier_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.reason || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalReturnedUnits = filtered.reduce((acc, r) => acc + (Number(r.returned_units) || 0), 0);
  const totalDebitNoteVal = filtered.reduce((acc, r) => acc + (Number(r.debit_note_amount) || 0), 0);

  const exportCsv = () => {
    const headers = ["RTV Number,GRN Ref,Supplier,Return Date,Returned Units,Debit Note Amount (INR),Reason"];
    const rows = filtered.map(r =>
      `"${r.rtv_number}","${r.grn_ref || ''}","${r.supplier_name || ''}","${r.return_date || ''}",${r.returned_units || 0},${r.debit_note_amount || 0},"${r.reason || ''}"`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Purchase_Return_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-accent-primary" />
            Purchase Return (RTV) Report
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Return to vendor logs, damaged consignment write-offs, and debit notes issued</p>
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
        <span>RTV Vouchers: <strong className="text-text-primary font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Units Returned: <strong className="text-rose-400 font-medium">{formatQty(totalReturnedUnits)}</strong></span>
        <span>•</span>
        <span>Debit Note Value: <strong className="text-emerald-400 font-medium">{formatCurrency(totalDebitNoteVal)}</strong></span>
        <span>•</span>
        <span>QC Reconciliation: <strong className="text-accent-primary font-medium">100% Settled</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by RTV number, supplier, or reason..."
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
                <th className="px-4 py-2.5">RTV Number</th>
                <th className="px-4 py-2.5">GRN Ref</th>
                <th className="px-4 py-2.5">Supplier Name</th>
                <th className="px-4 py-2.5">Return Date</th>
                <th className="px-4 py-2.5 text-right">Units Returned</th>
                <th className="px-4 py-2.5 text-right">Debit Note Amount</th>
                <th className="px-4 py-2.5">Return Reason</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">Loading returns...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">No purchase returns recorded.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-mono font-medium text-accent-primary">{r.rtv_number}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{r.grn_ref || "—"}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{r.supplier_name}</td>
                    <td className="px-4 py-3 text-text-muted">{r.return_date || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-rose-400">-{formatQty(r.returned_units)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-400">{formatCurrency(r.debit_note_amount)}</td>
                    <td className="px-4 py-3 text-text-muted max-w-xs">{r.reason}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Debit Adjusted
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
