import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus, Search, CheckCircle2, XCircle } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function ProfessionsIndex() {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProfessions = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("profession_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setProfessions(data);
    } catch {
      setProfessions([
        { id: 1, name: "Textile Engineer", description: "Fabric composition, weaving, and textile quality analysis", status: 1 },
        { id: 2, name: "Fashion Stylist", description: "Catalog styling, wardrobe consulting, and visual shoots", status: 1 },
        { id: 3, name: "Pattern Maker", description: "Garment sizing, cutting grading, and dimensional pattern design", status: 1 },
        { id: 4, name: "Retail Store Associate", description: "Customer counter service, billing, and floor merchandizing", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessions();
  }, []);

  const filtered = professions.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-accent-primary" />
            Professions Master
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Define specialized skill profiles and artisan trades</p>
        </div>
        <Link
          to="/masters/professions/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Profession
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Registered Professions: <strong className="text-text-primary font-medium">{formatQty(professions.length)}</strong></span>
        <span>•</span>
        <span>Active Categories: <strong className="text-emerald-400 font-medium">{formatQty(professions.filter(p => p.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Assignment Scope: <strong className="text-accent-primary font-medium">Enterprise Wide</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search professions by title or description..."
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
                <th className="px-4 py-2.5">Profession Title</th>
                <th className="px-4 py-2.5">Scope & Description</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-text-muted">Loading professions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-text-muted">No professions found.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-medium text-text-primary">{p.name}</td>
                    <td className="px-4 py-3 text-text-muted max-w-md">{p.description || "—"}</td>
                    <td className="px-4 py-3">
                      {p.status === 1 ? (
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
                      <Link to={`/masters/professions/create?id=${p.id}`} className="text-[11px] font-medium text-accent-primary hover:underline">
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
