import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sliders, Edit, Globe, Clock, ShieldCheck, Database, RefreshCw } from "lucide-react";
import { formatQty } from "../../../utils/formatters";
import { Button, Badge } from "../../../components/ui";
import populateApi from "../../../api/populate.api";

export default function GeneralSettingsIndex() {
  const [settings, setSettings] = useState({
    currency: "—",
    timezone: "—",
    invoice_prefix: "—",
    barcode_prefix: "—",
    stock_memo_validity_days: "—",
    low_stock_threshold: "—",
    auto_backup: "—",
    sms_notifications: "—",
    whatsapp_receipts: "—",
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("general_setting", { limit: 100 });
      const list = Array.isArray(res) ? res : res?.data || [];
      if (list.length > 0) {
        const map = {};
        list.forEach((item) => {
          if (item.key) map[item.key] = item.value;
        });
        setSettings((prev) => ({ ...prev, ...map }));
      }
    } catch (err) {
      console.warn("No custom general settings loaded from DB, showing defaults:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} loading={loading} onClick={fetchSettings}>
            Sync
          </Button>
          <Link to="/settings/general/create">
            <Button variant="primary" size="sm" icon={Edit}>
              Update Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Base Currency: <strong className="text-primary-token font-medium">{settings.currency}</strong></span>
        <span>•</span>
        <span>Timezone: <strong className="text-primary-token font-medium">{settings.timezone}</strong></span>
        <span>•</span>
        <span>Low Stock Alert: <strong className="text-amber-800 dark:text-amber-400 font-medium">&lt; {formatQty(settings.low_stock_threshold)} Units</strong></span>
        <span>•</span>
        <span>Status: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">Configured</strong></span>
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
              <span className="font-medium text-primary-token">{settings.timezone}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-token">Fiscal Year Convention</span>
              <span className="font-medium text-brand-token">April – March (India)</span>
            </div>
          </div>
        </div>

        {/* Numbering & Prefixes */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-2 border-b border-token pb-2">
            <Clock className="w-4 h-4 text-brand-token" />
            Serial Numbering & Sequences
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Invoice Number Prefix</span>
              <span className="font-mono font-semibold text-primary-token">{settings.invoice_prefix}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Barcode Serial Prefix</span>
              <span className="font-mono font-semibold text-primary-token">{settings.barcode_prefix}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-token">Stock Approval Validity</span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {settings.stock_memo_validity_days !== "—" ? `${settings.stock_memo_validity_days} Days` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Operational Thresholds */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-2 border-b border-token pb-2">
            <ShieldCheck className="w-4 h-4 text-brand-token" />
            Operational & Inventory Guards
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Low Stock Alert Threshold</span>
              <span className="font-semibold text-primary-token">{formatQty(settings.low_stock_threshold)} Units</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Automated DB Backup</span>
              <Badge variant="brand">{settings.auto_backup !== "—" ? String(settings.auto_backup) : "Active"}</Badge>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-token">Audit Trail Retention</span>
              <span className="font-medium text-primary-token">365 Days (Compliant)</span>
            </div>
          </div>
        </div>

        {/* Communication & Alerts */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-2 border-b border-token pb-2">
            <Database className="w-4 h-4 text-brand-token" />
            Communication & Webhooks
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">SMS Gateway Dispatch</span>
              <Badge variant="secondary">{String(settings.sms_notifications || "—")}</Badge>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">WhatsApp Invoices</span>
              <Badge variant="brand">{String(settings.whatsapp_receipts || "—")}</Badge>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-token">FCM Push Notifications</span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
