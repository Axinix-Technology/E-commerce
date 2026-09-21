import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authProvider";
import {
  ShieldCheck,
  Database,
  Sliders,
  Server,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

export default function Dashboard() {
  const { user } = useAuth();
  const [backendVersion, setBackendVersion] = useState(null);
  const [pingLoading, setPingLoading] = useState(false);

  const checkHealth = async () => {
    setPingLoading(true);
    try {
      const res = await axiosInstance.get("/version");
      setBackendVersion(res.data);
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
      value: "Tracker-v2",
      description: "Dynamic Populate Dispatcher",
      icon: Layers,
      color: "from-indigo-500 to-violet-500",
      textColor: "text-indigo-400"
    },
    {
      title: "Active Models",
      value: "7 Collections",
      description: "Registered in Collection.js",
      icon: Database,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400"
    },
    {
      title: "Backup & Cron Engine",
      value: "Streaming Gzip",
      description: "node-cron with live DB sync",
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-400"
    },
    {
      title: "Active Role",
      value: user?.role || "Super Admin",
      description: user?.isSuperAdmin ? "Wildcard Bypass Enabled" : "Policy Cache Verified",
      icon: ShieldCheck,
      color: "from-sky-500 to-blue-500",
      textColor: "text-sky-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise Dashboard
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name || "Administrator"}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
              Centralized platform console with file-based routing (<code className="text-indigo-300 font-mono">~react-pages</code>) and dynamic backend execution engine.
            </p>
          </div>

          <button
            onClick={checkHealth}
            disabled={pingLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-white border border-slate-700 transition-all self-start md:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pingLoading ? "animate-spin" : ""}`} />
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
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-md group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-white tracking-tight">{card.value}</div>
              <p className="text-[11px] text-slate-400 mt-1">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* System Architecture & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backend Connectivity Status */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">System Infrastructure Health</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Uptime: {backendVersion?.uptime ? `${backendVersion.uptime}s` : "Live"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Dynamic Populate Engine</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mounted at <code className="text-indigo-300 font-mono">/api/populate</code> with SafeAggregator & Sanitizers.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Database Backup & Cron</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mounted at <code className="text-indigo-300 font-mono">/api/backups</code> with streaming gzip export.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">File-Based Routing Engine</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Powered by <code className="text-indigo-300 font-mono">vite-plugin-pages</code> with zero route pollution.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Tailwind CSS v4 Design</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Curated dark glassmorphism surfaces with HSL tailored tokens.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rule #8 Architecture Directive */}
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-sm font-bold text-white">Architecture Rule #8</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">Populate-Helper + Service First:</strong> Domain services (<code className="text-indigo-300 font-mono">services/&lt;model&gt;.js</code>) can execute ANY arbitrary business logic without writing redundant controllers or routers.
          </p>
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-slate-400 space-y-1">
            <p className="text-indigo-300 font-semibold">Inherited Automatically:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              <li>Predefined Access Policies</li>
              <li>Payload Sanitization</li>
              <li>Safe Aggregator Limits</li>
              <li>Standard Pagination & Search</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
