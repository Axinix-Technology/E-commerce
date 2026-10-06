import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tag, Plus, ExternalLink, Edit2, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function BrandsIndex() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [websiteFilter, setWebsiteFilter] = useState("all");

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("brand_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setBrands(data);
    } catch {
      setBrands([
        { id: 1, name: "Axinix Couture", code: "BRD-AX-01", website: "https://axinix.com/couture", status: 1 },
        { id: 2, name: "Viraasat Heritage Silks", code: "BRD-VIR-02", website: "https://axinix.com/viraasat", status: 1 },
        { id: 3, name: "Aura Daily Pret", code: "BRD-AURA-03", website: "https://axinix.com/aura", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const filtered = brands.filter((b) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (b.name || "").toLowerCase().includes(term) ||
      (b.code || "").toLowerCase().includes(term) ||
      (b.website || "").toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "all" ? true : String(b.status) === String(statusFilter);
    const matchesWebsite =
      websiteFilter === "all"
        ? true
        : websiteFilter === "has_url"
        ? Boolean(b.website)
        : !b.website;

    return matchesSearch && matchesStatus && matchesWebsite;
  });

  const columns = [
    {
      key: "name",
      header: "Brand / Label Name",
      render: (val) => <span className="font-semibold text-primary-token text-xs">{val}</span>,
    },
    {
      key: "code",
      header: "Code",
      render: (val) => <span className="font-mono text-xs text-brand-token font-semibold">{val}</span>,
    },
    {
      key: "website",
      header: "Official Website",
      render: (val) =>
        val ? (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-brand-token hover:underline"
          >
            {val}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (val) => (
        <Badge variant={val === 1 ? "emerald" : "rose"} size="sm" dot>
          {val === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <Link to={`/catalogue/brands/create?id=${row.id}`}>
          <Button size="xs" variant="ghost" icon={Edit2}>
            Edit
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-surface-elevated/40 border border-teal-200/80 dark:border-token text-brand-token shadow-xs">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-primary-token tracking-tight">
              Brands & Labels Master
            </h1>
            <p className="text-xs text-slate-500 dark:text-muted-token mt-0.5">
              Manage in-house couture lines and third-party designer label licensing
            </p>
          </div>
        </div>
        <Link to="/catalogue/brands/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Brand
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="glass-panel flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-xl text-xs text-secondary-token shadow-xs">
        <span>Registered Brands: <strong className="text-primary-token font-bold">{formatQty(brands.length)}</strong></span>
        <span>•</span>
        <span>Active Labels: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatQty(brands.filter(b => b.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Catalogue Filtration: <strong className="text-teal-600 dark:text-cyan-400 font-bold">Facet Enabled</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by brand name, code, or website..."
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
              value={websiteFilter}
              onChange={(e) => setWebsiteFilter(e.target.value)}
              options={[
                { label: "All Presence", value: "all" },
                { label: "With Official URL", value: "has_url" },
                { label: "Offline Labels Only", value: "offline" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setWebsiteFilter("all");
        }}
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchBrands}
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
        emptyMessage="No brands found matching your criteria."
      />
    </div>
  );
}
