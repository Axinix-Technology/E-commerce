import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  Save,
  Lock,
  Key,
  CheckSquare,
  Square
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

export default function RoleFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [capabilities, setCapabilities] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_superadmin: false,
    status: 1,
  });

  useEffect(() => {
    populateApi
      .read("capability", { limit: 100, sort: ["module", "key"] })
      .then((res) => {
        if (res?.data) setCapabilities(res.data);
      })
      .catch((err) => console.error("Failed loading capabilities", err));

    if (editId) {
      populateApi
        .read("role", { filter: { id: editId } })
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            const r = res.data[0];
            setFormData({
              name: r.name || "",
              description: r.description || "",
              is_superadmin: Boolean(r.is_superadmin),
              status: r.status ?? 1,
            });
          }
        })
        .catch((err) => console.error("Failed loading role", err));
    }
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await populateApi.update("role", editId, formData);
        toast.success("Role updated successfully");
      } else {
        await populateApi.create("role", formData);
        toast.success("New role created successfully");
      }
      navigate("/settings/roles-permissions");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save role");
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
            to="/settings/roles-permissions"
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              {editId ? "Edit Role & Policies" : "Create Security Role"}
            </h1>
            <p className="text-xs text-text-muted">Define permission envelope, administrative bypass, and business capabilities</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Saving..." : "Save Role"}
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Role Identifier: <strong className="text-primary font-medium">{formData.name || "—"}</strong></span>
        <span>•</span>
        <span>Privilege Mode: <strong className="text-rose-400 font-medium">{formData.is_superadmin ? "Superadmin Bypass" : "Policy Gated"}</strong></span>
        <span>•</span>
        <span>Capability Pool: <strong className="text-text-primary font-medium">{formatQty(capabilities.length)} Modules</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        <div className="p-5 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1">
              Role Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Store Manager, Lead Cashier, Inventory Clerk"
              className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Purpose and access boundary of this role..."
              className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-surface-card/40">
            <input
              type="checkbox"
              id="is_superadmin"
              checked={formData.is_superadmin}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_superadmin: e.target.checked }))}
              className="rounded accent-rose-500 w-4 h-4"
            />
            <label htmlFor="is_superadmin" className="text-xs text-text-primary cursor-pointer">
              <span className="font-semibold block text-rose-400">Super Administrator Bypass</span>
              <span className="text-[11px] text-text-muted">
                Grants unrestricted access across all catalogue, financial reports, settings, and database endpoints.
              </span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1">
              Role Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: Number(e.target.value) }))}
              className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive / Deprecated</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? "Saving..." : editId ? "Update Role" : "Create Security Role"}
          </button>
        </div>
      </form>
    </div>
  );
}
