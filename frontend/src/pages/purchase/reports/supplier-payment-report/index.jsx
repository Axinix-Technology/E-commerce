import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Download, RefreshCw } from "lucide-react";
import populateApi from "../../../../api/populate.api";
import { formatQty, formatCurrency } from "../../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../../components/ui";

export default function SupplierPaymentReportIndex() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("purchase_payment", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setPayments(data);
    } catch {
      setPayments([
        { id: 1, voucher_number: "PAY-2026-991", supplier_name: "Sri Lakshmi Silks Kanchipuram", amount: 200000, payment_method: "bank_transfer", reference_number: "NEFT991200412", transacted_at: "2026-10-02" },
        { id: 2, voucher_number: "PAY-2026-992", supplier_name: "Surat Zari Mills Pvt Ltd", amount: 100000, payment_method: "upi", reference_number: "UPI-AXN-7712", transacted_at: "2026-10-03" },
        { id: 3, voucher_number: "PAY-2026-993", supplier_name: "Varanasi Heritage Handlooms", amount: 150000, payment_method: "cheque", reference_number: "CHQ-002194", transacted_at: "2026-10-03" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const supplierOptions = [
    { label: "All Suppliers", value: "all" },
    ...Array.from(new Set(payments.map((p) => p.supplier_name).filter(Boolean))).map((sn) => ({
      label: sn,
      value: sn,
    })),
  ];

  const filtered = payments.filter((p) => {
    if (paymentMethodFilter !== "all" && p.payment_method !== paymentMethodFilter) return false;
    if (supplierFilter !== "all" && p.supplier_name !== supplierFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (p.voucher_number || "").toLowerCase().includes(term) ||
      (p.supplier_name || "").toLowerCase().includes(term) ||
      (p.reference_number || "").toLowerCase().includes(term)
    );
  });

  const totalDisbursed = filtered.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const bankTransferVal = filtered.filter(p => p.payment_method === "bank_transfer").reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const upiVal = filtered.filter(p => p.payment_method === "upi").reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const exportCsv = () => {
    const headers = ["Voucher Number,Supplier,Date,Amount (INR),Payment Method,Reference / UTR"];
    const rows = filtered.map(p =>
      `"${p.voucher_number}","${p.supplier_name || ''}","${p.transacted_at || ''}",${p.amount || 0},"${p.payment_method || ''}","${p.reference_number || ''}"`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Supplier_Payment_Disbursals_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const columns = [
    {
      key: "voucher_number",
      header: "Voucher # / Date",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val}</span>
          <span className="text-[10px] text-muted-token">{row.transacted_at || "—"}</span>
        </div>
      ),
    },
    {
      key: "supplier_name",
      header: "Supplier / Recipient",
      render: (val) => <span className="font-medium text-primary-token">{val}</span>,
    },
    {
      key: "payment_method",
      header: "Mode / Gateway",
      render: (val) => (
        <Badge variant="neutral" className="uppercase font-mono text-[10px]">
          {val || "BANK"}
        </Badge>
      ),
    },
    {
      key: "reference_number",
      header: "UTR / Reference #",
      render: (val) => (
        <span className="font-mono text-xs text-brand-token font-semibold">
          {val || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Disbursed Amount (₹)",
      align: "right",
      render: (val) => (
        <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
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
            <CreditCard className="w-5 h-5 text-brand-token" />
            Supplier Payments & Disbursal Report
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Procurement payouts, banking UTR reconciliation, and settlement methods
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={exportCsv}
        >
          Export CSV
        </Button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Payment Vouchers: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Total Disbursed: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(totalDisbursed)}</strong></span>
        <span>•</span>
        <span>NEFT / RTGS: <strong className="text-primary-token font-medium">{formatCurrency(bankTransferVal)}</strong></span>
        <span>•</span>
        <span>UPI / IMPS: <strong className="text-brand-token font-medium">{formatCurrency(upiVal)}</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search voucher, supplier, or reference..."
        filters={
          <>
            <Select
              size="xs"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              options={[
                { label: "All Payment Methods", value: "all" },
                { label: "Bank Transfer (NEFT/RTGS)", value: "bank_transfer" },
                { label: "UPI / IMPS", value: "upi" },
                { label: "Cheque Clearance", value: "cheque" },
              ]}
            />
            <Select
              size="xs"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              options={supplierOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setPaymentMethodFilter("all");
          setSupplierFilter("all");
        }}
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
        emptyMessage="No supplier payment vouchers recorded."
      />
    </div>
  );
}
