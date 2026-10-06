import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Download,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Select, Table, Badge, FilterBar } from "../../../components/ui";

export default function PaymentsReportPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [metrics, setMetrics] = useState({
    totalInflow: 0,
    totalRefunds: 0,
    netIntake: 0,
    cashTotal: 0,
    upiTotal: 0,
    cardTotal: 0,
    bankTotal: 0,
  });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("sale_payment", {
        limit: 500,
        populate: {
          sale: ["id", "sale_number", "customer_name"],
          customer: ["id", "name"],
        },
        sort: ["-transacted_at"],
      });

      const dataList = Array.isArray(res) ? res : res?.data || [];
      setPayments(dataList);

      const inflow = dataList
        .filter((p) => p.transaction_type === "payment")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const refunds = dataList
        .filter((p) => p.transaction_type === "refund")
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      const cash = dataList
        .filter((p) => p.payment_method === "cash")
        .reduce((sum, p) => sum + (p.transaction_type === "payment" ? Number(p.amount) : -Number(p.amount)), 0);
      const upi = dataList
        .filter((p) => p.payment_method === "upi")
        .reduce((sum, p) => sum + (p.transaction_type === "payment" ? Number(p.amount) : -Number(p.amount)), 0);
      const card = dataList
        .filter((p) => p.payment_method === "card")
        .reduce((sum, p) => sum + (p.transaction_type === "payment" ? Number(p.amount) : -Number(p.amount)), 0);
      const bank = dataList
        .filter((p) => p.payment_method === "bank_transfer")
        .reduce((sum, p) => sum + (p.transaction_type === "payment" ? Number(p.amount) : -Number(p.amount)), 0);

      setMetrics({
        totalInflow: inflow,
        totalRefunds: refunds,
        netIntake: inflow - refunds,
        cashTotal: cash,
        upiTotal: upi,
        cardTotal: card,
        bankTotal: bank,
      });
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load payments report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setMethodFilter("all");
    setTypeFilter("all");
  };

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.reference_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.sale?.sale_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.customer?.name || p.sale?.customer_name || "").toLowerCase().includes(search.toLowerCase());

    const matchesMethod = methodFilter === "all" || p.payment_method === methodFilter;
    const matchesType = typeFilter === "all" || p.transaction_type === typeFilter;

    return matchesSearch && matchesMethod && matchesType;
  });

  const handleExportCSV = () => {
    const headers = "Reference Number,Date,Type,Payment Method,Amount,Customer,Sale Number\n";
    const rows = payments
      .map(
        (p) =>
          `"${p.reference_number || `TX-${p.id}`}","${p.transacted_at}","${p.transaction_type}","${p.payment_method}",${p.amount},"${p.customer?.name || "—"}","${p.sale?.sale_number || "—"}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `payments-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Payments CSV exported!");
  };

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
          <Badge variant="emerald" dot>Collection</Badge>
        ),
    },
    {
      key: "payment_method",
      header: "Channel",
      render: (val) => (
        <Badge variant="neutral" className="uppercase font-mono text-[10px]">
          {val || "CASH"}
        </Badge>
      ),
    },
    {
      key: "customer",
      header: "Customer / Order",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary-token">{val?.name || row.sale?.customer_name || "Walk-in Guest"}</span>
          <span className="text-[10px] text-brand-token font-mono">{row.sale?.sale_number || "—"}</span>
        </div>
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
              isRefund ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
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
            Treasury & Payments Reconciliation
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Audit store collections, UPI merchant payouts, and counter cash reserves
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
        <span>Gross Intake: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(metrics.totalInflow)}</strong></span>
        <span>•</span>
        <span>Refunds: <strong className="text-rose-700 dark:text-rose-400 font-medium">{formatCurrency(metrics.totalRefunds)}</strong></span>
        <span>•</span>
        <span>Net Cashflow: <strong className="text-primary-token font-bold">{formatCurrency(metrics.netIntake)}</strong></span>
        <span>•</span>
        <span>UPI: <strong className="text-brand-token font-medium">{formatCurrency(metrics.upiTotal)}</strong></span>
        <span>•</span>
        <span>Cash: <strong className="text-secondary-token font-medium">{formatCurrency(metrics.cashTotal)}</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search reference #, customer, or invoice..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              options={[
                { label: "All Payment Methods", value: "all" },
                { label: "Cash on Counter", value: "cash" },
                { label: "UPI Payments", value: "upi" },
                { label: "Credit/Debit Cards", value: "card" },
                { label: "Bank Transfer", value: "bank_transfer" },
              ]}
            />
            <Select
              size="xs"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { label: "All Transaction Types", value: "all" },
                { label: "Sales Collections", value: "payment" },
                { label: "Customer Refunds", value: "refund" },
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
          onClick={fetchPayments}
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
        emptyMessage="No payment records found matching your filter."
      />
    </div>
  );
}
