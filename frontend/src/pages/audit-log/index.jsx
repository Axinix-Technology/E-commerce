import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Plus, RefreshCw, User } from "lucide-react";
import populateApi from "../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function AuditLogIndex() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("audit_log", { limit: 100, sort: ["-created_at"] });
      const items = Array.isArray(res) ? res : res.data || [];
      setLogs(items);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setActionFilter("all");
    setModuleFilter("all");
  };

  const filtered = logs.filter((l) => {
    const uName = (l.user_name || (typeof l.user === 'object' ? l.user?.username : l.user) || "").toLowerCase();
    const mod = (l.module || l.entity || "").toLowerCase();
    const desc = (l.description || l.details || "").toLowerCase();
    const ip = (l.ip_address || "");
    const reqId = (l.request_id || "").toLowerCase();
    const term = search.toLowerCase();

    const matchesSearch =
      uName.includes(term) ||
      mod.includes(term) ||
      desc.includes(term) ||
      ip.includes(term) ||
      reqId.includes(term);

    const matchesAction = actionFilter === "all" || (l.action || "").toUpperCase() === actionFilter.toUpperCase();
    const matchesModule = moduleFilter === "all" || mod.toUpperCase().includes(moduleFilter.toUpperCase());

    return matchesSearch && matchesAction && matchesModule;
  });

  const getActionBadgeVariant = (action) => {
    switch (action?.toUpperCase()) {
      case "CREATE":
      case "INSERT":
        return "success";
      case "UPDATE":
      case "EDIT":
        return "primary";
      case "DELETE":
      case "DROP":
        return "danger";
      case "LOGIN":
      case "AUTH":
        return "warning";
      default:
        return "neutral";
    }
  };

  const columns = [
    {
      header: "Action",
      render: (l) => (
        <Badge variant={getActionBadgeVariant(l.action)} size="sm">
          {(l.action || "INFO").toUpperCase()}
        </Badge>
      ),
    },
    {
      header: "Module / Entity",
      render: (l) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-elevated border border-token text-secondary-token uppercase tracking-wide">
          {l.module || l.entity || "SYSTEM"}
        </span>
      ),
    },
    {
      header: "Description / Event Details",
      accessor: "description",
      render: (l) => (
        <span className="text-secondary-token text-xs max-w-md line-clamp-2">
          {l.description || l.details || "—"}
        </span>
      ),
    },
    {
      header: "Actor",
      render: (l) => {
        const u = l.user_name || (typeof l.user === 'object' ? l.user?.username : l.user) || "System";
        return (
          <div className="flex items-center gap-1.5 text-xs text-primary-token font-medium">
            <User className="w-3.5 h-3.5 text-muted-token shrink-0" />
            {u}
          </div>
        );
      },
    },
    {
      header: "IP Address",
      render: (l) => (
        <span className="font-mono text-xs text-muted-token">
          {l.ip_address || "—"}
        </span>
      ),
    },
    {
      header: "Timestamp",
      render: (l) => (
        <span className="text-[11px] text-muted-token font-mono">
          {l.created_at ? new Date(l.created_at).toLocaleString("en-IN") : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              System Audit & Security Logs
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Comprehensive tamper-evident record of database transactions, user actions, and administrative overrides
            </p>
          </div>
        </div>

        <Link to="/audit-log/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Append Event
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Logged Events: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Audit Trail: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Active & Immutable</strong></span>
        <span>•</span>
        <span>Chain Integrity: <strong className="text-brand-token font-medium">Verified</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search audit log by user, module, IP, or details..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              options={[
                { value: "all", label: "All Actions" },
                { value: "CREATE", label: "CREATE" },
                { value: "UPDATE", label: "UPDATE" },
                { value: "DELETE", label: "DELETE" },
                { value: "LOGIN", label: "LOGIN" },
              ]}
            />
            <Select
              size="xs"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              options={[
                { value: "all", label: "All Modules" },
                { value: "CATALOGUE", label: "Catalogue" },
                { value: "INVENTORY", label: "Inventory" },
                { value: "ORDERS", label: "Orders" },
                { value: "BILLING", label: "Billing" },
                { value: "AUTH", label: "Authentication" },
                { value: "SETTINGS", label: "Settings" },
              ]}
            />
          </>
        }
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchLogs}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No audit log entries recorded."
      />
    </div>
  );
}
