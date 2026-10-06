import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Barcode, Plus, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function LotVsBarcodeIndex() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("reports_lot_vs_barcode", { limit: 100 });
      const items = Array.isArray(res) ? res : res.data || [];
      setData(items);
    } catch {
      setData([
        { id: 1, lot_number: "LOT-2026-001", supplier_name: "Sri Lakshmi Silks Weaving", sku: "SKU-SLK-001", lot_quantity: 100, barcoded_qty: 100, pending_tagging: 0, status: "Fully Barcoded", created_at: "2026-10-01" },
        { id: 2, lot_number: "LOT-2026-002", supplier_name: "Surat Brocade Hub", sku: "SKU-ZRI-004", lot_quantity: 150, barcoded_qty: 140, pending_tagging: 10, status: "Partially Barcoded", created_at: "2026-10-02" },
        { id: 3, lot_number: "LOT-2026-003", supplier_name: "Jaipur Handloom Mills", sku: "SKU-COT-012", lot_quantity: 80, barcoded_qty: 80, pending_tagging: 0, status: "Fully Barcoded", created_at: "2026-10-02" },
        { id: 4, lot_number: "LOT-2026-004", supplier_name: "Kolkata Fine Linens", sku: "SKU-ORG-088", lot_quantity: 50, barcoded_qty: 0, pending_tagging: 50, status: "Pending Tagging", created_at: "2026-10-03" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSupplierFilter("all");
  };

  const filtered = data.filter((d) => {
    const matchesSearch =
      (d.lot_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.supplier_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.sku || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    const matchesSupplier = supplierFilter === "all" || d.supplier_name === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const totalLotQty = filtered.reduce((sum, d) => sum + (Number(d.lot_quantity) || 0), 0);
  const totalBarcoded = filtered.reduce((sum, d) => sum + (Number(d.barcoded_qty) || 0), 0);
  const totalPending = filtered.reduce((sum, d) => sum + (Number(d.pending_tagging) || 0), 0);

  const columns = [
    {
      key: "lot_number",
      header: "Lot # / Received Date",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val}</span>
          <span className="text-[10px] text-muted-token">{row.created_at || "—"}</span>
        </div>
      ),
    },
    {
      key: "supplier_name",
      header: "Procurement Vendor",
      render: (val) => <span className="font-medium text-primary-token">{val}</span>,
    },
    {
      key: "sku",
      header: "Target SKU",
      render: (val) => <span className="font-mono text-xs text-brand-token font-semibold">{val}</span>,
    },
    {
      key: "lot_quantity",
      header: "Lot Expected",
      align: "center",
      render: (val) => <span className="font-semibold">{formatQty(val)} Pcs</span>,
    },
    {
      key: "barcoded_qty",
      header: "Barcoded",
      align: "center",
      render: (val) => (
        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
          {formatQty(val)}
        </span>
      ),
    },
    {
      key: "pending_tagging",
      header: "Pending Tagging",
      align: "center",
      render: (val) => (
        <span className={`font-mono ${Number(val) > 0 ? "text-rose-700 dark:text-rose-400 font-bold" : "text-muted-token"}`}>
          {formatQty(val)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Tagging Status",
      render: (val) => {
        const isFull = val === "Fully Barcoded";
        const isPartial = val === "Partially Barcoded";
        return (
          <Badge variant={isFull ? "emerald" : isPartial ? "amber" : "rose"} dot>
            {val}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Barcode className="w-5 h-5 text-brand-token" />
            Lot vs Barcode Tagging Reconciliation
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Audit received procurement lots against serialized physical unit barcodes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/reports/lot-vs-barcode/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Snapshot
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Procured Lots: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Lot Units Expected: <strong className="text-primary-token font-medium">{formatQty(totalLotQty)}</strong></span>
        <span>•</span>
        <span>Barcoded & Tagged: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatQty(totalBarcoded)}</strong></span>
        <span>•</span>
        <span>Pending Tagging: <strong className="text-rose-700 dark:text-rose-400 font-medium">{formatQty(totalPending)}</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by lot number, supplier, or SKU..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Tagging Statuses" },
                { value: "Fully Barcoded", label: "Fully Barcoded" },
                { value: "Partially Barcoded", label: "Partially Barcoded" },
                { value: "Pending Tagging", label: "Pending Tagging" },
              ]}
            />
            <Select
              size="xs"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              options={[
                { value: "all", label: "All Procurement Vendors" },
                { value: "Sri Lakshmi Silks Weaving", label: "Sri Lakshmi Silks Weaving" },
                { value: "Surat Brocade Hub", label: "Surat Brocade Hub" },
                { value: "Jaipur Handloom Mills", label: "Jaipur Handloom Mills" },
                { value: "Kolkata Fine Linens", label: "Kolkata Fine Linens" },
              ]}
            />
          </>
        }
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchData}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Reusable Data Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No lot tagging records found matching criteria."
      />
    </div>
  );
}
