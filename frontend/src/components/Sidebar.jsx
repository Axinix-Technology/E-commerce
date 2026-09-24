import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/authProvider";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [appVersion, setAppVersion] = React.useState("1.0.0");

  React.useEffect(() => {
    fetch("/version.json")
      .then((r) => r.json())
      .then((d) => {
        if (d?.version) setAppVersion(d.version);
      })
      .catch(() => {});
  }, []);

  const navGroups = [
    {
      group: "Core Platform",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
          badge: null
        }
      ]
    }
  ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 glass-panel border-r border-token flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 flex items-center justify-between border-b border-token">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white shadow-lg shadow-[rgba(0,210,210,0.25)] border border-[rgba(0,210,210,0.3)]">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-tight text-primary-token">Central Platform</h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[rgba(0,210,210,0.12)] text-brand-token border border-[rgba(0,210,210,0.25)]">
                  v{appVersion}
                </span>
              </div>
              <p className="text-[10px] text-secondary-token font-semibold tracking-wider uppercase">
                Admin Console
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3.5 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-token">
                {grp.group}
              </p>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/");

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024 && onClose) onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[rgba(0,210,210,0.12)] text-brand-token border border-[var(--brand-secondary)] shadow-sm"
                        : "text-secondary-token hover:text-primary-token hover:bg-surface-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-[var(--brand-secondary)]" : "text-muted-token"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[rgba(0,210,210,0.15)] text-brand-token border border-[var(--brand-secondary)] rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3.5 border-t border-token bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[rgba(0,210,210,0.12)] border border-[rgba(0,210,210,0.3)] flex items-center justify-center text-brand-token text-xs font-bold">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary-token truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-muted-token truncate">{user?.role || "Super Admin"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-muted-token hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
