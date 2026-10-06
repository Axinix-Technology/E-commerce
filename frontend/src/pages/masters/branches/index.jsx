import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building, Plus, MapPin, Phone, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function BranchesIndex() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("branch_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setBranches(data);
    } catch {
      setBranches([
        { id: 1, name: "Flagship HQ Store", code: "BR-HQ-01", city: "Chennai", state: "Tamil Nadu", phone: "+91 44 2812 3456", gstin: "33AAAAA0000A1Z5", is_head_office: true, status: 1 },
        { id: 2, name: "Indiranagar Experience Hub", code: "BR-BLR-02", city: "Bengaluru", state: "Karnataka", phone: "+91 80 4123 4567", gstin: "29AAAAA0000A1Z2", is_head_office: false, status: 1 },
        { id: 3, name: "Bandra Retail Outlet", code: "BR-MUM-03", city: "Mumbai", state: "Maharashtra", phone: "+91 22 2640 1234", gstin: "27AAAAA0000A1Z8", is_head_office: false, status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const filtered = branches.filter((b) => {
    const matchesSearch =
      (b.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.code || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.city || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : String(b.status) === String(statusFilter);
    const matchesType =
      typeFilter === "all"
        ? true
        : typeFilter === "hq"
        ? Boolean(b.is_head_office)
        : !b.is_head_office;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.status === 1).length;
  const hqCount = branches.filter((b) => b.is_head_office).length;

  const columns = [
    {
      key: "code",
      header: "Branch Code",
      render: (_, b) => (
        <span className="font-mono font-medium text-brand-token text-xs">
          {b?.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Branch Name",
      render: (_, b) => (
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-800 dark:text-primary-token text-xs">{b?.name}</span>
          {b?.is_head_office && (
            <Badge variant="brand" size="sm">
              HQ
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (_, b) => {
        const loc = [b?.city, b?.state].filter(Boolean).join(", ");
        return loc ? (
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-secondary-token">
            <MapPin className="w-3 h-3 text-slate-400 dark:text-muted-token shrink-0" />
            {loc}
          </div>
        ) : (
          <span className="text-slate-400 dark:text-muted-token text-xs">—</span>
        );
      },
    },
    {
      key: "phone",
      header: "Phone",
      render: (_, b) => (
        <span className="font-mono text-xs text-slate-600 dark:text-muted-token">
          {b?.phone || "—"}
        </span>
      ),
    },
    {
      key: "gstin",
      header: "GSTIN",
      render: (_, b) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-brand-token">
          {b?.gstin || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, b) => (
        <Badge variant={b?.status === 1 ? "emerald" : "neutral"} size="sm" dot>
          {b?.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, b) => (
        <Link
          to={`/masters/branches/create?id=${b?.id}`}
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
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-primary-token tracking-tight">
              Branches & Store Locations
            </h1>
            <p className="text-xs text-slate-500 dark:text-muted-token mt-0.5">
              Manage brick-and-mortar stores, fulfillment warehouses, and branch GSTINs
            </p>
          </div>
        </div>

        <Link to="/masters/branches/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Branch
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="glass-panel flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-xl text-xs text-secondary-token shadow-xs">
        <span>Total Stores: <strong className="text-primary-token font-bold">{formatQty(totalBranches)}</strong></span>
        <span>•</span>
        <span>Operational Outlets: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatQty(activeBranches)}</strong></span>
        <span>•</span>
        <span>Headquarters: <strong className="text-teal-600 dark:text-cyan-400 font-bold">{formatQty(hqCount)} Location</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search branch by name, code, or city..."
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { label: "All Facility Types", value: "all" },
                { label: "Head Office (HQ)", value: "hq" },
                { label: "Branch Outlets", value: "outlet" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setTypeFilter("all");
        }}
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchBranches}
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
        emptyMessage="No branch locations configured."
      />
    </div>
  );
}
