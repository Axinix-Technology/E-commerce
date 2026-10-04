import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  UserCheck
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

export default function StaffSettingsPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["username.icontains"] = search.trim();
      }

      const res = await populateApi.read("user", {
        filter,
        page,
        limit: 15,
        populate: {
          role: ["id", "name", "is_superadmin"],
        },
        sort: ["-id"],
      });

      if (res?.data) {
        setStaff(res.data);
        setTotalCount(res.count || 0);
        setTotalPages(res.metadata?.total_pages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page, search]);

  const activeStaffCount = staff.filter((s) => s.status === 1).length;
  const adminStaffCount = staff.filter((s) => s.is_superuser || s.role?.is_superadmin).length;

  const handleDeactivate = async (member) => {
    if (!window.confirm(`Deactivate staff user "${member.username}"?`)) return;
    try {
      await populateApi.update("user", member.id, { status: 0 });
      toast.success("Staff user deactivated");
      fetchStaff();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to update user");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Staff & Counter Personnel</h1>
            <p className="text-xs text-text-muted">Manage employee accounts, store roles, cash counter credentials, and access gates</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStaff}
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
            title="Refresh Staff"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/settings/staff/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Total Staff: <strong className="text-text-primary font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Active Accounts: <strong className="text-emerald-400 font-medium">{formatQty(activeStaffCount)}</strong></span>
        <span>•</span>
        <span>Administrators: <strong className="text-primary font-medium">{formatQty(adminStaffCount)}</strong></span>
        <span>•</span>
        <span>RBAC State: <strong className="text-emerald-400 font-medium">Policy-Enforced</strong></span>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by username, full name, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-9 pr-4 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-surface-card/80 text-text-muted font-medium">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role Assigned</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading staff directory...
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    No staff members found matching your search.
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="font-medium text-text-primary">
                        {member.first_name ? `${member.first_name} ${member.last_name || ""}` : member.username}
                      </div>
                      <div className="text-[11px] font-mono text-text-muted">@{member.username}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        <ShieldCheck className="w-3 h-3" />
                        {member.role?.name || (member.is_superuser ? "Super Admin" : "Staff User")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      <div>{member.email || "—"}</div>
                      <div className="text-[11px]">{member.phone || "—"}</div>
                    </td>
                    <td className="py-3 px-4 text-text-muted">{member.city || "—"}</td>
                    <td className="py-3 px-4">
                      {member.status === 1 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-400">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/settings/staff/create?id=${member.id}`}
                          className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
                          title="Edit Staff Member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        {member.status === 1 && (
                          <button
                            onClick={() => handleDeactivate(member)}
                            className="p-1 rounded text-text-muted hover:text-rose-400 transition-colors"
                            title="Deactivate Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 text-xs text-text-muted">
            <span>
              Page {page} of {totalPages} ({totalCount} total staff)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg border border-border/60 disabled:opacity-40 hover:bg-surface-card transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg border border-border/60 disabled:opacity-40 hover:bg-surface-card transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
