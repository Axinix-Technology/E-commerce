import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RotateCcw,
  Plus,
  CreditCard,
  ArrowDownLeft,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function RefundsListPage() {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Metrics for single-line summary bar (Rule 2)
  const [totalRefundVal, setTotalRefundVal] = useState(0);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const filter = {
        transaction_type: "refund",
      };
      if (search.trim()) {
        filter["reference_number.icontains"] = search.trim();
      }
      if (methodFilter !== "all") {
        filter["payment_method"] = methodFilter;
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
      setRefunds(list);
      setTotalCount(res?.count || list.length);
      setTotalPages(res?.metadata?.total_pages || Math.ceil(list.length / 15) || 1);

      const totalVal = list.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      setTotalRefundVal(totalVal);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load refund transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [page, search, methodFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setMethodFilter("all");
    setPage(1);
  };

  const columns = [
    {
      key: "reference_number",
      header: "Refund Voucher #",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val || `REF-${row.id}`}</span>
          <span className="text-[10px] text-muted-token">
            {row.transacted_at ? new Date(row.transacted_at).toLocaleString() : "—"}
          </span>
        </div>
      ),
    },
    {
      key: "sales_return",
      header: "Linked RMA",
      render: (val) => (
        <span className="font-mono text-xs text-brand-token font-semibold">
          {val?.return_number || "—"}
        </span>
      ),
    },
    {
      key: "sale",
      header: "Original Order",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary-token">{val?.sale_number || "Counter POS"}</span>
          <span className="text-[10px] text-muted-token">{row.customer?.name || val?.customer_name || "—"}</span>
        </div>
      ),
    },
    {
      key: "payment_method",
      header: "Disbursement Channel",
      render: (val) => (
        <Badge variant="neutral" className="uppercase font-mono text-[10px]">
          {val || "CASH"}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Refunded Amount",
      align: "right",
      render: (val) => (
        <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
          -{formatCurrency(val)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/payments/index"
            className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-brand-token" />
              Customer Refunds & Payouts
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Process and track customer refund vouchers and payout reversals
            </p>
          </div>
        </div>

        <Link to="/returns/create">
          <Button variant="primary" size="sm" icon={Plus}>
            New Return / Refund
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total Refund Vouchers: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Cumulative Disbursed: <strong className="text-rose-700 dark:text-rose-400 font-semibold">{formatCurrency(totalRefundVal)}</strong></span>
        <span>•</span>
        <span>Payout Status: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">Reconciled</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search voucher or customer..."
        onReset={handleResetFilters}
        filters={
          <Select
            size="xs"
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "All Payment Methods" },
              { value: "cash", label: "Cash" },
              { value: "upi", label: "UPI" },
              { value: "card", label: "Card" },
              { value: "bank_transfer", label: "Bank Transfer" },
              { value: "store_credit", label: "Store Credit" },
            ]}
          />
        }
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchRefunds}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Reusable Data Table */}
      <Table
        columns={columns}
        data={refunds}
        loading={loading}
        emptyMessage="No refund disbursements recorded."
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-token">
          <span>Page {page} of {totalPages} ({formatQty(totalCount)} total refunds)</span>
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
