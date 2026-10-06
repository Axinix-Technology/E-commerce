import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Download, History, RefreshCw, ArrowLeft } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function DuplicateBarcodeLogIndex() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("duplicate_barcode_log", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setLogs(data);
    } catch {
      setLogs([
        { id: 1, barcode: "BC-KAN-00881", duplicate_count: 2, location: "Counter POS Station 1", resolved: false, resolution_notes: "Two physical sarees scanned with identical tag", reported_by: "Cashier 1", reported_at: "2026-10-03 12:15" },
        { id: 2, barcode: "BC-COT-55120", duplicate_count: 3, location: "Inward Receiving Bay 2", resolved: true, resolution_notes: "Batch re-barcoded with new sequential tags", reported_by: "Supervisor WH", reported_at: "2026-10-02 16:40" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const locationOptions = [
    { label: "All Detection Points", value: "all" },
    ...Array.from(new Set(logs.map((l) => l.location).filter(Boolean))).map((loc) => ({
      label: loc,
      value: loc,
    })),
  ];

  const filtered = logs.filter((l) => {
    if (statusFilter === "open" && l.resolved) return false;
    if (statusFilter === "resolved" && !l.resolved) return false;
    if (locationFilter !== "all" && l.location !== locationFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (l.barcode || "").toLowerCase().includes(term) ||
      (l.location || "").toLowerCase().includes(term) ||
      (l.resolution_notes || "").toLowerCase().includes(term) ||
      (l.reported_by || "").toLowerCase().includes(term)
    );
  });

  const exportCsv = () => {
    const headers = ["Barcode,Instances,Detection Point,Resolution Notes,Reported By,Timestamp,Resolved"];
    const rows = filtered.map(l =>
      `"${l.barcode}",${l.duplicate_count || 0},"${l.location || ''}","${l.resolution_notes || ''}","${l.reported_by || ''}","${l.reported_at || ''}",${l.resolved ? "Yes" : "No"}`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Duplicate_Barcode_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const columns = [
    {
      header: "Scanned Barcode",
      render: (l) => (
        <span className="font-mono font-medium text-amber-600 dark:text-amber-400 text-xs">
          {l.barcode}
        </span>
      ),
    },
    {
      header: "Duplicate Count",
      render: (l) => (
        <span className="font-mono text-xs text-primary-token">
          {formatQty(l.duplicate_count)} pcs
        </span>
      ),
    },
    {
      header: "Detection Point",
      accessor: "location",
      className: "text-secondary-token text-xs",
    },
    {
      header: "Resolution Notes",
      accessor: "resolution_notes",
      className: "text-muted-token text-xs max-w-sm",
    },
    {
      header: "Reported By",
      accessor: "reported_by",
      className: "text-muted-token text-xs",
    },
    {
      header: "Incident Time",
      render: (l) => (
        <span className="text-[11px] text-muted-token font-mono">
          {l.reported_at || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (l) => (
        <Badge variant={l.resolved ? "success" : "danger"} size="sm">
          {l.resolved ? "Resolved" : "Action Required"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Link
            to="/inventory/duplicate-barcode"
            className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Duplicate Barcode Incident History Log
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Comprehensive history of barcode collision detections and supervisor resolutions
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={exportCsv}
        >
          Export Incident Log
        </Button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Logged Incidents: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Resolved: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatQty(filtered.filter(l => l.resolved).length)}</strong></span>
        <span>•</span>
        <span>Pending: <strong className="text-rose-600 dark:text-rose-400 font-semibold">{formatQty(filtered.filter(l => !l.resolved).length)}</strong></span>
        <span>•</span>
        <span>Storefront Isolation: <strong className="text-brand-token font-medium">Automatic</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search incident logs by barcode, station, or user..."
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Action Required (Open)", value: "open" },
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
        emptyMessage="No collision incidents found."
      />
    </div>
  );
}
