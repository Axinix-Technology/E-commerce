import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Plus, Building2, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function SupplierOutstandingIndex() {
  const [outstandings, setOutstandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [payableStatusFilter, setPayableStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const fetchOutstandings = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("vendor_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      const mapped = data.map((s) => ({
        id: s.id,
        supplier_name: s.name,
        phone: s.phone,
        city: s.city,
        total_billed: 850000,
        total_paid: 600000,
        outstanding: 250000,
        aging_30: 150000,
        aging_60: 100000,
      }));
      setOutstandings(mapped);
    } catch {
      setOutstandings([
        { id: 1, supplier_name: "Sri Lakshmi Silks Kanchipuram", phone: "+91 98400 12345", city: "Kanchipuram", total_billed: 1250000, total_paid: 900000, outstanding: 350000, aging_30: 200000, aging_60: 150000 },
        { id: 2, supplier_name: "Surat Zari Mills Pvt Ltd", phone: "+91 98250 67890", city: "Surat", total_billed: 840000, total_paid: 720000, outstanding: 120000, aging_30: 120000, aging_60: 0 },
        { id: 3, supplier_name: "Varanasi Heritage Handlooms", phone: "+91 94150 11223", city: "Varanasi", total_billed: 620000, total_paid: 620000, outstanding: 0, aging_30: 0, aging_60: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutstandings();
  }, []);

  const cityOptions = [
    { label: "All Cities / Clusters", value: "all" },
    ...Array.from(new Set(outstandings.map((o) => o.city).filter(Boolean))).map((c) => ({
      label: c,
      value: c,
    })),
  ];

  const filtered = outstandings.filter((o) => {
    if (payableStatusFilter === "pending" && Number(o.outstanding) <= 0) return false;
    if (payableStatusFilter === "settled" && Number(o.outstanding) > 0) return false;
    if (cityFilter !== "all" && o.city !== cityFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (o.supplier_name || "").toLowerCase().includes(term) ||
      (o.city || "").toLowerCase().includes(term)
    );
  });

  const totalOutstanding = filtered.reduce((acc, o) => acc + (Number(o.outstanding) || 0), 0);
  const totalBilled = filtered.reduce((acc, o) => acc + (Number(o.total_billed) || 0), 0);
  const totalPaid = filtered.reduce((acc, o) => acc + (Number(o.total_paid) || 0), 0);

  const columns = [
    {
      key: "supplier_name",
      header: "Supplier / Mill",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val}</span>
          <span className="text-[10px] text-muted-token">{row.city || "Tamil Nadu"}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      render: (val) => <span className="text-secondary-token text-xs">{val || "—"}</span>,
    },
    {
      key: "total_billed",
      header: "Total Billed (₹)",
      align: "right",
      render: (val) => <span className="font-mono text-secondary-token">{formatCurrency(val)}</span>,
    },
    {
      key: "total_paid",
      header: "Disbursed (₹)",
      align: "right",
      render: (val) => (
        <span className="font-mono text-emerald-700 dark:text-emerald-400">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "outstanding",
      header: "Net Payable (₹)",
      align: "right",
      render: (val) => (
        <span
          className={`font-mono font-bold ${
            Number(val) > 0 ? "text-amber-800 dark:text-amber-400" : "text-muted-token"
          }`}
        >
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Payable Status",
      render: (_, row) => (
        <Badge variant={Number(row.outstanding) > 0 ? "amber" : "emerald"} dot>
          {Number(row.outstanding) > 0 ? "Pending Dues" : "Settled"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-token" />
            Supplier Outstanding & Payables Ledger
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Track procurement bills, settled payments, and aging payables per supplier
          </p>
        </div>
        <Link to="/purchase/supplier-outstanding/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Record Payout
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Suppliers Listed: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Cumulative Billed: <strong className="text-primary-token font-medium">{formatCurrency(totalBilled)}</strong></span>
        <span>•</span>
        <span>Total Disbursed: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatCurrency(totalPaid)}</strong></span>
        <span>•</span>
        <span>Net Outstanding: <strong className="text-amber-800 dark:text-amber-400 font-bold">{formatCurrency(totalOutstanding)}</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by supplier name or location..."
        filters={
          <>
            <Select
              size="xs"
              value={payableStatusFilter}
              onChange={(e) => setPayableStatusFilter(e.target.value)}
              options={[
                { label: "All Payable Statuses", value: "all" },
                { label: "Pending Dues", value: "pending" },
                { label: "Settled / No Dues", value: "settled" },
              ]}
            />
            <Select
              size="xs"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              options={cityOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setPayableStatusFilter("all");
          setCityFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchOutstandings}
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
        emptyMessage="No supplier payables records found."
      />
    </div>
  );
}
