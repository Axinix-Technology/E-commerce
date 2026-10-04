import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Lock,
  Key,
  Users,
  CheckCircle2
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

// Rule 1: Zero values rendered as em-dash
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

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roleRes, capRes] = await Promise.all([
        populateApi.read("role", {
          limit: 50,
          populate: { users: ["id", "username"] },
          sort: ["id"],
        }),
        populateApi.read("capability", { limit: 100, sort: ["module", "key"] }),
      ]);

      if (roleRes?.data) setRoles(roleRes.data);
      if (capRes?.data) setCapabilities(capRes.data);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load roles and permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  const superadminRolesCount = roles.filter((r) => r.is_superadmin).length;
  const totalUsersAssigned = roles.reduce((sum, r) => sum + (r.users?.length || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Roles & Permissions</h1>
            <p className="text-xs text-text-muted">Role-based access control (RBAC), capability matrix, and security privileges</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
            title="Refresh Roles"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/settings/roles-permissions/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Configured Roles: <strong className="text-text-primary font-medium">{formatQty(roles.length)}</strong></span>
        <span>•</span>
        <span>Superadmin Tier: <strong className="text-rose-400 font-medium">{formatQty(superadminRolesCount)}</strong></span>
        <span>•</span>
        <span>Registered Capabilities: <strong className="text-primary font-medium">{formatQty(capabilities.length)}</strong></span>
        <span>•</span>
        <span>Staff Assigned: <strong className="text-emerald-400 font-medium">{formatQty(totalUsersAssigned)}</strong></span>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Filter roles by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Roles Table */}
      <div className="rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-surface-card/80 text-text-muted font-medium">
                <th className="py-3 px-4">Role Name</th>
                <th className="py-3 px-4">Privilege Level</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Assigned Users</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading security roles...
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    No roles found matching your query.
                  </td>
                </tr>
              ) : (
                filteredRoles.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-semibold text-text-primary">
                      {r.name}
                    </td>
                    <td className="py-3 px-4">
                      {r.is_superadmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <Lock className="w-3 h-3" /> Full Superadmin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Key className="w-3 h-3" /> Policy Scoped
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-text-muted max-w-sm truncate">
                      {r.description || "Operational role permissions"}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-text-primary">
                      {formatQty(r.users?.length)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.status === 1 ? (
                        <span className="text-emerald-400 font-medium">Active</span>
                      ) : (
                        <span className="text-text-muted">Inactive</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/settings/roles-permissions/create?id=${r.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-card hover:bg-surface-card/80 border border-border/60 text-text-muted hover:text-text-primary text-xs transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
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
