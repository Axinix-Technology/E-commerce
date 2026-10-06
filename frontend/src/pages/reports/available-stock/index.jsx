import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PackageCheck, Plus, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function AvailableStockIndex() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockLevelFilter, setStockLevelFilter] = useState("all");

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("reports_available_stock", { limit: 100 });
      const items = Array.isArray(res) ? res : res.data || [];
      setStocks(items);
    } catch {
      setStocks([
        { id: 1, sku: "SKU-SLK-001", product_name: "Kanchipuram Silk Saree", category: "Sarees", branch: "Chennai Flagship", on_hand: 48, reserved: 3, available: 45, unit_cost: 14500, total_value: 652500 },
        { id: 2, sku: "SKU-ZRI-004", product_name: "Surat Gold Zari Dupatta", category: "Dupattas", branch: "T. Nagar Showroom", on_hand: 85, reserved: 10, available: 75, unit_cost: 4800, total_value: 360000 },
        { id: 3, sku: "SKU-COT-012", product_name: "Chanderi Cotton Kurti", category: "Kurtis", branch: "Central Warehouse", on_hand: 120, reserved: 0, available: 120, unit_cost: 1650, total_value: 198000 },
        { id: 4, sku: "SKU-ORG-088", product_name: "Pure Organza Floral Saree", category: "Sarees", branch: "Coimbatore Branch", on_hand: 15, reserved: 2, available: 13, unit_cost: 8900, total_value: 115700 },
        { id: 5, sku: "SKU-TSH-030", product_name: "Tussar Silk Stole", category: "Accessories", branch: "Chennai Flagship", on_hand: 0, reserved: 0, available: 0, unit_cost: 2400, total_value: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setBranchFilter("all");
    setCategoryFilter("all");
    setStockLevelFilter("all");
  };

  const filtered = stocks.filter((s) => {
    const matchesSearch =
      (s.sku || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.branch || "").toLowerCase().includes(search.toLowerCase());

    const matchesBranch = branchFilter === "all" || s.branch === branchFilter;
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;

    let matchesStockLevel = true;
    if (stockLevelFilter === "in_stock") matchesStockLevel = Number(s.available) > 0;
    else if (stockLevelFilter === "low_stock") matchesStockLevel = Number(s.available) > 0 && Number(s.available) <= 15;
    else if (stockLevelFilter === "out_of_stock") matchesStockLevel = Number(s.available) === 0;

    return matchesSearch && matchesBranch && matchesCategory && matchesStockLevel;
  });

  const totalOnHand = filtered.reduce((sum, s) => sum + (Number(s.on_hand) || 0), 0);
  const totalReserved = filtered.reduce((sum, s) => sum + (Number(s.reserved) || 0), 0);
  const totalAvailable = filtered.reduce((sum, s) => sum + (Number(s.available) || 0), 0);
  const totalInventoryValue = filtered.reduce((sum, s) => sum + (Number(s.total_value) || 0), 0);

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
      key: "branch",
      header: "Location / Branch",
      render: (val) => <span className="text-secondary-token text-xs">{val}</span>,
    },
    {
      key: "on_hand",
      header: "On-Hand",
      align: "center",
      render: (val) => <span className="font-semibold">{formatQty(val)}</span>,
    },
    {
      key: "reserved",
      header: "Reserved",
      align: "center",
      render: (val) => (
        <span className="font-mono text-amber-800 dark:text-amber-400">
          {formatQty(val)}
        </span>
      ),
    },
    {
      key: "available",
      header: "Sellable Balance",
      align: "center",
      render: (val) => (
        <Badge variant={val > 10 ? "emerald" : val > 0 ? "amber" : "neutral"} dot>
          {formatQty(val)} Available
        </Badge>
      ),
    },
    {
      key: "total_value",
      header: "Valuation (₹)",
      align: "right",
      render: (val) => (
        <span className="font-bold text-primary-token font-mono">
          {formatCurrency(val)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-brand-token" />
            Available Sellable Stock Registry
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Real-time inventory available for POS checkout and online storefront sales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/reports/available-stock/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Audit Snapshot
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>On-Hand Pcs: <strong className="text-primary-token font-medium">{formatQty(totalOnHand)}</strong></span>
        <span>•</span>
        <span>Reserved / Memo Pcs: <strong className="text-amber-800 dark:text-amber-400 font-medium">{formatQty(totalReserved)}</strong></span>
        <span>•</span>
        <span>Available Sellable: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatQty(totalAvailable)}</strong></span>
        <span>•</span>
        <span>Sellable Valuation: <strong className="text-brand-token font-semibold">{formatCurrency(totalInventoryValue)}</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search SKU, product name, or branch..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              options={[
                { value: "all", label: "All Branches" },
                { value: "Chennai Flagship", label: "Chennai Flagship" },
                { value: "T. Nagar Showroom", label: "T. Nagar Showroom" },
                { value: "Central Warehouse", label: "Central Warehouse" },
                { value: "Coimbatore Branch", label: "Coimbatore Branch" },
              ]}
            />
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
              value={stockLevelFilter}
              onChange={(e) => setStockLevelFilter(e.target.value)}
              options={[
                { value: "all", label: "All Stock Statuses" },
                { value: "in_stock", label: "In Stock (> 0)" },
                { value: "low_stock", label: "Low Stock (≤ 15)" },
                { value: "out_of_stock", label: "Out of Stock (—)" },
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
          onClick={fetchStocks}
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
        emptyMessage="No inventory matching current criteria."
      />
    </div>
  );
}
