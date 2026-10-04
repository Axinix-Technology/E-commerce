import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Sliders } from "lucide-react";
import toast from "react-hot-toast";

export default function GeneralSettingsCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    currency: "INR (₹)",
    timezone: "Asia/Kolkata",
    invoice_prefix: "INV-2026-",
    barcode_prefix: "BC-",
    stock_memo_validity_days: 14,
    low_stock_threshold: 5,
    auto_backup: true,
    whatsapp_receipts: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("General settings successfully saved and deployed!");
      navigate("/settings/general");
    }, 600);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/settings/general" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent-primary" />
            Configure System Defaults
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Adjust store prefixes, memo durations, and automated threshold alerts</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Store Currency</label>
            <input
              type="text"
              required
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Timezone</label>
            <select
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Invoice Prefix</label>
            <input
              type="text"
              required
              value={form.invoice_prefix}
              onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Barcode Prefix</label>
            <input
              type="text"
              required
              value={form.barcode_prefix}
              onChange={(e) => setForm({ ...form, barcode_prefix: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Stock Memo Return Limit (Days)</label>
            <input
              type="number"
              min="1"
              value={form.stock_memo_validity_days}
              onChange={(e) => setForm({ ...form, stock_memo_validity_days: parseInt(e.target.value) || 14 })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Low Stock Warning Threshold (Units)</label>
            <input
              type="number"
              min="0"
              value={form.low_stock_threshold}
              onChange={(e) => setForm({ ...form, low_stock_threshold: parseInt(e.target.value) || 5 })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/30">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={form.whatsapp_receipts}
              onChange={(e) => setForm({ ...form, whatsapp_receipts: e.target.checked })}
              className="rounded border-border text-accent-primary focus:ring-accent-primary"
            />
            Send digital e-invoices via WhatsApp automatically on counter sale completion
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary">
            <input
              type="checkbox"
              checked={form.auto_backup}
              onChange={(e) => setForm({ ...form, auto_backup: e.target.checked })}
              className="rounded border-border text-accent-primary focus:ring-accent-primary"
            />
            Enable automated nightly database backups to secure cold storage
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/settings/general" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
