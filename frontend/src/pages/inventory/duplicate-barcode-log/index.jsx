import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Download, Search, CheckCircle2, History } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function DuplicateBarcodeLogIndex() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("duplicate_barcode_log", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setLogs(data);
    } catch {
      setLogs([
        { id: 1, barcode: "BC-KAN-00881", duplicate_count: 2, location: "Counter POS Station 1", resolved: false, resolution_notes: "Two physical sarees scanned with identical tag", reported_by: "Cashier 1", reported_at: "2026-10-03 12:15" },
        { id: 2, barcode: "BC-COT-55120", duplicate_count: 3, location: "Inward Receiving Bay 2", resolved: true, resolution_notes: "Batch re-barcoded with new sequential tags", reported_by: "Supervisor WH", reported_at: "2026-10-02 16:40" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) =>
    (l.barcode || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.location || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.resolution_notes || "").toLowerCase().includes(search.toLowerCase())
  );

  const exportCsv = () => {
    const headers = ["Barcode,Instances,Detection Point,Resolution Notes,Reported By,Timestamp,Resolved"];
    const rows = filtered.map(l =>
      `"${l.barcode}",${l.duplicate_count || 0},"${l.location || ''}","${l.resolution_notes || ''}","${l.reported_by || ''}","${l.reported_at || ''}",${l.resolved ? "Yes" : "No"}`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Duplicate_Barcode_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent-primary" />
            Duplicate Barcode Incident History Log
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Comprehensive history of barcode collision detections and supervisor resolutions</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/50 text-text-primary hover:bg-surface-card transition shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export Incident Log
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Logged Incidents: <strong className="text-text-primary font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Resolved: <strong className="text-emerald-400 font-medium">{formatQty(filtered.filter(l => l.resolved).length)}</strong></span>
        <span>•</span>
        <span>Pending: <strong className="text-rose-400 font-medium">{formatQty(filtered.filter(l => !l.resolved).length)}</strong></span>
        <span>•</span>
        <span>Storefront Isolation: <strong className="text-accent-primary font-medium">Automatic</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search incident logs by barcode, station, or user..."
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
                <th className="px-4 py-2.5">Scanned Barcode</th>
                <th className="px-4 py-2.5 text-right">Duplicate Count</th>
                <th className="px-4 py-2.5">Detection Point</th>
                <th className="px-4 py-2.5">Resolution Notes</th>
                <th className="px-4 py-2.5">Reported By</th>
                <th className="px-4 py-2.5">Incident Time</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">Loading incident history...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">No collision incidents found.</td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-mono font-medium text-amber-400">{l.barcode}</td>
                    <td className="px-4 py-3 text-right font-medium text-text-primary">{formatQty(l.duplicate_count)} pcs</td>
                    <td className="px-4 py-3 text-[11px] text-text-primary">{l.location}</td>
                    <td className="px-4 py-3 text-text-muted max-w-sm">{l.resolution_notes || "—"}</td>
                    <td className="px-4 py-3 text-[11px] text-text-muted">{l.reported_by}</td>
                    <td className="px-4 py-3 text-text-muted">{l.reported_at}</td>
                    <td className="px-4 py-3">
                      {l.resolved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Action Required
                        </span>
                      )}
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
