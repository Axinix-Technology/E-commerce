import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Sliders } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Select, Checkbox } from "../../../components/ui";

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
    if (e) e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("General settings successfully saved and deployed!");
      navigate("/settings/general");
    }, 400);
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/settings/general"
          className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-token" />
            Configure System Defaults
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Adjust store prefixes, memo durations, and automated threshold alerts
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-4 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Store Currency"
            required
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />

          <Select
            label="Timezone"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            options={[
              { label: "Asia/Kolkata (IST +5:30)", value: "Asia/Kolkata" },
              { label: "UTC (Universal Coordinated Time)", value: "UTC" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Invoice Prefix"
            required
            fieldType="code"
            value={form.invoice_prefix}
            onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value.toUpperCase() })}
          />

          <Input
            label="Barcode Tag Prefix"
            required
            fieldType="code"
            value={form.barcode_prefix}
            onChange={(e) => setForm({ ...form, barcode_prefix: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Stock Memo Validity (Days)"
            type="number"
            min="1"
            value={form.stock_memo_validity_days}
            onChange={(e) => setForm({ ...form, stock_memo_validity_days: Number(e.target.value) })}
          />

          <Input
            label="Low Stock Warning Threshold (Pcs)"
            type="number"
            min="1"
            value={form.low_stock_threshold}
            onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })}
          />
        </div>

        <div className="pt-2 border-t border-token space-y-3">
          <Checkbox
            label="Automated Database Backup"
            description="Run automatic compressed database dump at 02:00 AM IST daily"
            checked={form.auto_backup}
            onChange={(e) => setForm({ ...form, auto_backup: e.target.checked })}
          />

          <Checkbox
            label="Instant WhatsApp Digital Receipts"
            description="Send e-invoice PDF link to customer mobile phone after checkout"
            checked={form.whatsapp_receipts}
            onChange={(e) => setForm({ ...form, whatsapp_receipts: e.target.checked })}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-token">
          <Link to="/settings/general">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
            onClick={handleSubmit}
          >
            Save Defaults
          </Button>
        </div>
      </form>
    </div>
  );
}
