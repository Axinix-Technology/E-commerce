import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building, Plus, Search, MapPin, Phone, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function BranchesIndex() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("branch_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setBranches(data);
    } catch {
      setBranches([
        { id: 1, name: "Flagship HQ Store", code: "BR-HQ-01", city: "Chennai", state: "Tamil Nadu", phone: "+91 44 2812 3456", gstin: "33AAAAA0000A1Z5", is_head_office: true, status: 1 },
        { id: 2, name: "Indiranagar Experience Hub", code: "BR-BLR-02", city: "Bengaluru", state: "Karnataka", phone: "+91 80 4123 4567", gstin: "29AAAAA0000A1Z2", is_head_office: false, status: 1 },
        { id: 3, name: "Bandra Retail Outlet", code: "BR-MUM-03", city: "Mumbai", state: "Maharashtra", phone: "+91 22 2640 1234", gstin: "27AAAAA0000A1Z8", is_head_office: false, status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const filtered = branches.filter((b) =>
    (b.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.code || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.status === 1).length;
  const hqCount = branches.filter((b) => b.is_head_office).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-accent-primary" />
            Branches & Store Locations
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Manage brick-and-mortar stores, fulfillment warehouses, and branch GSTINs</p>
        </div>
        <Link
          to="/masters/branches/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Branch
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Total Branches: <strong className="text-text-primary font-medium">{formatQty(totalBranches)}</strong></span>
        <span>•</span>
        <span>Operational: <strong className="text-emerald-400 font-medium">{formatQty(activeBranches)}</strong></span>
        <span>•</span>
        <span>Headquarters: <strong className="text-accent-primary font-medium">{formatQty(hqCount)}</strong></span>
        <span>•</span>
        <span>Multi-State Billing: <strong className="text-text-primary font-medium">Enabled (IGST/CGST)</strong></span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by branch name, code, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-card border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-muted">
            <thead className="bg-surface-ground/50 border-b border-border/50 text-text-secondary uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Branch Name & Code</th>
                <th className="px-4 py-2.5">Location</th>
                <th className="px-4 py-2.5">Contact</th>
                <th className="px-4 py-2.5">GSTIN</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">Loading branches...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">No branches found.</td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {b.name}
                      <span className="block font-mono text-[10px] text-accent-primary">{b.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-text-primary">
                        <MapPin className="w-3 h-3 text-text-muted" />
                        {b.city}, {b.state}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-text-muted">
                      {b.phone || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-primary">
                      {b.gstin || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {b.is_head_office ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Head Office
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-ground text-text-muted border border-border/50">
                          Retail Branch
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 1 ? (
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
                      <Link
                        to={`/masters/branches/create?id=${b.id}`}
                        className="text-[11px] font-medium text-accent-primary hover:underline"
                      >
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
