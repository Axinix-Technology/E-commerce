import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Sliders } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Select, Checkbox } from "../../../components/ui";
import populateApi from "../../../api/populate.api";

export default function GeneralSettingsCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    currency: "INR (₹)",
    timezone: "Asia/Kolkata",
    invoice_prefix: "INV-2026-",
    barcode_prefix: "BC-",
    stock_memo_validity_days: 14,
    low_stock_threshold: 5,
    auto_backup: "Daily 02:00 AM",
    sms_notifications: "Enabled",
    whatsapp_receipts: "Enabled",
  });

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const res = await populateApi.read("general_setting", { limit: 100 });
        const list = Array.isArray(res) ? res : res?.data || [];
        if (list.length > 0) {
          const map = {};
          list.forEach((item) => {
            if (item.key) map[item.key] = item.value;
          });
          setForm((prev) => ({ ...prev, ...map }));
        }
      } catch (err) {
        console.warn("Could not prefetch general settings:", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      const entries = Object.entries(form);
      for (const [k, v] of entries) {
        const payload = {
          key: k,
          value: String(v),
          value_type: typeof v === "boolean" ? "boolean" : typeof v === "number" ? "number" : "string",
          group: "general",
          status: 1,
        };
        try {
          await populateApi.create("general_setting", payload);
        } catch {
          // If already existing, update
          await populateApi.update("general_setting", null, payload, { key: k });
        }
      }
      toast.success("General settings successfully saved to database!");
      navigate("/settings/general");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save settings");
    } finally {
      setSubmitting(false);
    }
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
            label="System Timezone"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            options={[
              { value: "Asia/Kolkata", label: "Asia/Kolkata (IST +5:30)" },
              { value: "UTC", label: "UTC (Coordinated Universal Time)" },
              { value: "Asia/Dubai", label: "Asia/Dubai (GST +4:00)" },
              { value: "America/New_York", label: "America/New_York (EST -5:00)" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Invoice Prefix"
            required
            value={form.invoice_prefix}
            onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value })}
          />

          <Input
            label="Barcode Prefix"
            required
            value={form.barcode_prefix}
            onChange={(e) => setForm({ ...form, barcode_prefix: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Memo Validity (Days)"
            type="number"
            value={form.stock_memo_validity_days}
            onChange={(e) => setForm({ ...form, stock_memo_validity_days: Number(e.target.value) })}
          />

          <Input
            label="Low Stock Warning Limit"
            type="number"
            value={form.low_stock_threshold}
            onChange={(e) => setForm({ ...form, low_stock_threshold: Number(e.target.value) })}
          />
        </div>

        <div className="p-3 rounded-xl border border-token bg-surface-elevated/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-secondary-token font-medium">Automated Database Backups</span>
            <Badge variant="brand">Daily 02:00 AM</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary-token font-medium">WhatsApp / SMS Receipt Dispatch</span>
            <Badge variant="brand">Active</Badge>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Link to="/settings/general">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" size="sm" icon={Save} loading={submitting} type="submit">
            Save System Defaults
          </Button>
        </div>
      </form>
    </div>
  );
}
