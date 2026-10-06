import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRightLeft, Plus, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function StockInOutIndex() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [movementFilter, setMovementFilter] = useState("all");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("reports_stock_in_out", { limit: 100 });
      const items = Array.isArray(res) ? res : res.data || [];
      setRecords(items);
    } catch {
      setRecords([
        { id: 1, sku: "SKU-SLK-001", product_name: "Kanchipuram Silk Saree", category: "Sarees", opening_stock: 50, inward_grn: 20, inward_return: 2, outward_sale: 23, outward_return: 1, closing_stock: 48 },
        { id: 2, sku: "SKU-ZRI-004", product_name: "Surat Gold Zari Dupatta", category: "Dupattas", opening_stock: 90, inward_grn: 15, inward_return: 0, outward_sale: 20, outward_return: 0, closing_stock: 85 },
        { id: 3, sku: "SKU-COT-012", product_name: "Chanderi Cotton Kurti", category: "Kurtis", opening_stock: 80, inward_grn: 60, inward_return: 0, outward_sale: 20, outward_return: 0, closing_stock: 120 },
        { id: 4, sku: "SKU-ORG-088", product_name: "Pure Organza Floral Saree", category: "Sarees", opening_stock: 20, inward_grn: 0, inward_return: 1, outward_sale: 6, outward_return: 0, closing_stock: 15 },
        { id: 5, sku: "SKU-TSH-030", product_name: "Tussar Silk Stole", category: "Accessories", opening_stock: 0, inward_grn: 0, inward_return: 0, outward_sale: 0, outward_return: 0, closing_stock: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setMovementFilter("all");
  };

  const filtered = records.filter((r) => {
    const matchesSearch =
      (r.sku || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.category || "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;

    let matchesMovement = true;
    if (movementFilter === "active_inward") matchesMovement = Number(r.inward_grn) > 0;
    else if (movementFilter === "active_outward") matchesMovement = Number(r.outward_sale) > 0;
    else if (movementFilter === "zero_movement") matchesMovement = Number(r.inward_grn) === 0 && Number(r.outward_sale) === 0;

    return matchesSearch && matchesCategory && matchesMovement;
  });

  const totalOpening = filtered.reduce((sum, r) => sum + (Number(r.opening_stock) || 0), 0);
  const totalInward = filtered.reduce((sum, r) => sum + ((Number(r.inward_grn) || 0) + (Number(r.inward_return) || 0)), 0);
  const totalOutward = filtered.reduce((sum, r) => sum + ((Number(r.outward_sale) || 0) + (Number(r.outward_return) || 0)), 0);
  const totalClosing = filtered.reduce((sum, r) => sum + (Number(r.closing_stock) || 0), 0);

  const columns = [
    {
      key: "sku",
      header: "SKU Code",
      render: (val) => <span className="font-mono text-xs text-brand-token font-semibold">{val}</span>,
    },
    {
      key: "product_name",
      header: "Product / Description",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val}</span>
          <span className="text-[10px] text-muted-token">{row.category}</span>
        </div>
      ),
    },
    {
      key: "opening_stock",
      header: "Opening Balance",
      align: "center",
      render: (val) => <span className="font-mono text-secondary-token">{formatQty(val)}</span>,
    },
    {
      key: "inward_grn",
      header: "Inward (GRN)",
      align: "center",
      render: (val) => (
        <span className="font-mono text-emerald-700 dark:text-emerald-400">
          +{formatQty(val)}
        </span>
      ),
    },
    {
      key: "outward_sale",
      header: "Outward (Sales)",
      align: "center",
      render: (val) => (
        <span className="font-mono text-rose-700 dark:text-rose-400">
          -{formatQty(val)}
        </span>
      ),
    },
    {
      key: "closing_stock",
      header: "Closing Stock",
      align: "center",
      render: (val) => (
        <Badge variant={val > 10 ? "emerald" : val > 0 ? "amber" : "neutral"} dot>
          {formatQty(val)} Pcs
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
            <ArrowRightLeft className="w-5 h-5 text-brand-token" />
            Stock In / Out Movement Ledger
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Track volumetric goods inflow from vendors versus outflow to customers and branch transfers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/reports/stock-in-out/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Reconciliation
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Opening Stock: <strong className="text-primary-token font-medium">{formatQty(totalOpening)}</strong></span>
        <span>•</span>
        <span>Total Inward: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">+{formatQty(totalInward)}</strong></span>
        <span>•</span>
        <span>Total Outward: <strong className="text-rose-700 dark:text-rose-400 font-medium">-{formatQty(totalOutward)}</strong></span>
        <span>•</span>
        <span>Closing Stock: <strong className="text-brand-token font-semibold">{formatQty(totalClosing)}</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by SKU, product name, or category..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: "all", label: "All Categories" },
                { value: "Sarees", label: "Sarees" },
                { value: "Dupattas", label: "Dupattas" },
                { value: "Kurtis", label: "Kurtis" },
                { value: "Accessories", label: "Accessories" },
              ]}
            />
            <Select
              size="xs"
              value={movementFilter}
              onChange={(e) => setMovementFilter(e.target.value)}
              options={[
                { value: "all", label: "All Movements" },
                { value: "active_inward", label: "Inward Intake (> 0)" },
                { value: "active_outward", label: "Outward Sales (> 0)" },
                { value: "zero_movement", label: "Zero Movement (Dormant)" },
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
          onClick={fetchRecords}
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
        emptyMessage="No stock movements matching your criteria."
      />
    </div>
  );
}
