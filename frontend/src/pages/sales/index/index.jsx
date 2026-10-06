import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  Eye,
  RotateCcw,
  Receipt,
  CreditCard,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Input, Select, Table, Badge, FilterBar } from "../../../components/ui";

export default function SalesOrderListPage() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Metrics for single-line summary bar (Rule 2)
  const [metrics, setMetrics] = useState({
    totalSalesVal: 0,
    completedCount: 0,
    paidCount: 0,
    draftCount: 0,
  });

  const fetchSales = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["sale_number.icontains"] = search.trim();
      }
      if (statusFilter !== "all") {
        filter["status"] = statusFilter;
      }
      if (paymentFilter !== "all") {
        filter["payment_status"] = paymentFilter;
      }
      if (methodFilter !== "all") {
        filter["payment_method"] = methodFilter;
      }

      const res = await populateApi.read("sale", {
        filter,
        page,
        limit: 15,
        populate: {
          customer: ["id", "name", "phone", "email"],
        },
        sort: ["-sold_at"],
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      setSales(list);
      setTotalCount(res?.count || list.length);
      setTotalPages(res?.metadata?.total_pages || Math.ceil(list.length / 15) || 1);

      // Summary metrics
      const totalVal = list.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
      const completed = list.filter((s) => s.status === "completed").length;
      const paid = list.filter((s) => s.payment_status === "paid").length;
      const draft = list.filter((s) => s.status === "draft").length;

      setMetrics({
        totalSalesVal: totalVal,
        completedCount: completed,
        paidCount: paid,
        draftCount: draft,
      });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load sales orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, search, statusFilter, paymentFilter, methodFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setMethodFilter("all");
    setPage(1);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge variant="emerald" dot>Completed</Badge>;
      case "cancelled":
        return <Badge variant="rose" dot>Cancelled</Badge>;
      default:
        return <Badge variant="amber" dot>Draft</Badge>;
    }
  };

  const renderPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge variant="emerald">Paid</Badge>;
      case "partially_paid":
        return <Badge variant="blue">Partial</Badge>;
      default:
        return <Badge variant="amber">Pending</Badge>;
    }
  };

  const columns = [
    {
      key: "sale_number",
      header: "Invoice / Order #",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val || `SO-${row.id}`}</span>
          <span className="text-[10px] text-muted-token">
            {row.sold_at ? new Date(row.sold_at).toLocaleString() : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary-token">
            {row.customer?.name || row.customer_name || "Walk-in Guest"}
          </span>
          <span className="text-[10px] text-muted-token">
            {row.customer?.phone || row.customer_phone || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "payment_method",
      header: "Payment",
      render: (val, row) => (
        <div className="flex items-center gap-2">
          {renderPaymentBadge(row.payment_status)}
          <span className="text-[11px] text-secondary-token capitalize">
            {val || "Cash"}
          </span>
        </div>
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
      key: "status",
      header: "Order Status",
      render: (val) => renderStatusBadge(val),
    },
    {
      key: "actions",
      header: "Actions",
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
            <ShoppingBag className="w-5 h-5 text-brand-token" />
            Sales & POS Orders
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Monitor counter billing, omni-channel sales transactions, and digital receipts
          </p>
        </div>
        <Link to="/sales/create">
          <Button variant="primary" size="sm" icon={Plus}>
            New Sale (POS)
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total Orders: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Revenue: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(metrics.totalSalesVal)}</strong></span>
        <span>•</span>
        <span>Completed: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatQty(metrics.completedCount)}</strong></span>
        <span>•</span>
        <span>Paid: <strong className="text-blue-700 dark:text-blue-400 font-medium">{formatQty(metrics.paidCount)}</strong></span>
        <span>•</span>
        <span>Drafts: <strong className="text-amber-800 dark:text-amber-400 font-medium">{formatQty(metrics.draftCount)}</strong></span>
      </div>

      {/* Standard Reusable Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search invoice # or customer..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Completed", value: "completed" },
                { label: "Draft", value: "draft" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
            <Select
              size="xs"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Payments", value: "all" },
                { label: "Paid", value: "paid" },
                { label: "Partially Paid", value: "partially_paid" },
                { label: "Pending", value: "pending" },
              ]}
            />
            <Select
              size="xs"
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Payment Methods", value: "all" },
                { label: "Cash", value: "cash" },
                { label: "UPI", value: "upi" },
                { label: "Card", value: "card" },
                { label: "Split / Multi-tender", value: "split" },
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
          onClick={fetchSales}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Standard Data Table */}
      <Table
        columns={columns}
        data={sales}
        loading={loading}
        emptyMessage="No sales orders found matching your criteria."
        onRowClick={(row) => navigate(`/sales/details?id=${row.id}`)}
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-token">
          <span>Page {page} of {totalPages} ({formatQty(totalCount)} total orders)</span>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="xs"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
