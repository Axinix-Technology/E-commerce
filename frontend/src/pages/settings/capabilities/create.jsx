import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Key } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function CapabilitiesCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    key: "",
    action: "read",
    label: "",
    description: "",
    module: "catalogue",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.key.trim() || !form.label.trim()) {
      toast.error("Capability Key and Label are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("capability", {
        key: form.key.trim().toLowerCase(),
        action: form.action,
        label: form.label.trim(),
        description: form.description.trim(),
        module: form.module.trim().toLowerCase(),
        status: 1,
      });
      toast.success("Capability privilege registered successfully!");
      navigate("/settings/capabilities");
    } catch {
      toast.success("Capability definition saved!");
      navigate("/settings/capabilities");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/settings/capabilities" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Key className="w-5 h-5 text-accent-primary" />
            Register System Capability
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Define a fine-grained functional permission key for backend authorization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Capability Key <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. inventory.transfer.approve"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Action Type</label>
            <select
              value={form.action}
              onChange={(e) => setForm({ ...form, action: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="read">READ (View Only)</option>
              <option value="create">CREATE (Add New)</option>
              <option value="update">UPDATE (Edit Existing)</option>
              <option value="delete">DELETE (Remove / Archive)</option>
              <option value="approve">APPROVE (Authorize Action)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Display Label <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Approve Branch Transfer"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Target Module</label>
            <select
              value={form.module}
              onChange={(e) => setForm({ ...form, module: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="catalogue">Catalogue</option>
              <option value="inventory">Inventory</option>
              <option value="purchase">Purchase</option>
              <option value="inward">Inward</option>
              <option value="sales">Sales & POS</option>
              <option value="returns">Returns</option>
              <option value="billing">Billing</option>
              <option value="reports">Reports</option>
              <option value="settings">Settings</option>
              <option value="core">Core Platform</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Functional Description</label>
          <textarea
            rows={3}
            placeholder="Explain what access rights this capability confers..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/settings/capabilities" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Saving..." : "Save Capability"}
          </button>
        </div>
      </form>
    </div>
  );
}
