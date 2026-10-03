import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Search, Mail, Phone, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function EmployeesIndex() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("user", {
        limit: 100,
        select: ["id", "username", "first_name", "last_name", "email", "phone", "role_id", "status", "is_superuser"],
      });
      const data = Array.isArray(res) ? res : res.data || [];
      setEmployees(data);
    } catch {
      setEmployees([
        { id: 1, username: "admin", first_name: "Super", last_name: "Admin", email: "admin@axinix.com", phone: "+91 98765 43210", role_id: 1, status: 1, is_superuser: true },
        { id: 2, username: "sarah.mgr", first_name: "Sarah", last_name: "Connor", email: "sarah@axinix.com", phone: "+91 98765 43211", role_id: 2, status: 1, is_superuser: false },
        { id: 3, username: "john.cashier", first_name: "John", last_name: "Doe", email: "john@axinix.com", phone: "+91 98765 43212", role_id: 3, status: 1, is_superuser: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter((emp) => {
    const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      (emp.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (emp.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && emp.status === 1) ||
      (statusFilter === "inactive" && emp.status === 0);
    return matchesSearch && matchesStatus;
  });

  const totalStaff = employees.length;
  const activeStaff = employees.filter((e) => e.status === 1).length;
  const adminCount = employees.filter((e) => e.is_superuser || e.role_id === 1).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-primary" />
            Employees & Personnel Master
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Manage enterprise staff accounts, roles, and branch assignments</p>
        </div>
        <Link
          to="/masters/employees/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Employee
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Total Staff: <strong className="text-text-primary font-medium">{formatQty(totalStaff)}</strong></span>
        <span>•</span>
        <span>Active Accounts: <strong className="text-emerald-400 font-medium">{formatQty(activeStaff)}</strong></span>
        <span>•</span>
        <span>Administrators: <strong className="text-accent-primary font-medium">{formatQty(adminCount)}</strong></span>
        <span>•</span>
        <span>Security Tier: <strong className="text-text-primary font-medium">RBAC Scoped</strong></span>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by employee name, username, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-card border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-surface-card border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/50 overflow-hidden bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-muted">
            <thead className="bg-surface-ground/50 border-b border-border/50 text-text-secondary uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Staff Member</th>
                <th className="px-4 py-2.5">Username</th>
                <th className="px-4 py-2.5">Contact Details</th>
                <th className="px-4 py-2.5">Role / Access</th>
                <th className="px-4 py-2.5">Account Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-text-muted">
                    Loading personnel records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-text-muted">
                    No employees matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-medium text-text-primary">
                      {emp.first_name} {emp.last_name || ""}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-accent-primary">@{emp.username}</td>
                    <td className="px-4 py-3 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-text-primary">
                        <Mail className="w-3 h-3 text-text-muted" />
                        {emp.email || "—"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                        <Phone className="w-3 h-3" />
                        {emp.phone || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                        <ShieldCheck className="w-3 h-3" />
                        {emp.is_superuser ? "Super Admin" : `Role #${emp.role_id || 1}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {emp.status === 1 ? (
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
                        to={`/masters/employees/create?id=${emp.id}`}
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
