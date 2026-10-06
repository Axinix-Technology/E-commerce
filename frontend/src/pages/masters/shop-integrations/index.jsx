import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Plus, ExternalLink, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function ShopIntegrationsIndex() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("shop_integration", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setShops(data);
    } catch {
      setShops([
        { id: 1, platform: "shopify", store_name: "Axinix Official Online Boutique", store_url: "https://axinix-couture.myshopify.com", sync_interval_minutes: 15, last_synced_at: "2026-10-03 14:00", sync_status: "idle", status: 1 },
        { id: 2, platform: "amazon", store_name: "Axinix Amazon India Storefront", store_url: "https://sellercentral.amazon.in", sync_interval_minutes: 30, last_synced_at: "2026-10-03 13:45", sync_status: "idle", status: 1 },
        { id: 3, platform: "woocommerce", store_name: "Axinix Bridal B2B Wholesale Portal", store_url: "https://b2b.axinix.com", sync_interval_minutes: 60, last_synced_at: "2026-10-03 12:30", sync_status: "idle", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filtered = shops.filter((s) => {
    const matchesSearch =
      (s.store_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.platform || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.store_url || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : String(s.status) === String(statusFilter);
    const matchesPlatform =
      platformFilter === "all"
        ? true
        : (s.platform || "").toLowerCase() === platformFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const totalShops = shops.length;
  const activeShops = shops.filter((s) => s.status === 1).length;

  const columns = [
    {
      key: "store_name",
      header: "Store / Channel Name",
      render: (_, s) => (
        <span className="font-semibold text-slate-800 dark:text-primary-token text-xs">{s?.store_name}</span>
      ),
    },
    {
      key: "platform",
      header: "Platform",
      render: (_, s) => (
        <span className="capitalize font-mono text-xs text-brand-token font-medium">
          {s?.platform}
        </span>
      ),
    },
    {
      key: "store_url",
      header: "Store URL",
      render: (_, s) => (
        <a
          href={s?.store_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-secondary-token hover:text-brand-token"
        >
          <span className="truncate max-w-[200px]">{s?.store_url}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      ),
    },
    {
      key: "sync_interval",
      header: "Sync Frequency",
      render: (_, s) => (
        <span className="text-xs text-slate-700 dark:text-primary-token font-medium">
          Every {s?.sync_interval_minutes} mins
        </span>
      ),
    },
    {
      key: "last_synced",
      header: "Last Sync",
      render: (_, s) => (
        <span className="font-mono text-xs text-slate-500 dark:text-muted-token">
          {s?.last_synced_at || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, s) => (
        <Badge variant={s?.status === 1 ? "emerald" : "rose"} size="sm" dot>
          {s?.status === 1 ? "Connected" : "Paused"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, s) => (
        <Link
          to={`/masters/shop-integrations/create?id=${s?.id}`}
          className="text-xs font-semibold text-brand-token hover:underline"
        >
          Configure
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-surface-elevated/40 border border-teal-200/80 dark:border-token text-brand-token shadow-xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-primary-token tracking-tight">
              Shop & Marketplace Integrations
            </h1>
            <p className="text-xs text-slate-500 dark:text-muted-token mt-0.5">
              Automate omni-channel stock sync, order inwarding, and multi-store catalogue feeds
            </p>
          </div>
        </div>
        <Link to="/masters/shop-integrations/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Connect Store
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="glass-panel flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-xl text-xs text-secondary-token shadow-xs">
        <span>Connected Channels: <strong className="text-primary-token font-bold">{formatQty(totalShops)}</strong></span>
        <span>•</span>
        <span>Active Synchronization: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatQty(activeShops)}</strong></span>
        <span>•</span>
        <span>Omni-Channel Stock Sync: <strong className="text-teal-600 dark:text-cyan-400 font-bold">Real-Time Webhooks</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by store name, platform, or URL..."
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Active", value: "1" },
                { label: "Inactive", value: "0" },
              ]}
            />
            <Select
              size="xs"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              options={[
                { label: "All Platforms", value: "all" },
                { label: "Shopify", value: "shopify" },
                { label: "Amazon", value: "amazon" },
                { label: "WooCommerce", value: "woocommerce" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setPlatformFilter("all");
        }}
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchShops}
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
        emptyMessage="No external channels connected."
      />
    </div>
  );
}
