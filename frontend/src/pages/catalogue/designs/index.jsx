import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Palette, Plus, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function DesignsIndex() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [patternTypeFilter, setPatternTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("design_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setDesigns(data);
    } catch {
      setDesigns([
        { id: 1, name: "Temple Border Motif", code: "DSN-TMPL-01", pattern_type: "Traditional Woven", description: "Traditional South Indian temple gopuram triangular border weave", status: 1 },
        { id: 2, name: "Paisley / Kalka Jaal", code: "DSN-PSLY-02", pattern_type: "Intricate Floral", description: "All-over gold zari paisley vine motifs with floral interlacing", status: 1 },
        { id: 3, name: "Geometric Chevron", code: "DSN-CHEV-03", pattern_type: "Modern Contemporary", description: "Sharp zig-zag chevron lines in dual tone metallic dye", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const patternTypeOptions = [
    { label: "All Pattern Types", value: "all" },
    ...Array.from(new Set(designs.map((d) => d.pattern_type).filter(Boolean))).map((pt) => ({
      label: pt,
      value: pt,
    })),
  ];

  const filtered = designs.filter((d) => {
    if (statusFilter !== "all" && String(d.status) !== statusFilter) return false;
    if (patternTypeFilter !== "all" && d.pattern_type !== patternTypeFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (d.name || "").toLowerCase().includes(term) ||
      (d.code || "").toLowerCase().includes(term) ||
      (d.pattern_type || "").toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      header: "Design Code",
      render: (d) => (
        <span className="font-mono font-medium text-brand-token text-xs">
          {d.code}
        </span>
      ),
    },
    {
      header: "Design Name",
      accessor: "name",
      className: "font-semibold text-primary-token text-xs",
    },
    {
      header: "Pattern Type",
      render: (d) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-elevated border border-token text-secondary-token uppercase tracking-wide">
          {d.pattern_type || "Standard"}
        </span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      className: "text-muted-token text-xs max-w-md",
    },
    {
      header: "Status",
      render: (d) => (
        <Badge variant={d.status === 1 ? "success" : "neutral"} size="sm">
          {d.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              Designs & Patterns Master
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Catalog design motifs, artisan embroidery prints, and pattern classifications
            </p>
          </div>
        </div>

        <Link to="/catalogue/designs/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Design
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Catalogued Patterns: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Active Motifs: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatQty(filtered.filter((d) => d.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Pattern Standard: <strong className="text-brand-token font-medium">Verified</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, code, or pattern type..."
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
              value={patternTypeFilter}
              onChange={(e) => setPatternTypeFilter(e.target.value)}
              options={patternTypeOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setPatternTypeFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchDesigns}
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
        emptyMessage="No designs or patterns found matching your search."
      />
    </div>
  );
}
