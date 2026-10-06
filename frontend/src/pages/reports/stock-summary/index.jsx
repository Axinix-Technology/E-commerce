import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Select, Table, Badge, FilterBar } from "../../../components/ui";

export default function StockSummaryReportPage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const firstOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    total_products: 0,
    total_opening: 0,
    total_inward: 0,
    total_outward: 0,
    total_closing: 0,
    total_valuation: 0,
  });

  useEffect(() => {
    populateApi.read("category_master", { limit: 100, sort: ["name"] }).then((res) => {
      const list = Array.isArray(res) ? res : res?.data || [];
      setCategories(list);
    });
    populateApi.read("product_type", { limit: 200, sort: ["name"] }).then((res) => {
      const list = Array.isArray(res) ? res : res?.data || [];
      setProducts(list);
    });
  }, []);

  const fetchStockReport = async () => {
    setLoading(true);
    try {
      const res = await populateApi.report("stock_ledger", {
        filter: {
          start_date: startDate,
          end_date: endDate,
          category_id: categoryId || undefined,
          product_id: productId || undefined,
        },
      });

      if (res?.success) {
        setReportData(res.data || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      } else {
        const list = Array.isArray(res) ? res : res?.data || [];
        setReportData(list);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to generate stock summary report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockReport();
  }, [startDate, endDate, categoryId, productId]);

  const handleResetFilters = () => {
    setSearch("");
    setCategoryId("");
    setProductId("");
    setStartDate(firstOfMonthStr);
    setEndDate(todayStr);
  };

  const filtered = reportData.filter((r) =>
    (r.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.category_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    if (reportData.length === 0) {
      toast.error("No report data available to export.");
      return;
    }

    const headers = [
      "Product ID",
      "Product Name",
      "Category",
      "Opening Stock",
      "Inward (+)",
      "Outward (-)",
      "Closing Stock",
      "Avg Cost",
      "Valuation",
    ].join(",");

    const rows = reportData.map((r) =>
      [
        r.product_id,
        `"${r.product_name}"`,
        `"${r.category_name || "—"}"`,
        r.opening_stock || 0,
        r.inward_qty || 0,
        r.outward_qty || 0,
        r.closing_stock || 0,
        r.avg_cost || 0,
        r.valuation || 0,
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_summary_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Stock summary CSV exported!");
  };

  const columns = [
    {
      key: "product_name",
      header: "Product / Style",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val}</span>
          <span className="text-[10px] text-muted-token">{row.category_name || "Apparel"}</span>
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
      key: "inward_qty",
      header: "Inward (GRN)",
      align: "center",
      render: (val) => (
        <span className="font-mono text-emerald-700 dark:text-emerald-400">
          +{formatQty(val)}
        </span>
      ),
    },
    {
      key: "outward_qty",
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
      header: "Closing Balance",
      align: "center",
      render: (val) => (
        <Badge variant={val > 10 ? "emerald" : val > 0 ? "amber" : "neutral"} dot>
          {formatQty(val)} Pcs
        </Badge>
      ),
    },
    {
      key: "valuation",
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
            <BarChart3 className="w-5 h-5 text-brand-token" />
            Stock Ledger & Periodic Summary
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Audit inventory throughput, gross opening/closing balances, and net inventory valuations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Opening Stock: <strong className="text-primary-token font-medium">{formatQty(summary.total_opening)}</strong></span>
        <span>•</span>
        <span>Total Inward: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">+{formatQty(summary.total_inward)}</strong></span>
        <span>•</span>
        <span>Total Outward: <strong className="text-rose-700 dark:text-rose-400 font-medium">-{formatQty(summary.total_outward)}</strong></span>
        <span>•</span>
        <span>Closing Stock: <strong className="text-primary-token font-semibold">{formatQty(summary.total_closing)}</strong></span>
        <span>•</span>
        <span>Total Valuation: <strong className="text-brand-token font-bold">{formatCurrency(summary.total_valuation)}</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search product or category..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="All Categories"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Select
              size="xs"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="All Products"
              options={products.map((p) => ({ value: p.id, label: p.name }))}
            />
          </>
        }
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchStockReport}
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
        emptyMessage="No inventory throughput data available for selected criteria."
      />
    </div>
  );
}
