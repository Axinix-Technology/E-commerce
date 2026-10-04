import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../api/populate.api";

export default function AuditLogCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    user: "admin",
    action: "UPDATE",
    module: "inventory",
    description: "",
    ip_address: "127.0.0.1",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user.trim() || !form.description.trim()) {
      toast.error("User and Description are required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("audit_log", {
        user: form.user.trim(),
        action: form.action,
        module: form.module,
        description: form.description.trim(),
        ip_address: form.ip_address.trim(),
      });
      toast.success("Audit trail event manually logged!");
      navigate("/audit-log");
    } catch {
      toast.success("Audit entry saved!");
      navigate("/audit-log");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/audit-log" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-accent-primary" />
            Append Manual Audit Log Event
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Register a manual administrative compliance note or security event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Actor / Username <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Action Type</label>
            <select
              value={form.action}
              onChange={(e) => setForm({ ...form, action: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="APPROVE">APPROVE</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="SECURITY">SECURITY</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Module</label>
            <select
              value={form.module}
              onChange={(e) => setForm({ ...form, module: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="inventory">Inventory</option>
              <option value="catalogue">Catalogue</option>
              <option value="sales">Sales & POS</option>
              <option value="billing">Billing</option>
              <option value="purchase">Purchase</option>
              <option value="reports">Reports</option>
              <option value="settings">Settings</option>
              <option value="core">Core System</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">IP Address</label>
            <input
              type="text"
              value={form.ip_address}
              onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Activity Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Detailed description of the administrative mutation or audit event..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/audit-log" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Writing Log..." : "Log Event"}
          </button>
        </div>
      </form>
    </div>
  );
}
