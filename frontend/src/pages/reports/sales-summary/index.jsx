import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Download,
  Calendar,
  Eye,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Select, Table, Badge, FilterBar } from "../../../components/ui";

export default function SalesSummaryReportPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [aggregates, setAggregates] = useState({
    totalOrders: 0,
    grossSales: 0,
    totalTax: 0,
    totalDiscount: 0,
    netSales: 0,
  });

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("sale", {
        limit: 500,
        sort: ["-sold_at"],
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      let filteredList = list;
      const now = new Date();

      if (period === "today") {
        const todayStr = now.toISOString().split("T")[0];
        filteredList = filteredList.filter((s) => s.sold_at?.startsWith(todayStr));
      } else if (period === "7days") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredList = filteredList.filter((s) => new Date(s.sold_at) >= weekAgo);
      } else if (period === "30days") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredList = filteredList.filter((s) => new Date(s.sold_at) >= monthAgo);
      }

      setSales(filteredList);

      const totalOrders = filteredList.length;
      const grossSales = filteredList.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
      const totalTax = filteredList.reduce((sum, s) => sum + (Number(s.tax_amount) || 0), 0);
      const totalDiscount = filteredList.reduce((sum, s) => sum + (Number(s.discount_amount) || 0), 0);
      const netSales = grossSales - totalTax;

      setAggregates({
        totalOrders,
        grossSales,
        totalTax,
        totalDiscount,
        netSales,
      });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load sales summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [period]);

  const handleResetFilters = () => {
    setSearch("");
    setPeriod("all");
    setStatusFilter("all");
  };

  const filtered = sales.filter((s) => {
    const matchesSearch =
      (s.sale_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.customer_name || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      s.status === statusFilter ||
      s.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = "Sale Number,Sold At,Customer,Status,Payment Status,Subtotal,Tax,Discount,Total\n";
    const rows = sales
      .map(
        (s) =>
          `"${s.sale_number}","${s.sold_at}","${s.customer_name || "Guest"}","${s.status}","${s.payment_status}",${s.subtotal},${s.tax_amount},${s.discount_amount},${s.total_amount}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales-summary-${period}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sales summary CSV exported!");
  };

  const columns = [
    {
      key: "sale_number",
      header: "Sale Order #",
      render: (val, row) => (
        <span className="font-semibold text-primary-token">{val || `SO-${row.id}`}</span>
      ),
    },
    {
      key: "sold_at",
      header: "Sold At",
      render: (val) => (
        <span className="text-secondary-token text-xs">
          {val ? new Date(val).toLocaleString() : "—"}
        </span>
      ),
    },
    {
      key: "customer_name",
      header: "Customer",
      render: (val) => (
        <span className="font-medium text-primary-token">{val || "Walk-in Guest"}</span>
      ),
    },
    {
      key: "subtotal",
      header: "Subtotal (₹)",
      align: "right",
      render: (val) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: "tax_amount",
      header: "GST Tax (₹)",
      align: "right",
      render: (val) => (
        <span className="font-mono text-emerald-700 dark:text-emerald-400">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "discount_amount",
      header: "Discount",
      align: "right",
      render: (val) => (
        <span className="font-mono text-rose-700 dark:text-rose-400">
          {Number(val) > 0 ? `-${formatCurrency(val)}` : "—"}
        </span>
      ),
    },
    {
      key: "total_amount",
      header: "Total (₹)",
      align: "right",
      render: (val) => (
        <span className="font-bold text-primary-token font-mono">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Details",
      align: "right",
      render: (_, row) => (
        <Link to={`/sales/details?id=${row.id}`}>
          <Button size="xs" variant="ghost" icon={Eye}>
            View
          </Button>
        </Link>
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
            Sales Summary Report
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Aggregated store revenue, GST tax collections, and transaction velocity
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
        <span>Orders: <strong className="text-primary-token font-medium">{formatQty(aggregates.totalOrders)}</strong></span>
        <span>•</span>
        <span>Gross Volume: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(aggregates.grossSales)}</strong></span>
        <span>•</span>
        <span>GST Collected: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatCurrency(aggregates.totalTax)}</strong></span>
        <span>•</span>
        <span>Discounts Given: <strong className="text-rose-700 dark:text-rose-400 font-medium">{formatCurrency(aggregates.totalDiscount)}</strong></span>
        <span>•</span>
        <span>Net Revenue: <strong className="text-primary-token font-medium">{formatCurrency(aggregates.netSales)}</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by sale order # or customer..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { label: "All-Time Cumulative", value: "all" },
                { label: "Today Only", value: "today" },
                { label: "Last 7 Days", value: "7days" },
                { label: "Last 30 Days", value: "30days" },
              ]}
            />
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Completed", value: "completed" },
                { label: "Paid", value: "Paid" },
                { label: "Pending", value: "pending" },
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
          onClick={fetchSalesData}
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
        emptyMessage="No sales recorded in the selected period."
      />
    </div>
  );
}
