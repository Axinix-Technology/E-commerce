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
  Server
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

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
      bgColor: "bg-[var(--brand-primary)]",
      badgeColor: "bg-[rgba(0,210,210,0.15)] text-brand-token",
      iconColor: "text-[var(--brand-secondary)]",
    },
    {
      title: "Database Engine",
      value: "MySQL 8.0",
      description: "Strict Trans & Status Scoping",
      icon: Database,
      bgColor: "bg-[var(--brand-primary-navy)]",
      badgeColor: "bg-[rgba(0,210,210,0.15)] text-brand-token",
      iconColor: "text-[var(--brand-secondary)]",
    },
    {
      title: "Cron & Queue",
      value: "Active Ledger",
      description: "Channel Sync & Inventory",
      icon: Clock,
      bgColor: "bg-[rgba(245,158,11,0.15)]",
      badgeColor: "bg-[rgba(245,158,11,0.2)] text-[var(--brand-accent)]",
      iconColor: "text-[var(--brand-accent)]",
    },
    {
      title: "Active Role",
      value: user?.role || "ADMIN",
      description: "Bcrypt & Token Authenticated",
      icon: ShieldCheck,
      bgColor: "bg-[rgba(0,210,210,0.15)]",
      badgeColor: "bg-[rgba(0,210,210,0.2)] text-brand-token",
      iconColor: "text-[var(--brand-secondary)]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--brand-secondary)] opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(0,210,210,0.15)] text-brand-token border border-[var(--brand-secondary)]">
                Enterprise Console
              </span>
              <span className="flex items-center gap-1.5 text-xs text-brand-token font-semibold">
                <span className="w-2 h-2 rounded-full bg-[var(--brand-secondary)] animate-pulse" />
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

          <button
            onClick={checkHealth}
            disabled={pingLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface hover:bg-surface-elevated text-xs font-semibold text-primary-token border border-token shadow-sm transition-all self-start md:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand-token ${pingLoading ? "animate-spin" : ""}`} />
            <span>{pingLoading ? "Checking..." : "Ping Backend"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="glass-panel p-5 rounded-2xl border border-token hover:border-highlight-token transition-all shadow-md group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-secondary-token">{card.title}</span>
                <div
                  className={`w-9 h-9 rounded-xl ${card.bgColor} border border-token flex items-center justify-center shadow-sm`}
                >
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
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-token pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-token" />
              <h2 className="text-sm font-bold text-primary-token">System Infrastructure Health</h2>
            </div>
            <span className="text-[11px] font-mono text-secondary-token">
              Status: Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-surface border border-token flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary-token">Django MySQL Engine</p>
                <p className="text-[11px] text-secondary-token mt-0.5">
                  Mounted at <code className="text-brand-token font-mono font-semibold">/api/</code> with Bcrypt & Token Auth.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-token flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary-token">Company Master</p>
                <p className="text-[11px] text-secondary-token mt-0.5">
                  Live public profile endpoint at <code className="text-brand-token font-mono font-semibold">/api/company/public/</code>.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-token flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary-token">Responsive Design Tokens</p>
                <p className="text-[11px] text-secondary-token mt-0.5">
                  Primary Navy, Secondary Cyan, and Amber Accent with Light/Dark switching.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-token flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5 flex-shrink-0" />
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
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-brand-token">
            <Sparkles className="w-4 h-4 text-[var(--brand-secondary)]" />
            <h2 className="text-sm font-bold text-primary-token">Active Theme Tokens</h2>
          </div>
          <p className="text-xs text-secondary-token leading-relaxed">
            Curated brand palette tokens adapting dynamically across Light and Dark modes:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-token">
              <span className="font-semibold text-primary-token">Primary:</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--brand-primary)] text-white">#081C2C</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-token">
              <span className="font-semibold text-primary-token">Secondary:</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--brand-secondary)] text-[#081C2C] font-bold">#00D2D2</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-token">
              <span className="font-semibold text-primary-token">Accent:</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--brand-accent)] text-white font-bold">#F59E0B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
