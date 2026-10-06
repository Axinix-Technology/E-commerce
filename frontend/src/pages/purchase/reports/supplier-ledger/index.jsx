import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Download, RefreshCw } from "lucide-react";
import populateApi from "../../../../api/populate.api";
import { formatQty, formatCurrency } from "../../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../../components/ui";

export default function SupplierLedgerIndex() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [voucherTypeFilter, setVoucherTypeFilter] = useState("all");

  const fetchLedger = async () => {
    setLoading(true);
    try {
      setEntries([
        { id: 1, date: "2026-10-01", supplier_name: "Sri Lakshmi Silks Kanchipuram", voucher_type: "GRN Inward Bill", voucher_no: "GRN-2026-001", debit: 0, credit: 441000, balance: 441000 },
        { id: 2, date: "2026-10-02", supplier_name: "Sri Lakshmi Silks Kanchipuram", voucher_type: "RTV Debit Note", voucher_no: "RTV-2026-001", debit: 22500, credit: 0, balance: 418500 },
        { id: 3, date: "2026-10-02", supplier_name: "Sri Lakshmi Silks Kanchipuram", voucher_type: "NEFT Bank Payment", voucher_no: "PAY-2026-991", debit: 200000, credit: 0, balance: 218500 },
        { id: 4, date: "2026-10-02", supplier_name: "Surat Zari Mills Pvt Ltd", voucher_type: "GRN Inward Bill", voucher_no: "GRN-2026-002", debit: 0, credit: 189000, balance: 189000 },
        { id: 5, date: "2026-10-03", supplier_name: "Surat Zari Mills Pvt Ltd", voucher_type: "IMPS Payout", voucher_no: "PAY-2026-992", debit: 100000, credit: 0, balance: 89000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const supplierOptions = [
    { label: "All Suppliers", value: "all" },
    ...Array.from(new Set(entries.map((e) => e.supplier_name).filter(Boolean))).map((sn) => ({
      label: sn,
      value: sn,
    })),
  ];

  const voucherTypeOptions = [
    { label: "All Voucher Types", value: "all" },
    ...Array.from(new Set(entries.map((e) => e.voucher_type).filter(Boolean))).map((vt) => ({
      label: vt,
      value: vt,
    })),
  ];

  const filtered = entries.filter((e) => {
    if (supplierFilter !== "all" && e.supplier_name !== supplierFilter) return false;
    if (voucherTypeFilter !== "all" && e.voucher_type !== voucherTypeFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (e.supplier_name || "").toLowerCase().includes(term) ||
      (e.voucher_no || "").toLowerCase().includes(term) ||
      (e.voucher_type || "").toLowerCase().includes(term)
    );
  });

  const totalCredits = filtered.reduce((acc, e) => acc + (Number(e.credit) || 0), 0);
  const totalDebits = filtered.reduce((acc, e) => acc + (Number(e.debit) || 0), 0);
  const netClosingBalance = totalCredits - totalDebits;

  const exportCsv = () => {
    const headers = ["Date,Supplier,Voucher Type,Voucher No,Debit Paid (INR),Credit Billed (INR),Balance (INR)"];
    const rows = filtered.map(e =>
      `"${e.date}","${e.supplier_name}","${e.voucher_type}","${e.voucher_no}",${e.debit || 0},${e.credit || 0},${e.balance || 0}`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Supplier_Ledger_Statement_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (val) => <span className="text-secondary-token text-xs">{val}</span>,
    },
    {
      key: "supplier_name",
      header: "Supplier / Weaver",
      render: (val) => <span className="font-semibold text-primary-token">{val}</span>,
    },
    {
      key: "voucher_type",
      header: "Voucher Type & Reference",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-primary-token">{val}</span>
          <span className="font-mono text-[10px] text-brand-token">{row.voucher_no}</span>
        </div>
      ),
    },
    {
      key: "debit",
      header: "Debit / Paid (₹)",
      align: "right",
      render: (val) => (
        <span className="font-mono text-emerald-700 dark:text-emerald-400">
          {Number(val) > 0 ? formatCurrency(val) : "—"}
        </span>
      ),
    },
    {
      key: "credit",
      header: "Credit / Billed (₹)",
      align: "right",
      render: (val) => (
        <span className="font-mono text-secondary-token">
          {Number(val) > 0 ? formatCurrency(val) : "—"}
        </span>
      ),
    },
    {
      key: "balance",
      header: "Balance (₹)",
      align: "right",
      render: (val) => (
        <span className="font-mono font-bold text-primary-token">
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
            <BookOpen className="w-5 h-5 text-brand-token" />
            Supplier Account Statement & Ledger
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Chronological double-entry debit and credit transactions with running balance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={exportCsv}
        >
          Export Statement
        </Button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Vouchers: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Total Billed (Cr): <strong className="text-primary-token font-medium">{formatCurrency(totalCredits)}</strong></span>
        <span>•</span>
        <span>Total Disbursed (Dr): <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatCurrency(totalDebits)}</strong></span>
        <span>•</span>
        <span>Net Closing Balance: <strong className="text-amber-800 dark:text-amber-400 font-bold">{formatCurrency(netClosingBalance)}</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by supplier name or voucher reference..."
        filters={
          <>
            <Select
              size="xs"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              options={supplierOptions}
            />
            <Select
              size="xs"
              value={voucherTypeFilter}
              onChange={(e) => setVoucherTypeFilter(e.target.value)}
              options={voucherTypeOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setSupplierFilter("all");
          setVoucherTypeFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchLedger}
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
        emptyMessage="No ledger entries found."
      />
    </div>
  );
}
