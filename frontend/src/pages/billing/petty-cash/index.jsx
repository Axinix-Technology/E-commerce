import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, Plus, RefreshCw, ArrowDownRight, ArrowUpRight } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

const formatCurrency = (val) => {
  const num = Number(val);
  return !num || num === 0
    ? "—"
    : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function PettyCashIndex() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("petty_cash_transaction", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setVouchers(data);
    } catch {
      setVouchers([
        { id: 1, voucher_no: "PC-2026-001", voucher_type: "payment", amount: 1250, purpose: "Store cleaning consumables & sanitizer supplies", paid_to: "Sri Cleaners", approved_by: "Store Manager", status: 1, created_at: "2026-10-02" },
        { id: 2, voucher_no: "PC-2026-002", voucher_type: "payment", amount: 480, purpose: "Courier charges for sample dispatch to Coimbatore", paid_to: "Professional Couriers", approved_by: "Store Manager", status: 1, created_at: "2026-10-02" },
        { id: 3, voucher_no: "PC-2026-003", voucher_type: "receipt", amount: 10000, purpose: "Cash replenishment from Central Bank current account", paid_to: "Cash in Hand", approved_by: "Finance Head", status: 1, created_at: "2026-10-03" },
        { id: 4, voucher_no: "PC-2026-004", voucher_type: "payment", amount: 820, purpose: "Staff tea & refreshments for festive shift", paid_to: "Anand Bhavan", approved_by: "Cashier Lead", status: 1, created_at: "2026-10-03" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("all");
  };

  const filtered = vouchers.filter((v) => {
    const matchesSearch =
      (v.voucher_no || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.purpose || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.paid_to || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || v.voucher_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPayments = filtered
    .filter((v) => v.voucher_type === "payment")
    .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

  const totalReceipts = filtered
    .filter((v) => v.voucher_type === "receipt")
    .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

  const netBalance = totalReceipts - totalPayments;

  const columns = [
    {
      header: "Voucher #",
      render: (v) => (
        <span className="font-mono font-bold text-brand-token text-xs">
          {v.voucher_no}
        </span>
      ),
    },
    {
      header: "Type",
      render: (v) => (
        <Badge variant={v.voucher_type === "receipt" ? "success" : "danger"} size="sm">
          {v.voucher_type === "receipt" ? "Replenishment" : "Payment"}
        </Badge>
      ),
    },
    {
      header: "Particulars / Purpose",
      accessor: "purpose",
      className: "text-primary-token text-xs max-w-sm",
    },
    {
      header: "Paid To / From",
      accessor: "paid_to",
      className: "text-secondary-token text-xs",
    },
    {
      header: "Amount",
      render: (v) => (
        <span className={`font-mono font-semibold text-xs ${v.voucher_type === "receipt" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
          {v.voucher_type === "receipt" ? "+" : "-"}{formatCurrency(v.amount)}
        </span>
      ),
    },
    {
      header: "Approved By",
      accessor: "approved_by",
      className: "text-muted-token text-xs",
    },
    {
      header: "Date",
      render: (v) => (
        <span className="text-[11px] text-muted-token font-mono">
          {v.created_at || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              Petty Cash Drawer & Expense Vouchers
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Daily cashier drawer float, incidental operational expenses, and replenishment audit
            </p>
          </div>
        </div>

        <Link to="/billing/petty-cash/create">
          <Button variant="primary" size="sm" icon={Plus}>
            New Cash Voucher
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Vouchers: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Receipts In: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(totalReceipts)}</strong></span>
        <span>•</span>
        <span>Disbursements Out: <strong className="text-rose-600 dark:text-rose-400 font-semibold">{formatCurrency(totalPayments)}</strong></span>
        <span>•</span>
        <span>Net Drawer Balance: <strong className="text-brand-token font-medium">{formatCurrency(netBalance)}</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by voucher #, purpose, or payee..."
        onReset={handleResetFilters}
        filters={
          <Select
            size="xs"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "all", label: "All Voucher Types" },
              { value: "payment", label: "Expenses / Payments" },
              { value: "receipt", label: "Cash Replenishment" },
            ]}
          />
        }
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchVouchers}
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
        emptyMessage="No petty cash vouchers recorded."
      />
    </div>
  );
}
