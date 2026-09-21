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

  // Dynamic route resolution from vite-plugin-pages (~react-pages)
  const element = useRoutes(routes);

  // Initial authentication hydration loader
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-indigo-500/20" />
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Loading Platform...
          </p>
        </div>
      </div>
    );
  }

  const isAuthPage = location.pathname === "/login";

  // Redirect unauthenticated requests to login
  if (!user && !isAuthPage) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect authenticated user away from login page to dashboard
  if (user && isAuthPage) {
    return <Navigate to="/dashboard" replace />;
  }

  // Auth pages render standalone without chrome/sidebars
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center">
        {element}
      </div>
    );
  }

  // Application Shell for authenticated dashboard/management pages
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Primary Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {element}
          </div>
        </main>
      </div>
    </div>
  );
}
