import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Tags,
  FolderKanban,
  ShieldCheck,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  CircleDot,
  Truck,
  Boxes,
  BarChart3,
  FolderTree,
  Package,
  Building2,
  Users,
  Receipt,
  PackageCheck,
  QrCode,
  ArrowRightLeft,
  Network,
  FileSpreadsheet,
  Barcode,
  ShoppingBag,
  CreditCard,
  Lock,
  RotateCcw,
  Building,
  Briefcase,
  Award,
  Palette,
  Tag,
  Ruler,
  UserCheck,
  DollarSign,
  FileText,
  BookOpen,
  Edit3,
  Copy,
  AlertTriangle,
  Link,
  Unlink,
  Wallet,
  Coins,
  FileBarChart,
  Key,
  Sliders,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/authProvider";
import populateApi from "../api/populate.api";

// Icon dictionary for dynamic database navigation nodes
const ICON_MAP = {
  LayoutDashboard,
  Tags,
  FolderKanban,
  Layers,
  Truck,
  Boxes,
  BarChart3,
  FolderTree,
  Package,
  Building2,
  Users,
  Receipt,
  ReceiptPercent: Receipt,
  PackageCheck,
  QrCode,
  ArrowRightLeft,
  Network,
  FileSpreadsheet,
  Barcode,
  ShoppingBag,
  CreditCard,
  Lock,
  RotateCcw,
  ShieldCheck,
  Building,
  Briefcase,
  Award,
  Palette,
  Tag,
  Ruler,
  UserCheck,
  DollarSign,
  FileText,
  BookOpen,
  Edit3,
  Copy,
  AlertTriangle,
  Link,
  Unlink,
  Wallet,
  Coins,
  FileBarChart,
  Key,
  Sliders,
  ShieldAlert,
};

