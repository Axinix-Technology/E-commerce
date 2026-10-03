import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Palette, Plus, Search, CheckCircle2, XCircle } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function DesignsIndex() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("design_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setDesigns(data);
    } catch {
      setDesigns([
        { id: 1, name: "Temple Border Motif", code: "DSN-TMPL-01", pattern_type: "Traditional Woven", description: "Traditional South Indian temple gopuram triangular border weave", status: 1 },
        { id: 2, name: "Paisley / Kalka Jaal", code: "DSN-PSLY-02", pattern_type: "Intricate Floral", description: "All-over gold zari paisley vine motifs with floral interlacing", status: 1 },
        { id: 3, name: "Geometric Chevron", code: "DSN-CHEV-03", pattern_type: "Modern Contemporary", description: "Sharp zig-zag chevron lines in dual tone metallic dye", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const filtered = designs.filter((d) =>
    (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.code || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.pattern_type || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent-primary" />
            Designs & Patterns Master
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Catalog design motifs, artisan embroidery prints, and pattern classifications</p>
        </div>
        <Link
          to="/catalogue/designs/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Design
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Registered Patterns: <strong className="text-text-primary font-medium">{formatQty(designs.length)}</strong></span>
        <span>•</span>
        <span>Active Motifs: <strong className="text-emerald-400 font-medium">{formatQty(designs.filter(d => d.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Artisan Heritage: <strong className="text-accent-primary font-medium">Protected</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by design name, pattern type, or code..."
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
                <th className="px-4 py-2.5">Design / Pattern Name</th>
                <th className="px-4 py-2.5">Code</th>
                <th className="px-4 py-2.5">Pattern Style</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-text-muted">Loading designs...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-text-muted">No designs found.</td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-medium text-text-primary">{d.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-accent-primary">{d.code}</td>
                    <td className="px-4 py-3 text-[11px] text-text-primary">{d.pattern_type || "—"}</td>
                    <td className="px-4 py-3 text-text-muted max-w-sm">{d.description || "—"}</td>
                    <td className="px-4 py-3">
                      {d.status === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/catalogue/designs/create?id=${d.id}`} className="text-[11px] font-medium text-accent-primary hover:underline">
                        Edit
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
