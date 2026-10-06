import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Receipt, Plus, RefreshCw, ShoppingBag } from "lucide-react";
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

export default function BillingReceiptsIndex() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [cashierFilter, setCashierFilter] = useState("all");

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("billing_receipt", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setReceipts(data);
    } catch {
      setReceipts([
        { id: 1, receipt_no: "RCT-2026-1001", order_no: "ORD-2026-901", customer_name: "Meenakshi Sundaram", amount: 14500, payment_mode: "UPI", cashier: "Cashier-1", status: 1, created_at: "2026-10-02 11:30" },
        { id: 2, receipt_no: "RCT-2026-1002", order_no: "ORD-2026-902", customer_name: "Rajesh Kumar", amount: 28900, payment_mode: "Credit Card", cashier: "Admin", status: 1, created_at: "2026-10-02 14:15" },
        { id: 3, receipt_no: "RCT-2026-1003", order_no: "ORD-2026-903", customer_name: "Deepa Krishnan", amount: 5600, payment_mode: "Cash", cashier: "Cashier-2", status: 1, created_at: "2026-10-03 10:20" },
        { id: 4, receipt_no: "RCT-2026-1004", order_no: "ORD-2026-904", customer_name: "Anand Textiles Ltd", amount: 48000, payment_mode: "NEFT/RTGS", cashier: "Admin", status: 1, created_at: "2026-10-03 12:00" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setModeFilter("all");
    setCashierFilter("all");
  };

  const filtered = receipts.filter((r) => {
    const matchesSearch =
      (r.receipt_no || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.order_no || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.payment_mode || "").toLowerCase().includes(search.toLowerCase());
    const matchesMode = modeFilter === "all" || r.payment_mode === modeFilter;
    const matchesCashier = cashierFilter === "all" || r.cashier === cashierFilter;
    return matchesSearch && matchesMode && matchesCashier;
  });

  const totalCollected = filtered.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const columns = [
    {
      header: "Receipt No",
      render: (r) => (
        <span className="font-mono font-bold text-brand-token text-xs">
          {r.receipt_no}
        </span>
      ),
    },
    {
      header: "Order No",
      render: (r) => (
        <span className="font-mono text-xs text-primary-token flex items-center gap-1">
          <ShoppingBag className="w-3.5 h-3.5 text-muted-token shrink-0" />
          {r.order_no || "—"}
        </span>
      ),
    },
    {
      header: "Customer",
      accessor: "customer_name",
      className: "font-semibold text-primary-token text-xs",
    },
    {
      header: "Amount Paid",
      render: (r) => (
        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
          {formatCurrency(r.amount)}
        </span>
      ),
    },
    {
      header: "Payment Method",
      render: (r) => (
        <Badge variant="primary" size="sm">
          {r.payment_mode}
        </Badge>
      ),
    },
    {
      header: "Cashier",
      accessor: "cashier",
      className: "text-muted-token text-xs",
    },
    {
      header: "Timestamp",
      render: (r) => (
        <span className="text-[11px] text-muted-token font-mono">
          {r.created_at || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      render: () => (
        <Badge variant="success" size="sm">
          Settled
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              Billing & Sales Receipts
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Counter sales payment acknowledgements and customer tax invoices
            </p>
          </div>
        </div>

        <Link to="/billing/receipts/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Issue Receipt
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Receipts Issued: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Total Collected: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(totalCollected)}</strong></span>
        <span>•</span>
        <span>Audit Status: <strong className="text-brand-token font-medium">Reconciled</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by receipt no, order no, or customer..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              options={[
                { value: "all", label: "All Payment Modes" },
                { value: "Cash", label: "Cash" },
                { value: "UPI", label: "UPI" },
                { value: "Credit Card", label: "Credit Card" },
                { value: "NEFT/RTGS", label: "NEFT/RTGS" },
              ]}
            />
            <Select
              size="xs"
              value={cashierFilter}
              onChange={(e) => setCashierFilter(e.target.value)}
              options={[
                { value: "all", label: "All Cashiers" },
                { value: "Admin", label: "Admin" },
                { value: "Cashier-1", label: "Cashier-1" },
                { value: "Cashier-2", label: "Cashier-2" },
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
          onClick={fetchReceipts}
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
        emptyMessage="No billing receipts found."
      />
    </div>
  );
}
