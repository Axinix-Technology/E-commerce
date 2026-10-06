import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sliders, Edit, Globe, Clock, ShieldCheck } from "lucide-react";
import { formatQty } from "../../../utils/formatters";
import { Button, Badge } from "../../../components/ui";

export default function GeneralSettingsIndex() {
  const [settings] = useState({
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

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-token" />
            General System Parameters & Configurations
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Manage enterprise-wide defaults, numbering conventions, and operational alerts
          </p>
        </div>
        <Link to="/settings/general/create">
          <Button variant="primary" size="sm" icon={Edit}>
            Update Settings
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Base Currency: <strong className="text-primary-token font-medium">{settings.currency}</strong></span>
        <span>•</span>
        <span>Timezone: <strong className="text-primary-token font-medium">{settings.timezone}</strong></span>
        <span>•</span>
        <span>Low Stock Alert: <strong className="text-amber-800 dark:text-amber-400 font-medium">&lt; {formatQty(settings.low_stock_threshold)} Units</strong></span>
        <span>•</span>
        <span>Security State: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">Optimal</strong></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Regional & Localization */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-2 border-b border-token pb-2">
            <Globe className="w-4 h-4 text-brand-token" />
            Regional & Localization
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Default Currency</span>
              <span className="font-semibold text-primary-token">{settings.currency}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">System Timezone</span>
              <span className="font-semibold text-primary-token">{settings.timezone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Date Presentation</span>
              <span className="font-mono text-primary-token">DD/MM/YYYY</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-token">Number Format</span>
              <span className="font-mono text-primary-token">Indian Numbering (Lakhs/Crores)</span>
            </div>
          </div>
        </div>

        {/* Numbering Sequences & Codes */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-2 border-b border-token pb-2">
            <Sliders className="w-4 h-4 text-brand-token" />
            Numbering Sequences & Codes
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Tax Invoice Prefix</span>
              <span className="font-mono font-bold text-brand-token">{settings.invoice_prefix}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Barcode Prefix</span>
              <span className="font-mono font-bold text-brand-token">{settings.barcode_prefix}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Stock Memo Validity</span>
              <span className="font-semibold text-primary-token">{formatQty(settings.stock_memo_validity_days)} Days</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-token">Automated DB Backup</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">{settings.auto_backup}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
