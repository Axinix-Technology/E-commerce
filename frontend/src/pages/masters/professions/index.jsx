import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Plus, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function ProfessionsIndex() {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProfessions = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("profession_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setProfessions(data);
    } catch {
      setProfessions([
        { id: 1, name: "Textile Engineer", description: "Fabric composition, weaving, and textile quality analysis", status: 1 },
        { id: 2, name: "Fashion Stylist", description: "Catalog styling, wardrobe consulting, and visual shoots", status: 1 },
        { id: 3, name: "Pattern Maker", description: "Garment sizing, cutting grading, and dimensional pattern design", status: 1 },
        { id: 4, name: "Retail Store Associate", description: "Customer counter service, billing, and floor merchandizing", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessions();
  }, []);

  const filtered = professions.filter((p) => {
    const matchesSearch =
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : String(p.status) === String(statusFilter);
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "name",
      header: "Profession Title",
      render: (_, p) => (
        <span className="font-semibold text-slate-800 dark:text-primary-token text-xs">{p?.name}</span>
      ),
    },
    {
      key: "description",
      header: "Scope & Description",
      render: (_, p) => (
        <span className="text-slate-600 dark:text-secondary-token text-xs max-w-md block truncate">
          {p?.description || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, p) => (
        <Badge variant={p?.status === 1 ? "emerald" : "rose"} size="sm" dot>
          {p?.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, p) => (
        <Link
          to={`/masters/professions/create?id=${p?.id}`}
          className="text-xs font-semibold text-brand-token hover:underline"
        >
          Edit
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
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-primary-token tracking-tight">
              Professions Master
            </h1>
            <p className="text-xs text-slate-500 dark:text-muted-token mt-0.5">
              Define specialized skill profiles and artisan trades
            </p>
          </div>
        </div>
        <Link to="/masters/professions/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Profession
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="glass-panel flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-xl text-xs text-secondary-token shadow-xs">
        <span>Registered Professions: <strong className="text-primary-token font-bold">{formatQty(professions.length)}</strong></span>
        <span>•</span>
        <span>Active Categories: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatQty(professions.filter((p) => p?.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Assignment Scope: <strong className="text-teal-600 dark:text-cyan-400 font-bold">Enterprise Wide</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search professions by title or description..."
        filters={
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
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
        }}
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchProfessions}
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
        emptyMessage="No professions found matching search criteria."
      />
    </div>
  );
}
