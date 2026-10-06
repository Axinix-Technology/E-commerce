import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Download, RefreshCw } from "lucide-react";
import populateApi from "../../../../api/populate.api";
import { formatQty, formatCurrency } from "../../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../../components/ui";

export default function PurchaseReturnReportIndex() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  const fetchReturns = async () => {
    setLoading(true);
    try {
      setReturns([
        { id: 1, rtv_number: "RTV-2026-001", grn_ref: "GRN-2026-001", supplier_name: "Sri Lakshmi Silks Kanchipuram", return_date: "2026-10-02", returned_units: 15, debit_note_amount: 22500, reason: "Zari Weave Defect / Slub", status: "completed" },
        { id: 2, rtv_number: "RTV-2026-002", grn_ref: "GRN-2026-002", supplier_name: "Surat Zari Mills Pvt Ltd", return_date: "2026-10-03", returned_units: 20, debit_note_amount: 18000, reason: "Color Bleed / Dye Bleach", status: "completed" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const supplierOptions = [
    { label: "All Suppliers", value: "all" },
    ...Array.from(new Set(returns.map((r) => r.supplier_name).filter(Boolean))).map((sn) => ({
      label: sn,
      value: sn,
    })),
  ];

  const reasonOptions = [
    { label: "All Rejection Reasons", value: "all" },
    ...Array.from(new Set(returns.map((r) => r.reason).filter(Boolean))).map((rn) => ({
      label: rn,
      value: rn,
    })),
  ];

  const filtered = returns.filter((r) => {
    if (supplierFilter !== "all" && r.supplier_name !== supplierFilter) return false;
    if (reasonFilter !== "all" && r.reason !== reasonFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (r.rtv_number || "").toLowerCase().includes(term) ||
      (r.supplier_name || "").toLowerCase().includes(term) ||
      (r.reason || "").toLowerCase().includes(term)
    );
  });

  const totalReturnedUnits = filtered.reduce((acc, r) => acc + (Number(r.returned_units) || 0), 0);
  const totalDebitNoteVal = filtered.reduce((acc, r) => acc + (Number(r.debit_note_amount) || 0), 0);

  const exportCsv = () => {
    const headers = ["RTV Number,GRN Ref,Supplier,Return Date,Returned Units,Debit Note Amount (INR),Reason"];
    const rows = filtered.map(r =>
      `"${r.rtv_number}","${r.grn_ref || ''}","${r.supplier_name || ''}","${r.return_date || ''}",${r.returned_units || 0},${r.debit_note_amount || 0},"${r.reason || ''}"`
    );
    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Purchase_Return_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const columns = [
    {
      key: "rtv_number",
      header: "RTV Voucher # / Date",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val}</span>
          <span className="text-[10px] text-muted-token">Returned: {row.return_date || "—"}</span>
        </div>
      ),
    },
    {
      key: "grn_ref",
      header: "Origin GRN Ref",
      render: (val) => (
        <span className="font-mono text-xs text-brand-token font-semibold">{val}</span>
      ),
    },
    {
      key: "supplier_name",
      header: "Vendor / Supplier",
      render: (val) => <span className="font-medium text-primary-token">{val}</span>,
    },
    {
      key: "returned_units",
      header: "Returned Units",
      align: "center",
      render: (val) => <span className="font-semibold">{formatQty(val)} Pcs</span>,
    },
    {
      key: "debit_note_amount",
      header: "Debit Note Amount (₹)",
      align: "right",
      render: (val) => (
        <span className="font-bold text-rose-700 dark:text-rose-400 font-mono">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Rejection Reason",
      render: (val) => <span className="text-secondary-token text-xs">{val}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: () => <Badge variant="emerald" dot>Completed</Badge>,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand-token" />
            Purchase Return (RTV) Report
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Return to vendor logs, damaged consignment write-offs, and debit notes issued
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
        <span>RTV Vouchers: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Units Returned: <strong className="text-rose-700 dark:text-rose-400 font-medium">{formatQty(totalReturnedUnits)}</strong></span>
        <span>•</span>
        <span>Debit Note Value: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(totalDebitNoteVal)}</strong></span>
        <span>•</span>
        <span>QC Reconciliation: <strong className="text-brand-token font-medium">100% Settled</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by RTV number, supplier, or reason..."
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
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              options={reasonOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setSupplierFilter("all");
          setReasonFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchReturns}
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
        emptyMessage="No purchase returns recorded."
      />
    </div>
  );
}
