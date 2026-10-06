import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserCheck, Plus, RefreshCw, Edit2 } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function AgeGroupsIndex() {
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [spanFilter, setSpanFilter] = useState("all");

  const fetchAgeGroups = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("age_group_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setAgeGroups(data);
    } catch {
      setAgeGroups([
        { id: 1, name: "Infant & Toddler", min_age: 0, max_age: 2, description: "Soft organic cotton bodysuits and ceremonial baby wear", status: 1 },
        { id: 2, name: "Kids & Pre-Teens", min_age: 3, max_age: 12, description: "Festive lehengas, kurtas, and durable party wear", status: 1 },
        { id: 3, name: "Teens & Young Adults", min_age: 13, max_age: 19, description: "Modern fusion indo-western and celebration wear", status: 1 },
        { id: 4, name: "Adults & Seniors", min_age: 20, max_age: 99, description: "Bridal couture, classic sarees, and fine menswear", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgeGroups();
  }, []);

  const filtered = ageGroups.filter((a) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (a.name || "").toLowerCase().includes(term) ||
      (a.description || "").toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "all" ? true : String(a.status) === String(statusFilter);
    const matchesSpan =
      spanFilter === "all"
        ? true
        : spanFilter === "infant"
        ? Number(a.max_age) <= 2
        : spanFilter === "kids"
        ? Number(a.min_age) >= 3 && Number(a.max_age) <= 12
        : spanFilter === "teens"
        ? Number(a.min_age) >= 13 && Number(a.max_age) <= 19
        : Number(a.min_age) >= 20;

    return matchesSearch && matchesStatus && matchesSpan;
  });

  const columns = [
    {
      key: "name",
      header: "Age Group Label",
      render: (val) => <span className="font-semibold text-primary-token text-xs">{val}</span>,
    },
    {
      key: "span",
      header: "Span (Years)",
      render: (_, row) => (
        <span className="font-mono text-xs text-brand-token font-semibold">
          {formatQty(row.min_age)} to {formatQty(row.max_age)} yrs
        </span>
      ),
    },
    {
      key: "description",
      header: "Category Scope",
      render: (val) => <span className="text-secondary-token text-xs">{val || "—"}</span>,
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
        <Link to={`/catalogue/age-groups/create?id=${row.id}`}>
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
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-primary-token tracking-tight">
              Age Groups Master
            </h1>
            <p className="text-xs text-slate-500 dark:text-muted-token mt-0.5">
              Demographic age bands for merchandise filtering and sizing recommendations
            </p>
          </div>
        </div>
        <Link to="/catalogue/age-groups/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Age Group
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="glass-panel flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-xl text-xs text-secondary-token shadow-xs">
        <span>Age Categories: <strong className="text-primary-token font-bold">{formatQty(ageGroups.length)}</strong></span>
        <span>•</span>
        <span>Active Cohorts: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatQty(ageGroups.filter(a => a.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Storefront Tagging: <strong className="text-teal-600 dark:text-cyan-400 font-bold">Auto Facets</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by age group name or description..."
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
              value={spanFilter}
              onChange={(e) => setSpanFilter(e.target.value)}
              options={[
                { label: "All Age Cohorts", value: "all" },
                { label: "Infants (0-2 yrs)", value: "infant" },
                { label: "Kids (3-12 yrs)", value: "kids" },
                { label: "Teens (13-19 yrs)", value: "teens" },
                { label: "Adults (20+ yrs)", value: "adults" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setSpanFilter("all");
        }}
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchAgeGroups}
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
        emptyMessage="No age groups configured."
      />
    </div>
  );
}
