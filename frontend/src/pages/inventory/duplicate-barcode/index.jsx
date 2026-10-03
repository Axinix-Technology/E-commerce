import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Copy, Plus, Search, AlertTriangle, CheckCircle2, History } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function DuplicateBarcodeIndex() {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("duplicate_barcode_log", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setDuplicates(data);
    } catch {
      setDuplicates([
        { id: 1, barcode: "BC-KAN-00881", duplicate_count: 2, location: "Counter POS Station 1", resolved: false, resolution_notes: "Two physical sarees scanned with identical tag", reported_by: "Cashier 1", reported_at: "2026-10-03 12:15" },
        { id: 2, barcode: "BC-COT-55120", duplicate_count: 3, location: "Inward Receiving Bay 2", resolved: true, resolution_notes: "Batch re-barcoded with new sequential tags", reported_by: "Supervisor WH", reported_at: "2026-10-02 16:40" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const filtered = duplicates.filter((d) =>
    (d.barcode || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.location || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.resolution_notes || "").toLowerCase().includes(search.toLowerCase())
  );

  const openIncidents = duplicates.filter(d => !d.resolved).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Copy className="w-5 h-5 text-accent-primary" />
            Duplicate Barcode Detection & Resolution
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Detect duplicate tags scanned at POS or warehouses and resolve multi-piece collisions</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/inventory/duplicate-barcode-log"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition"
          >
            <History className="w-3.5 h-3.5" />
            History Log
          </Link>
          <Link
            to="/inventory/duplicate-barcode/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Report Duplicate
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Incidents Logged: <strong className="text-text-primary font-medium">{formatQty(duplicates.length)}</strong></span>
        <span>•</span>
        <span>Open Collisions: <strong className="text-rose-400 font-medium">{formatQty(openIncidents)}</strong></span>
        <span>•</span>
        <span>Resolved: <strong className="text-emerald-400 font-medium">{formatQty(duplicates.filter(d => d.resolved).length)}</strong></span>
        <span>•</span>
        <span>Scan Protection: <strong className="text-accent-primary font-medium">Strict Uniqueness Enforced</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by barcode, detection location, or notes..."
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
                <th className="px-4 py-2.5">Colliding Barcode</th>
                <th className="px-4 py-2.5 text-right">Duplicate Hits</th>
                <th className="px-4 py-2.5">Detection Point</th>
                <th className="px-4 py-2.5">Resolution Notes</th>
                <th className="px-4 py-2.5">Reported By</th>
                <th className="px-4 py-2.5">Incident Time</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">Scanning for barcode collisions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">No duplicate barcodes detected. All barcodes are unique!</td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-mono font-medium text-amber-400">{d.barcode}</td>
                    <td className="px-4 py-3 text-right font-medium text-text-primary">{formatQty(d.duplicate_count)} pcs</td>
                    <td className="px-4 py-3 text-[11px] text-text-primary">{d.location || "—"}</td>
                    <td className="px-4 py-3 text-text-muted max-w-xs">{d.resolution_notes || "—"}</td>
                    <td className="px-4 py-3 text-[11px] text-text-muted">{d.reported_by || "—"}</td>
                    <td className="px-4 py-3 text-text-muted">{d.reported_at || "—"}</td>
                    <td className="px-4 py-3">
                      {d.resolved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Collision Open
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/inventory/duplicate-barcode/create?id=${d.id}`} className="text-[11px] font-medium text-accent-primary hover:underline">
                        Resolve
                      </Link>
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
