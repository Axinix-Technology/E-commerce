import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sliders, Plus, Edit, CheckCircle2, Globe, Clock, ShieldCheck } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function GeneralSettingsIndex() {
  const [settings, setSettings] = useState({
    currency: "INR (₹)",
    timezone: "Asia/Kolkata (IST)",
    invoice_prefix: "INV-2026-",
    barcode_prefix: "BC-",
    stock_memo_validity_days: 14,
    low_stock_threshold: 5,
    auto_backup: "Daily at 02:00 AM",
    sms_notifications: "Enabled",
    whatsapp_receipts: "Enabled",
  });
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent-primary" />
            General System Parameters & Configurations
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Manage enterprise-wide defaults, numbering conventions, and operational alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/settings/general/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            Update Settings
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Base Currency: <strong className="text-text-primary font-medium">{settings.currency}</strong></span>
        <span>•</span>
        <span>Timezone: <strong className="text-text-primary font-medium">{settings.timezone}</strong></span>
        <span>•</span>
        <span>Low Stock Alert: <strong className="text-amber-400 font-medium">&lt; {formatQty(settings.low_stock_threshold)} Units</strong></span>
        <span>•</span>
        <span>Security State: <strong className="text-emerald-400 font-medium">Optimal</strong></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-3">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border/40 pb-2">
            <Globe className="w-4 h-4 text-accent-primary" />
            Regional & Localization
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Default Currency</span>
              <span className="font-semibold text-text-primary">{settings.currency}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">System Timezone</span>
              <span className="font-semibold text-text-primary">{settings.timezone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Date Presentation</span>
              <span className="font-mono text-text-primary">DD/MM/YYYY</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-secondary">Number Format</span>
              <span className="font-mono text-text-primary">Indian Numbering (Lakhs/Crores)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-3">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border/40 pb-2">
            <Sliders className="w-4 h-4 text-accent-primary" />
            Numbering Sequences & Codes
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Tax Invoice Prefix</span>
              <span className="font-mono font-semibold text-accent-primary">{settings.invoice_prefix}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Barcode Prefix</span>
              <span className="font-mono font-semibold text-accent-primary">{settings.barcode_prefix}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Stock Memo Validity</span>
              <span className="font-semibold text-text-primary">{formatQty(settings.stock_memo_validity_days)} Days</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-secondary">Low Stock Trigger</span>
              <span className="font-semibold text-amber-400">{formatQty(settings.low_stock_threshold)} Units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
