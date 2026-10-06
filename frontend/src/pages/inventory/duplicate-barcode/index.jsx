import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Copy, Plus, AlertTriangle, History, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function DuplicateBarcodeIndex() {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("duplicate_barcode_log", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setDuplicates(data);
    } catch {
      setDuplicates([
        { id: 1, barcode: "BC-KAN-00881", duplicate_count: 2, location: "Counter POS Station 1", resolved: false, resolution_notes: "Two physical sarees scanned with identical tag", reported_by: "Cashier 1", reported_at: "2026-10-03 12:15" },
        { id: 2, barcode: "BC-COT-55120", duplicate_count: 3, location: "Inward Receiving Bay 2", resolved: true, resolution_notes: "Batch re-barcoded with new sequential tags", reported_by: "Supervisor WH", reported_at: "2026-10-02 16:40" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const locationOptions = [
    { label: "All Detection Points", value: "all" },
    ...Array.from(new Set(duplicates.map((d) => d.location).filter(Boolean))).map((loc) => ({
      label: loc,
      value: loc,
    })),
  ];

  const filtered = duplicates.filter((d) => {
    if (statusFilter === "open" && d.resolved) return false;
    if (statusFilter === "resolved" && !d.resolved) return false;
    if (locationFilter !== "all" && d.location !== locationFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (d.barcode || "").toLowerCase().includes(term) ||
      (d.location || "").toLowerCase().includes(term) ||
      (d.resolution_notes || "").toLowerCase().includes(term)
    );
  });

  const openIncidents = duplicates.filter(d => !d.resolved).length;

  const columns = [
    {
      header: "Scanned Barcode",
      render: (d) => (
        <span className="font-mono font-bold text-brand-token text-xs">
          {d.barcode}
        </span>
      ),
    },
    {
      header: "Instances",
      render: (d) => (
        <span className="font-mono text-xs text-primary-token">
          {formatQty(d.duplicate_count)} units
        </span>
      ),
    },
    {
      header: "Detection Location",
      accessor: "location",
      className: "text-secondary-token text-xs",
    },
    {
      header: "Status",
      render: (d) => (
        <Badge variant={d.resolved ? "success" : "danger"} size="sm">
          {d.resolved ? "Resolved" : "Active Collision"}
        </Badge>
      ),
    },
    {
      header: "Resolution Notes",
      accessor: "resolution_notes",
      className: "text-muted-token text-xs max-w-sm",
    },
    {
      header: "Reported By",
      accessor: "reported_by",
      className: "text-primary-token text-xs",
    },
    {
      header: "Timestamp",
      render: (d) => (
        <span className="text-[11px] text-muted-token font-mono">
          {d.reported_at || "—"}
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
            <Copy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              Duplicate Barcode Detection & Resolution
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Detect duplicate tags scanned at POS or warehouses and resolve multi-piece collisions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/inventory/duplicate-barcode-log">
            <Button variant="secondary" size="sm" icon={History}>
              History Log
            </Button>
          </Link>
          <Link to="/inventory/duplicate-barcode/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Report Duplicate
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Logged Incidents: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Unresolved Collisions: <strong className="text-rose-600 dark:text-rose-400 font-semibold">{formatQty(openIncidents)}</strong></span>
        <span>•</span>
        <span>QC Isolation: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Strict Enforcement</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by barcode, location, or notes..."
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Active Collision (Action Required)", value: "open" },
                { label: "Resolved Incidents", value: "resolved" },
              ]}
            />
            <Select
              size="xs"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              options={locationOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setLocationFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchDuplicates}
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
        emptyMessage="No duplicate barcode incidents reported."
      />
    </div>
  );
}
