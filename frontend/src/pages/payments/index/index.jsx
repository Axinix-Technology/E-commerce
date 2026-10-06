import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Select, Table, Badge, FilterBar } from "../../../components/ui";

export default function PaymentsListPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Metrics for single-line summary bar (Rule 2)
  const [metrics, setMetrics] = useState({
    totalInflow: 0,
    totalRefunds: 0,
    upiCount: 0,
    cashCount: 0,
    cardCount: 0,
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["reference_number.icontains"] = search.trim();
      }
      if (methodFilter !== "all") {
        filter["payment_method"] = methodFilter;
      }
      if (typeFilter !== "all") {
        filter["transaction_type"] = typeFilter;
      }

      const res = await populateApi.read("sale_payment", {
        filter,
        page,
        limit: 15,
        populate: {
          sale: ["id", "sale_number", "customer_name"],
          customer: ["id", "name", "phone"],
          sales_return: ["id", "return_number"],
        },
        sort: ["-transacted_at"],
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      setPayments(list);
      setTotalCount(res?.count || list.length);
      setTotalPages(res?.metadata?.total_pages || Math.ceil(list.length / 15) || 1);

      const inflow = list
        .filter((p) => p.transaction_type === "payment")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const refunds = list
        .filter((p) => p.transaction_type === "refund")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const upi = list.filter((p) => p.payment_method === "upi").length;
      const cash = list.filter((p) => p.payment_method === "cash").length;
      const card = list.filter((p) => p.payment_method === "card").length;

      setMetrics({
        totalInflow: inflow,
        totalRefunds: refunds,
        upiCount: upi,
        cashCount: cash,
        cardCount: card,
      });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load payment transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, search, methodFilter, typeFilter]);

  const columns = [
    {
      key: "reference_number",
      header: "Reference # / Date",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val || `TX-${row.id}`}</span>
          <span className="text-[10px] text-muted-token">
            {row.transacted_at ? new Date(row.transacted_at).toLocaleString() : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "transaction_type",
      header: "Type",
      render: (val) =>
        val === "refund" ? (
          <Badge variant="rose" dot>Refund</Badge>
        ) : (
          <Badge variant="emerald" dot>Payment In</Badge>
        ),
    },
    {
      key: "sale",
      header: "Linked Reference",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs text-brand-token font-semibold">
            {val?.sale_number || (row.sales_return ? row.sales_return.return_number : "Counter POS")}
          </span>
          <span className="text-[10px] text-muted-token">{row.customer?.name || val?.customer_name || "—"}</span>
        </div>
      ),
    },
    {
      key: "payment_method",
      header: "Method",
      render: (val) => (
        <Badge variant="neutral" className="uppercase font-mono text-[10px]">
          {val || "CASH"}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount (₹)",
      align: "right",
      render: (val, row) => {
        const isRefund = row.transaction_type === "refund";
        return (
          <span
            className={`font-mono font-bold ${
              isRefund
                ? "text-rose-700 dark:text-rose-400"
                : "text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {isRefund ? `-${formatCurrency(val)}` : `+${formatCurrency(val)}`}
          </span>
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
            <CreditCard className="w-5 h-5 text-brand-token" />
            Payment Settlements & Ledger
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Audit point-of-sale collections, digital payment gateways, and disbursements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/payments/refunds">
            <Button variant="outline" size="sm" icon={RotateCcw}>
              Refund Records
            </Button>
          </Link>
          <Link to="/sales/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Receive Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total Records: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Net Inflow: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(metrics.totalInflow)}</strong></span>
        <span>•</span>
        <span>Total Outflows: <strong className="text-rose-700 dark:text-rose-400 font-medium">{formatCurrency(metrics.totalRefunds)}</strong></span>
        <span>•</span>
        <span>UPI Transactions: <strong className="text-brand-token font-medium">{formatQty(metrics.upiCount)}</strong></span>
        <span>•</span>
        <span>Cash Transactions: <strong className="text-secondary-token font-medium">{formatQty(metrics.cashCount)}</strong></span>
      </div>

      {/* Standard Reusable Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search reference or invoice..."
        filters={
          <>
            <Select
              size="xs"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              options={[
                { label: "All Payment Methods", value: "all" },
                { label: "Cash", value: "cash" },
                { label: "UPI", value: "upi" },
                { label: "Card", value: "card" },
                { label: "Bank Transfer", value: "bank_transfer" },
              ]}
            />
            <Select
              size="xs"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { label: "All Types", value: "all" },
                { label: "Inward Payments", value: "payment" },
                { label: "Refunds", value: "refund" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setMethodFilter("all");
          setTypeFilter("all");
          setPage(1);
        }}
      />

      {/* Standard Data Table */}
      <Table
        columns={columns}
        data={payments}
        loading={loading}
        emptyMessage="No payment transactions recorded."
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-token">
          <span>Page {page} of {totalPages} ({formatQty(totalCount)} total records)</span>
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
