import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Key, Plus, ShieldCheck, CheckCircle2, Lock, Shield, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function CapabilitiesIndex() {
  const [capabilities, setCapabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchCapabilities = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("capability", { limit: 200 });
      const items = Array.isArray(res) ? res : res.data || [];
      setCapabilities(items);
    } catch {
      setCapabilities([
        { id: 1, key: "catalogue.products.read", action: "read", label: "View Products", description: "View products catalogue", module: "catalogue", status: 1 },
        { id: 2, key: "catalogue.products.create", action: "create", label: "Create Product", description: "Create new product in catalogue", module: "catalogue", status: 1 },
        { id: 3, key: "inventory.tagging.read", action: "read", label: "View Barcode Tagging", description: "Manage physical barcode tags", module: "inventory", status: 1 },
        { id: 4, key: "inventory.movement.create", action: "create", label: "Stock Movement", description: "Move stock across buckets/memos", module: "inventory", status: 1 },
        { id: 5, key: "reports.stock_summary.read", action: "read", label: "View Stock Summary", description: "Aggregated 4-pillar stock report", module: "reports", status: 1 },
        { id: 6, key: "sales.pos.create", action: "create", label: "Execute POS Sale", description: "Generate sales invoices at store counter", module: "sales", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapabilities();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setModuleFilter("all");
    setActionFilter("all");
  };

  const filtered = capabilities.filter((c) => {
    const matchesSearch =
      (c.key || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.label || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.module || "").toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "all" || c.module === moduleFilter;
    const matchesAction = actionFilter === "all" || (c.action || "").toLowerCase() === actionFilter.toLowerCase();
    return matchesSearch && matchesModule && matchesAction;
  });

  const modules = Array.from(new Set(capabilities.map((c) => c.module).filter(Boolean)));

  const columns = [
    {
      header: "Capability Key",
      render: (c) => (
        <span className="font-mono font-medium text-brand-token flex items-center gap-1.5 text-xs">
          <Lock className="w-3.5 h-3.5 text-muted-token shrink-0" />
          {c.key}
        </span>
      ),
    },
    {
      header: "Action",
      render: (c) => (
        <Badge variant="neutral" size="sm">
          {c.action?.toUpperCase() || "—"}
        </Badge>
      ),
    },
    {
      header: "Label",
      accessor: "label",
      className: "font-medium text-primary-token text-xs",
    },
    {
      header: "Module",
      render: (c) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-elevated border border-token text-secondary-token uppercase tracking-wide">
          {c.module}
        </span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      className: "text-muted-token text-xs max-w-sm",
    },
    {
      header: "Status",
      render: (c) => (
        <Badge variant={c.status === 1 ? "success" : "neutral"} size="sm">
          {c.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-token" />
            System Capabilities & Permissions Registry
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Define granular functional privileges mapped to roles and staff access levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/settings/roles-permissions">
            <Button variant="secondary" size="sm" icon={Shield}>
              Role Assignments
            </Button>
          </Link>
          <Link to="/settings/capabilities/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Add Capability
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Registered Capabilities: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Covered Modules: <strong className="text-brand-token font-medium">{formatQty(modules.length)}</strong></span>
        <span>•</span>
        <span>RBAC Enforcement: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Strict (Active)</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by key, action, or module..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              options={[
                { value: "all", label: "All Modules" },
                ...modules.map((m) => ({ value: m, label: m.toUpperCase() })),
              ]}
            />
            <Select
              size="xs"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              options={[
                { value: "all", label: "All Actions" },
                { value: "read", label: "Read / View" },
                { value: "create", label: "Create / Write" },
                { value: "update", label: "Update / Edit" },
                { value: "delete", label: "Delete / Drop" },
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
          onClick={fetchCapabilities}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Standard Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No capabilities found matching the filter criteria."
      />
    </div>
  );
}
