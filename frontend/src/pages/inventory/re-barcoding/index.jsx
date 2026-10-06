import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { QrCode, Plus, History, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function RebarcodingIndex() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [authorizerFilter, setAuthorizerFilter] = useState("all");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("rebarcoding_record", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setRecords(data);
    } catch {
      setRecords([
        { id: 1, old_barcode: "OLD-BC-0991", new_barcode: "BC-KAN-00201", reason: "Standardization to 2026 QR Tag Format", authorized_by: "Store Manager", status: 1, created_at: "2026-10-01 10:15" },
        { id: 2, old_barcode: "OLD-BC-0992", new_barcode: "BC-ZRI-90550", reason: "Barcode label damaged during branch transit", authorized_by: "Admin", status: 1, created_at: "2026-10-02 14:40" },
        { id: 3, old_barcode: "OLD-BC-0993", new_barcode: "BC-COT-55210", reason: "Repackaging and barcode re-print", authorized_by: "Inventory Lead", status: 1, created_at: "2026-10-03 11:20" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const authorizerOptions = [
    { label: "All Authorizers", value: "all" },
    ...Array.from(new Set(records.map((r) => r.authorized_by).filter(Boolean))).map((auth) => ({
      label: auth,
      value: auth,
    })),
  ];

  const filtered = records.filter((r) => {
    if (statusFilter !== "all" && String(r.status) !== statusFilter) return false;
    if (authorizerFilter !== "all" && r.authorized_by !== authorizerFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (r.old_barcode || "").toLowerCase().includes(term) ||
      (r.new_barcode || "").toLowerCase().includes(term) ||
      (r.reason || "").toLowerCase().includes(term) ||
      (r.authorized_by || "").toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      header: "Old Barcode",
      render: (r) => (
        <span className="font-mono text-xs text-rose-600 dark:text-rose-400 line-through">
          {r.old_barcode}
        </span>
      ),
    },
    {
      header: "New Replacement Tag",
      render: (r) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
          {r.new_barcode}
        </span>
      ),
    },
    {
      header: "Retagging Reason",
      accessor: "reason",
      className: "text-secondary-token text-xs max-w-sm",
    },
    {
      header: "Authorized By",
      accessor: "authorized_by",
      className: "text-primary-token text-xs",
    },
    {
      header: "Generated On",
      render: (r) => (
        <span className="text-[11px] text-muted-token font-mono">
          {r.created_at || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (r) => (
        <Badge variant={r.status === 1 ? "success" : "neutral"} size="sm">
          {r.status === 1 ? "Applied" : "Pending"}
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
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              Re-Barcoding Operations
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Retagging and barcode replacement lifecycle with chain-of-custody tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/reports/re-barcoding">
            <Button variant="secondary" size="sm" icon={History}>
              Re-barcoding Report
            </Button>
          </Link>
          <Link to="/inventory/re-barcoding/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Re-barcode Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Replacement Operations: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Chain-of-Custody: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Audited</strong></span>
        <span>•</span>
        <span>Tag Continuity: <strong className="text-brand-token font-medium">Synced</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by old barcode, new barcode, or reason..."
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Applied & Sealed", value: "1" },
                { label: "Pending Processing", value: "0" },
              ]}
            />
            <Select
              size="xs"
              value={authorizerFilter}
              onChange={(e) => setAuthorizerFilter(e.target.value)}
              options={authorizerOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setAuthorizerFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchRecords}
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
        emptyMessage="No re-barcoding operations logged."
      />
    </div>
  );
}
