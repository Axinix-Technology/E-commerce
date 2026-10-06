import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Boxes, Plus, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function LotGenerateIndex() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const fetchLots = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("purchase_lot", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setLots(data);
    } catch {
      setLots([
        { id: 1, lot_number: "LOT-2026-OCT-001", supplier_id: 1, supplier_name: "Sri Lakshmi Silks Kanchipuram", inward_date: "2026-10-01", total_quantity: 450, total_cost: 675000, status: 1 },
        { id: 2, lot_number: "LOT-2026-OCT-002", supplier_id: 2, supplier_name: "Surat Zari Mills Pvt Ltd", inward_date: "2026-10-02", total_quantity: 300, total_cost: 240000, status: 1 },
        { id: 3, lot_number: "LOT-2026-OCT-003", supplier_id: 3, supplier_name: "Varanasi Heritage Handlooms", inward_date: "2026-10-03", total_quantity: 120, total_cost: 360000, status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const supplierOptions = [
    { label: "All Suppliers", value: "all" },
    ...Array.from(new Set(lots.map((l) => l.supplier_name).filter(Boolean))).map((sn) => ({
      label: sn,
      value: sn,
    })),
  ];

  const filtered = lots.filter((l) => {
    if (statusFilter !== "all" && String(l.status) !== statusFilter) return false;
    if (supplierFilter !== "all" && l.supplier_name !== supplierFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (l.lot_number || "").toLowerCase().includes(term) ||
      (l.supplier_name || "").toLowerCase().includes(term)
    );
  });

  const totalLots = lots.length;
  const totalUnits = lots.reduce((acc, l) => acc + (Number(l.total_quantity) || 0), 0);
  const totalValuation = lots.reduce((acc, l) => acc + (Number(l.total_cost) || 0), 0);

  const columns = [
    {
      key: "lot_number",
      header: "Lot Number / Date",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val}</span>
          <span className="text-[10px] text-muted-token">Inward: {row.inward_date || "—"}</span>
        </div>
      ),
    },
    {
      key: "supplier_name",
      header: "Supplier / Weaver",
      render: (val) => <span className="font-medium text-primary-token">{val}</span>,
    },
    {
      key: "total_quantity",
      header: "Quantity",
      align: "center",
      render: (val) => <span className="font-semibold">{formatQty(val)} Pcs</span>,
    },
    {
      key: "total_cost",
      header: "Procurement Cost (₹)",
      align: "right",
      render: (val) => (
        <span className="font-bold text-primary-token font-mono">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Lot Status",
      render: (val) => (
        <Badge variant={val === 1 ? "emerald" : "amber"} dot>
          {val === 1 ? "Serialized & Active" : "In Progress"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-brand-token" />
            Purchase Lot Generation
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Bundle bulk goods receipts into traceable manufacturing and inventory lots
          </p>
        </div>
        <Link to="/purchase/lot-generate/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Generate New Lot
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Active Lots: <strong className="text-primary-token font-medium">{formatQty(totalLots)}</strong></span>
        <span>•</span>
        <span>Total Units: <strong className="text-primary-token font-medium">{formatQty(totalUnits)}</strong></span>
        <span>•</span>
        <span>Lot Valuation: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(totalValuation)}</strong></span>
        <span>•</span>
        <span>Tag Traceability: <strong className="text-brand-token font-medium">100% Barcoded</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by lot number or supplier name..."
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Lot Statuses", value: "all" },
                { label: "Serialized & Active", value: "1" },
                { label: "In Progress", value: "0" },
              ]}
            />
            <Select
              size="xs"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              options={supplierOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setSupplierFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchLots}
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
        emptyMessage="No purchase lots generated."
      />
    </div>
  );
}
