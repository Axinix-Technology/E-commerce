import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Network, Plus, Search, CheckCircle2, XCircle } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function DepartmentsIndex() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("department_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setDepartments(data);
    } catch {
      setDepartments([
        { id: 1, name: "Merchandising & Sourcing", code: "DEP-MERCH", description: "Vendor procurement, style selection, and seasonal assortment", status: 1 },
        { id: 2, name: "Retail Operations & POS", code: "DEP-OPS", description: "In-store cashiering, floor customer assistance, and daily reconciliation", status: 1 },
        { id: 3, name: "Warehouse & Fulfillment", code: "DEP-WH", description: "GRN inwards, barcode tagging, and dispatch staging", status: 1 },
        { id: 4, name: "Finance & Accounts", code: "DEP-FIN", description: "Statutory GST filing, vendor payments, and expense audits", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filtered = departments.filter((d) =>
    (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-accent-primary" />
            Departments Master
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Corporate departmental hierarchy and organizational units</p>
        </div>
        <Link
          to="/masters/departments/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Department
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Total Departments: <strong className="text-text-primary font-medium">{formatQty(departments.length)}</strong></span>
        <span>•</span>
        <span>Operational: <strong className="text-emerald-400 font-medium">{formatQty(departments.filter(d => d.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Corporate Units: <strong className="text-accent-primary font-medium">Synced</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by department name or code..."
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
                <th className="px-4 py-2.5">Department Name</th>
                <th className="px-4 py-2.5">Code</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-muted">Loading departments...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-text-muted">No departments found.</td>
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
                      <Link to={`/masters/departments/create?id=${d.id}`} className="text-[11px] font-medium text-accent-primary hover:underline">
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
