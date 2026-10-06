import React, { useState } from "react";
import { useRoutes, useLocation, Navigate } from "react-router-dom";
import routes from "~react-pages";
import { useAuth } from "../context/authProvider";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";

export default function BaseLayout() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("sidebar_collapsed", String(next));
        } catch {}
        return next;
      });
    }
  };

  // Dynamic route resolution from vite-plugin-pages (~react-pages)
  const element = useRoutes(routes);

  // Initial authentication hydration loader
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-canvas text-primary-token">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[var(--brand-secondary)] border-t-transparent rounded-full animate-spin shadow-lg shadow-[rgba(0,210,210,0.25)]" />
          <p className="text-xs font-semibold text-secondary-token tracking-wider uppercase">
            Loading Platform...
          </p>
        </div>
      </div>
    );
  }

  const isAuthPage = location.pathname === "/login";
  const isPublicStorefront =
    location.pathname.startsWith("/shopping") ||
    location.pathname.startsWith("/customer-account") ||
    location.pathname.startsWith("/help-policies") ||
    location.pathname.startsWith("/useful-additions");

  // Redirect unauthenticated requests to login (except auth page & public storefront pages)
  if (!user && !isAuthPage && !isPublicStorefront) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect authenticated user away from login page to dashboard
  if (user && isAuthPage) {
    return <Navigate to="/dashboard" replace />;
  }

  // Auth pages render standalone without chrome/sidebars
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col justify-center">
        {element}
      </div>
    );
  }

  // Application Shell for authenticated dashboard/management pages
  return (
    <div className="flex h-screen overflow-hidden bg-canvas text-primary-token">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => {
          setSidebarCollapsed((prev) => {
            const next = !prev;
            try {
              localStorage.setItem("sidebar_collapsed", String(next));
            } catch {}
            return next;
          });
        }}
      />

      {/* Primary Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavBar
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-canvas-subtle">
          <div className="w-full animate-fade-in">
            {element}
          </div>
        </main>
      </div>
    </div>
  );
}