let sidebarCache = null;
let sidebarInFlightPromise = null;

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [appVersion, setAppVersion] = useState("1.0.0");
  const [navItems, setNavItems] = useState(() => sidebarCache || []);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // When sidebar is collapsed on desktop, hover temporarily expands it cleanly
  const isEffectiveCollapsed = isCollapsed && !isHovered;

  useEffect(() => {
    fetch("/version.json")
      .then((r) => r.json())
      .then((d) => {
        if (d?.version) setAppVersion(d.version);
      })
      .catch(() => {});
  }, []);

  // Fetch dynamic sidebars from Populate Engine (cached & deduplicated)
  useEffect(() => {
    let isMounted = true;

    if (sidebarCache && sidebarCache.length > 0) {
      setNavItems(sidebarCache);
      return;
    }

    if (!sidebarInFlightPromise) {
      sidebarInFlightPromise = populateApi
        .read("sidebar", {
          filter: { parent__isnull: true },
          populate: { children: ["id", "title", "main_route", "icon", "badge", "order"] },
          sort: ["order", "id"],
        })
        .then((res) => {
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            sidebarCache = res.data;
          }
          return res;
        })
        .finally(() => {
          sidebarInFlightPromise = null;
        });
    }

    sidebarInFlightPromise
      .then((res) => {
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setNavItems(res.data);
        }
      })
      .catch(() => {
        // Fallback default navigation if network error
        if (isMounted) {
          setNavItems([
            {
              id: 1,
              title: "Dashboard",
              main_route: "/dashboard",
              icon: "LayoutDashboard",
              has_children: false,
            },
            {
              id: 2,
              title: "Catalogue Master",
              icon: "Tags",
              has_children: true,
              children: [
                { id: 21, title: "Category", main_route: "/catalogue/categories", icon: "FolderTree" },
                { id: 22, title: "Product", main_route: "/catalogue/products", icon: "Package" },
                { id: 23, title: "Vendor Registration", main_route: "/catalogue/vendors", icon: "Building2" },
                { id: 24, title: "Customer Master", main_route: "/catalogue/customers", icon: "Users" },
                { id: 25, title: "GST Master", main_route: "/catalogue/gst-slabs", icon: "ReceiptPercent" },
              ],
            },
            {
              id: 3,
              title: "Inward Management",
              icon: "Truck",
              has_children: true,
              children: [
                { id: 31, title: "Purchase Inward (GRN)", main_route: "/inward/purchase", icon: "PackageCheck" },
              ],
            },
            {
              id: 4,
              title: "Inventory Operations",
              icon: "Boxes",
              has_children: true,
              children: [
                { id: 41, title: "Barcode Tagging & Units", main_route: "/inventory/tagging", icon: "QrCode" },
                { id: 42, title: "Stock Movements & Memo", main_route: "/inventory/movement", icon: "ArrowRightLeft" },
                { id: 43, title: "Branch Transfers", main_route: "/inventory/branch-transfer", icon: "Network" },
              ],
            },
            {
              id: 5,
              title: "Sales & POS",
              icon: "ShoppingBag",
              has_children: true,
              children: [
                { id: 51, title: "Sales Orders", main_route: "/sales/index", icon: "ShoppingBag" },
                { id: 52, title: "New Sale (POS)", main_route: "/sales/create", icon: "Receipt" },
              ],
            },
            {
              id: 6,
              title: "Customer Returns",
              icon: "RotateCcw",
              has_children: true,
              children: [
                { id: 61, title: "Returns (RMA)", main_route: "/returns/index", icon: "RotateCcw" },
                { id: 62, title: "Initiate Return", main_route: "/returns/create", icon: "ArrowRightLeft" },
              ],
            },
            {
              id: 7,
              title: "Payment Operations",
              icon: "CreditCard",
              has_children: true,
              children: [
                { id: 71, title: "Collections", main_route: "/payments/index", icon: "CreditCard" },
                { id: 72, title: "Refunds Ledger", main_route: "/payments/refunds", icon: "RotateCcw" },
              ],
            },
            {
              id: 8,
              title: "Reports & Analytics",
              icon: "BarChart3",
              has_children: true,
              children: [
                { id: 81, title: "Sales Summary", main_route: "/reports/sales-summary", icon: "BarChart3" },
                { id: 82, title: "Customer Purchases", main_route: "/reports/customer-purchases", icon: "Users" },
                { id: 83, title: "Payment Reconciliation", main_route: "/reports/payments", icon: "CreditCard" },
                { id: 84, title: "Stock In/Out Summary", main_route: "/reports/stock-summary", icon: "FileSpreadsheet" },
                { id: 85, title: "Detailed Stock Report", main_route: "/reports/detailed-stock", icon: "Barcode" },
              ],
            },
            {
              id: 9,
              title: "Store Settings",
              icon: "ShieldCheck",
              has_children: true,
              children: [
                { id: 91, title: "Store Profile", main_route: "/settings/store", icon: "Building2" },
                { id: 93, title: "Roles & Permissions", main_route: "/settings/roles-permissions", icon: "ShieldCheck" },
              ],
            },
          ]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Accordion Auto-expand: Open ONLY the active parent menu matching the current URL route
  useEffect(() => {
    if (!navItems || navItems.length === 0) return;
    const activeParent = navItems.find((item) =>
      item.children?.some(
        (child) =>
          child.main_route &&
          (location.pathname === child.main_route || location.pathname.startsWith(child.main_route))
      )
    );
    if (activeParent) {
      setOpenMenuId(activeParent.id);
    }
  }, [location.pathname, navItems]);

  // Accordion toggle: Only the clicked parent opens, all others collapse like a toggle
  const toggleSubmenu = (menuId) => {
    setOpenMenuId((prev) => (prev === menuId ? null : menuId));
  };

  const renderIcon = (iconName, className) => {
    const Component = ICON_MAP[iconName] || CircleDot;
    return <Component className={className} />;
  };

  return (
    <aside
      onMouseEnter={() => {
        if (isCollapsed) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (isCollapsed) setIsHovered(false);
      }}
      className={`fixed lg:static inset-y-0 left-0 z-40 glass-panel border-r border-token flex flex-col justify-between transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${
        isEffectiveCollapsed ? "w-[72px]" : "w-64"
      } ${
        isHovered && isCollapsed ? "lg:absolute lg:shadow-2xl z-50 bg-surface/98 backdrop-blur-md" : ""
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className={`h-16 px-4 flex items-center ${isEffectiveCollapsed ? "justify-center" : "justify-between"} border-b border-token transition-all`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] flex items-center justify-center text-white shadow-lg shadow-[rgba(0,210,210,0.25)] border border-[rgba(0,210,210,0.3)]">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {!isEffectiveCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight text-primary-token truncate">Central Platform</h1>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[rgba(0,210,210,0.12)] text-brand-token border border-[rgba(0,210,210,0.25)] shrink-0">
                    v{appVersion}
                  </span>
                </div>
                <p className="text-[10px] text-secondary-token font-semibold tracking-wider uppercase truncate">
                  Admin Console
                </p>
              </div>
            )}
          </div>
          {!isEffectiveCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-muted-token hover:text-primary-token hover:bg-surface-elevated transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dynamic Navigation */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {!isEffectiveCollapsed ? (
            <p className="px-3 pt-1 text-[10px] font-bold uppercase tracking-wider text-muted-token">
              Navigation Menu
            </p>
          ) : (
            <div className="h-2" />
          )}

          {navItems.map((item) => {
            const hasChildren = (item.children && item.children.length > 0) || item.has_children;
            const isSubmenuOpen = openMenuId === item.id;
            const isDirectActive = item.main_route && location.pathname === item.main_route;
            const isChildActive = item.children?.some(
              (c) => c.main_route && (location.pathname === c.main_route || location.pathname.startsWith(c.main_route))
            );

            if (hasChildren) {
              return (
                <div key={item.id} className="space-y-1">
                  {/* Parent Accordion Header */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isEffectiveCollapsed && onToggleCollapse) {
                        onToggleCollapse();
                      }
                      toggleSubmenu(item.id);
                    }}
                    title={isEffectiveCollapsed ? item.title : undefined}
                    className={`w-full flex items-center ${isEffectiveCollapsed ? "justify-center px-2.5" : "justify-between px-3"} py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isChildActive || isDirectActive
                        ? "bg-[rgba(0,210,210,0.08)] text-brand-token border border-[rgba(0,210,210,0.2)]"
                        : "text-secondary-token hover:text-primary-token hover:bg-surface-elevated"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {renderIcon(
                        item.icon,
                        `w-4 h-4 shrink-0 ${isChildActive || isDirectActive ? "text-[var(--brand-secondary)]" : "text-muted-token"}`
                      )}
                      {!isEffectiveCollapsed && <span className="truncate">{item.title}</span>}
                    </div>
                    {!isEffectiveCollapsed && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-muted-token shrink-0 transition-transform duration-300 ease-in-out ${
                          isSubmenuOpen ? "rotate-180 text-[var(--brand-secondary)]" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Submenu Children Links with Smooth Height & Opacity Animation */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isSubmenuOpen && !isEffectiveCollapsed ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-[rgba(0,210,210,0.15)] ml-4">
                        {item.children?.map((child) => {
                          const isSubActive = location.pathname === child.main_route;
                          return (
                            <NavLink
                              key={child.id || child.main_route}
                              to={child.main_route}
                              onClick={() => {
                                if (window.innerWidth < 1024 && onClose) onClose();
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isSubActive
                                  ? "bg-[rgba(0,210,210,0.15)] text-brand-token font-semibold shadow-xs"
                                  : "text-secondary-token hover:text-primary-token hover:bg-surface-elevated"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                                    isSubActive
                                      ? "bg-[var(--brand-secondary)] ring-2 ring-[var(--brand-secondary)]/30 scale-125"
                                      : "bg-muted-token/50"
                                  }`}
                                />
                                <span className="truncate">{child.title}</span>
                              </div>
                              {child.badge && (
                                <span className="px-1.5 py-0.5 text-[8px] font-bold bg-[rgba(0,210,210,0.15)] text-brand-token rounded shrink-0">
                                  {child.badge}
                                </span>
                              )}
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Standalone Link (e.g. Dashboard)
            return (
              <NavLink
                key={item.id || item.main_route}
                to={item.main_route}
                title={isEffectiveCollapsed ? item.title : undefined}
                onClick={() => {
                  if (window.innerWidth < 1024 && onClose) onClose();
                }}
                className={`flex items-center ${isEffectiveCollapsed ? "justify-center px-2.5" : "justify-between px-3"} py-2 rounded-xl text-xs font-semibold transition-all ${
                  isDirectActive
                    ? "bg-[rgba(0,210,210,0.12)] text-brand-token border border-[var(--brand-secondary)] shadow-sm"
                    : "text-secondary-token hover:text-primary-token hover:bg-surface-elevated"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderIcon(
                    item.icon,
                    `w-4 h-4 shrink-0 ${isDirectActive ? "text-[var(--brand-secondary)]" : "text-muted-token"}`
                  )}
                  {!isEffectiveCollapsed && <span className="truncate">{item.title}</span>}
                </div>
                {!isEffectiveCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[rgba(0,210,210,0.15)] text-brand-token border border-[var(--brand-secondary)] rounded-md shrink-0">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-token bg-surface">
        <div className={`flex items-center ${isEffectiveCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2.5 min-w-0" title={isEffectiveCollapsed ? (user?.name || "Admin") : undefined}>
            <div className="w-8 h-8 shrink-0 rounded-lg bg-[rgba(0,210,210,0.12)] border border-[rgba(0,210,210,0.3)] flex items-center justify-center text-brand-token text-xs font-bold">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            {!isEffectiveCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary-token truncate">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-muted-token truncate">{user?.role || "Super Admin"}</p>
              </div>
            )}
          </div>
          {!isEffectiveCollapsed && (
            <button
              onClick={logout}
              title="Log Out"
              className="p-1.5 rounded-lg text-muted-token hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
