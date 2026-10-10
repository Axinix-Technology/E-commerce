import React from "react";
import { Menu, Shield, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/authProvider";
import { useTheme } from "../context/themeProvider";

export default function TopNavBar({ onToggleSidebar, isSidebarCollapsed }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 glass-panel border-b border-token px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-secondary-token hover:text-primary-token hover:bg-surface-elevated transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-token"
          title={isSidebarCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
        >
          <Menu className="w-5 h-5 text-brand-token" />
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-secondary)] shadow-[0_0_8px_var(--brand-secondary)] animate-pulse" />
          <span className="text-xs font-semibold text-secondary-token">Cluster Status:</span>
          <span className="text-xs font-bold text-brand-token">Online</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-secondary-token hover:text-primary-token bg-surface hover:bg-surface-elevated border border-token shadow-sm transition-all cursor-pointer flex items-center justify-center"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-[var(--brand-accent)] hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--brand-primary)] hover:-rotate-12 transition-transform" />
          )}
        </button>

        {user?.isSuperAdmin || user?.role === "ADMIN" ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-[var(--brand-accent)] text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </div>
        ) : null}

        <div className="h-4 w-[1px] bg-[var(--border-subtle)] hidden sm:block" />

        <div className="flex items-center gap-2 text-xs text-secondary-token">
          <span className="hidden md:inline font-semibold text-primary-token">
            @{user?.username || user?.email}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-rose-500/10 text-secondary-token hover:text-rose-500 border border-token hover:border-rose-500/30 transition-all font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
