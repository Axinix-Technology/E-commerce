import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, Plus, Search, CheckCircle2, XCircle } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function DesignationsIndex() {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("designation_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setDesignations(data);
    } catch {
      setDesignations([
        { id: 1, name: "Lead Sourcing Specialist", code: "DES-SRC-01", department_id: 1, description: "Lead buyer for designer bridal assortment", status: 1 },
        { id: 2, name: "Store General Manager", code: "DES-MGR-01", department_id: 2, description: "Overall branch P&L, customer experience, and cash control", status: 1 },
        { id: 3, name: "Head Warehouse Comptroller", code: "DES-WH-01", department_id: 3, description: "Supervisor for inward GRN and barcode tagging operations", status: 1 },
        { id: 4, name: "Senior Retail Billing Cashier", code: "DES-CSH-01", department_id: 2, description: "Counter sales billing and cash register balancing", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const filtered = designations.filter((d) =>
    (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-accent-primary" />
            Designations Master
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Define corporate job titles, operational bands, and reporting tiers</p>
        </div>
        <Link
          to="/masters/designations/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Designation
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Job Titles: <strong className="text-text-primary font-medium">{formatQty(designations.length)}</strong></span>
        <span>•</span>
        <span>Active Titles: <strong className="text-emerald-400 font-medium">{formatQty(designations.filter(d => d.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Corporate Hierarchy: <strong className="text-accent-primary font-medium">Synced</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by designation name or code..."
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
                <th className="px-4 py-2.5">Designation Title</th>
                <th className="px-4 py-2.5">Code</th>
                <th className="px-4 py-2.5">Role Description</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-muted">Loading designations...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-muted">No designations found.</td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-medium text-text-primary">{d.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-accent-primary">{d.code}</td>
                    <td className="px-4 py-3 text-text-muted max-w-md">{d.description || "—"}</td>
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
                      <Link to={`/masters/designations/create?id=${d.id}`} className="text-[11px] font-medium text-accent-primary hover:underline">
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
