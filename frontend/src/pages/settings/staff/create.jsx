import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  Save,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock
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

export default function StaffMemberCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role_id: "",
    city: "",
    status: 1,
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await populateApi.read("role", { limit: 50, sort: ["name"] });
        if (res?.data) setRoles(res.data);
      } catch (err) {
        console.error("Failed loading roles", err);
      }
    };

    loadRoles();

    if (editId) {
      populateApi
        .read("user", { filter: { id: editId } })
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            const u = res.data[0];
            setFormData({
              username: u.username || "",
              password: "",
              first_name: u.first_name || "",
              last_name: u.last_name || "",
              email: u.email || "",
              phone: u.phone || "",
              role_id: u.role_id || "",
              city: u.city || "",
              status: u.status ?? 1,
            });
          }
        })
        .catch((err) => console.error("Failed loading user", err));
    }
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.password && editId) {
        delete payload.password; // Don't wipe password on edit if empty
      }

      if (editId) {
        await populateApi.update("user", editId, payload);
        toast.success("Staff profile updated successfully");
      } else {
        await populateApi.create("user", payload);
        toast.success("Staff member created successfully");
      }
      navigate("/settings/staff");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save staff member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/settings/staff"
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              {editId ? "Edit Staff Account" : "Add Staff Member"}
            </h1>
            <p className="text-xs text-text-muted">Configure authentication credentials, assigned role, and operating profile</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Saving..." : "Save Staff Member"}
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Username: <strong className="text-primary font-medium">{formData.username ? `@${formData.username}` : "—"}</strong></span>
        <span>•</span>
        <span>Role: <strong className="text-text-primary font-medium">{roles.find(r => String(r.id) === String(formData.role_id))?.name || "Staff User"}</strong></span>
        <span>•</span>
        <span>Account Status: <strong className="text-emerald-400 font-medium">{formData.status === 1 ? "Active" : "Inactive"}</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        <div className="p-5 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                disabled={Boolean(editId)}
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="e.g. cashier_john"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary font-mono focus:outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                {editId ? "Password (Leave blank to keep current)" : "Password *"}
              </label>
              <input
                type="password"
                required={!editId}
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                placeholder="John"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                placeholder="Doe"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="john@axinix.store"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Role Assignment *
              </label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, role_id: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              >
                <option value="">-- Choose Role --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.is_superadmin ? "(Super Admin)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive / Suspended</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? "Saving..." : editId ? "Update Staff Member" : "Create Staff Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
