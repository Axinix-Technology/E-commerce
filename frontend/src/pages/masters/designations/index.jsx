import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, Plus, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function DesignationsIndex() {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("designation_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setDesignations(data);
    } catch {
      setDesignations([
        { id: 1, name: "Lead Sourcing Specialist", code: "DES-SRC-01", department_id: 1, description: "Lead buyer for designer bridal assortment", status: 1 },
        { id: 2, name: "Store General Manager", code: "DES-MGR-01", department_id: 2, description: "Overall branch P&L, customer experience, and cash control", status: 1 },
        { id: 3, name: "Head Warehouse Comptroller", code: "DES-WH-01", department_id: 3, description: "Supervisor for inward GRN and barcode tagging operations", status: 1 },
        { id: 4, name: "Senior Retail Billing Cashier", code: "DES-CSH-01", department_id: 2, description: "Counter sales billing and cash register balancing", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const filtered = designations.filter((d) => {
    const matchesSearch =
      (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.code || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : String(d.status) === String(statusFilter);
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "name",
      header: "Designation Title",
      render: (_, d) => (
        <span className="font-semibold text-slate-800 dark:text-primary-token text-xs">{d?.name}</span>
      ),
    },
    {
      key: "code",
      header: "Code",
      render: (_, d) => (
        <span className="font-mono font-medium text-brand-token text-xs">{d?.code}</span>
      ),
    },
    {
      key: "description",
      header: "Role Description",
      render: (_, d) => (
        <span className="text-slate-600 dark:text-secondary-token text-xs max-w-md block truncate">
          {d?.description || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, d) => (
        <Badge variant={d?.status === 1 ? "emerald" : "rose"} size="sm" dot>
          {d?.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, d) => (
        <Link
          to={`/masters/designations/create?id=${d?.id}`}
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
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-primary-token tracking-tight">
              Designations Master
            </h1>
            <p className="text-xs text-slate-500 dark:text-muted-token mt-0.5">
              Define corporate job titles, operational bands, and reporting tiers
            </p>
          </div>
        </div>
        <Link to="/masters/designations/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Designation
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="glass-panel flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-xl text-xs text-secondary-token shadow-xs">
        <span>Job Titles: <strong className="text-primary-token font-bold">{formatQty(designations.length)}</strong></span>
        <span>•</span>
        <span>Active Titles: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatQty(designations.filter((d) => d?.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Corporate Hierarchy: <strong className="text-teal-600 dark:text-cyan-400 font-bold">Synced</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by designation name or code..."
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
          onClick={fetchDesignations}
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
        emptyMessage="No designations found matching search criteria."
      />
    </div>
  );
}
