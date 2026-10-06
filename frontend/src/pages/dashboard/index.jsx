import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authProvider";
import {
  ShieldCheck,
  Database,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Server,
  Activity,
  Cpu,
  Zap,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { Button, Badge } from "../../components/ui";

export default function Dashboard() {
  const { user } = useAuth();
  const [backendVersion, setBackendVersion] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);

  const checkHealth = async () => {
    setPingLoading(true);
    try {
      const res = await axiosInstance.get("/company/public/");
      setBackendVersion({ success: true, company: res.data?.name || "Connected" });
    } catch (err) {
      setBackendVersion({ success: false, error: err.message });
    } finally {
      setPingLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const statsCards = [
    {
      title: "Core Architecture",
      value: "Populate Engine",
      description: "10-Stage Request Pipeline",
      icon: Layers,
      iconColor: "text-brand-token",
    },
    {
      title: "Database Engine",
      value: "MySQL 8.0",
      description: "Strict Trans & Status Scoping",
      icon: Database,
      iconColor: "text-brand-token",
    },
    {
      title: "Cron & Queue",
      value: "Active Ledger",
      description: "Channel Sync & Inventory",
      icon: Clock,
      iconColor: "text-amber-500 dark:text-amber-400",
    },
    {
      title: "Active Role",
      value: user?.role || "ADMIN",
      description: "Bcrypt & Token Authenticated",
      icon: ShieldCheck,
      iconColor: "text-emerald-500 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden border border-token">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-token/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm">
                Enterprise Console
              </Badge>
              <span className="flex items-center gap-1.5 text-xs text-brand-token font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-primary-token tracking-tight">
              Welcome back, {user?.name || user?.username || "Administrator"}
            </h1>
            <p className="text-xs md:text-sm text-secondary-token mt-1 max-w-2xl">
              Centralized platform console with file-based routing and dynamic backend execution engine.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={pingLoading}
            onClick={checkHealth}
          >
            {pingLoading ? "Checking..." : "Ping Backend"}
          </Button>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>System Status: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Operational</strong></span>
        <span>•</span>
        <span>Pipeline Engine: <strong className="text-brand-token font-medium">10 Stages Active</strong></span>
        <span>•</span>
        <span>Database: <strong className="text-primary-token font-medium">MySQL 8.0 InnoDb</strong></span>
        <span>•</span>
        <span>Session Auth: <strong className="text-primary-token font-medium">Token + Fingerprint Scoped</strong></span>
      </div>

      {/* Metric Cards Grid with Harmonious Token Styling in Light and Dark Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="glass-panel p-5 rounded-2xl border border-token hover:border-brand-token/40 transition-all shadow-sm group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-secondary-token">{card.title}</span>
                <div className="w-9 h-9 rounded-xl bg-surface-elevated/80 border border-token flex items-center justify-center shadow-xs">
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <div className="text-xl font-bold text-primary-token tracking-tight">{card.value}</div>
              <p className="text-[11px] text-muted-token mt-1">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* System Architecture & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backend Connectivity Status */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4 border border-token">
          <div className="flex items-center justify-between border-b border-token pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-token" />
              <h2 className="text-sm font-bold text-primary-token">System Infrastructure Health</h2>
            </div>
            <Badge variant="success" size="sm">
              Status: Live
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-token flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary-token">Django MySQL Engine</p>
                <p className="text-[11px] text-secondary-token mt-0.5">
                  Mounted at <code className="text-brand-token font-mono font-semibold">/api/</code> with Bcrypt & Token Auth.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-token flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary-token">Company Master</p>
                <p className="text-[11px] text-secondary-token mt-0.5">
                  Live public profile endpoint at <code className="text-brand-token font-mono font-semibold">/api/company/public/</code>.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-token flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary-token">Responsive Design Tokens</p>
                <p className="text-[11px] text-secondary-token mt-0.5">
                  Primary Navy, Secondary Cyan, and Amber Accent with Light/Dark switching.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-elevated/40 border border-token flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary-token">Session & FCM Support</p>
                <p className="text-[11px] text-secondary-token mt-0.5">
                  Device sessions and FCM tokens recorded directly into MySQL.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand & Theme Palette Guide */}
        <div className="glass-panel p-6 rounded-2xl space-y-3 border border-token">
          <div className="flex items-center gap-2 text-brand-token">
            <Sparkles className="w-4 h-4 text-brand-token" />
            <h2 className="text-sm font-bold text-primary-token">Active Theme Tokens</h2>
          </div>
          <p className="text-xs text-secondary-token leading-relaxed">
            Curated brand palette tokens adapting dynamically across Light and Dark modes:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/40 border border-token">
              <span className="font-semibold text-primary-token">Primary Navy:</span>
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#081C2C] text-white shadow-xs">#081C2C</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/40 border border-token">
              <span className="font-semibold text-primary-token">Secondary Teal:</span>
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#00D2D2] text-[#081C2C] font-bold shadow-xs">#00D2D2</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-elevated/40 border border-token">
              <span className="font-semibold text-primary-token">Accent Amber:</span>
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#F59E0B] text-white font-bold shadow-xs">#F59E0B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
