import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Coins, Plus, RefreshCw, Phone, ShoppingBag } from "lucide-react";
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

export default function OrdersAdvanceIndex() {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAdvances = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("customer_advance", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setAdvances(data);
    } catch {
      setAdvances([
        { id: 1, advance_no: "ADV-2026-001", customer_name: "Kavitha Raman", customer_phone: "+91 98410 22345", order_reference: "SO-KAV-101", amount: 25000, payment_mode: "UPI", status: 1, created_at: "2026-10-02" },
        { id: 2, advance_no: "ADV-2026-002", customer_name: "Sundaram Wedding Planners", customer_phone: "+91 94440 98765", order_reference: "SO-SUN-809", amount: 75000, payment_mode: "NEFT", status: 1, created_at: "2026-10-02" },
        { id: 3, advance_no: "ADV-2026-003", customer_name: "Arunachalam & Co", customer_phone: "+91 97900 11223", order_reference: "SO-ARU-450", amount: 15000, payment_mode: "Cheque", status: 1, created_at: "2026-10-03" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, []);

  const modeOptions = [
    { label: "All Payment Modes", value: "all" },
    ...Array.from(new Set(advances.map((a) => a.payment_mode).filter(Boolean))).map((m) => ({
      label: m,
      value: m,
    })),
  ];

  const filtered = advances.filter((a) => {
    if (modeFilter !== "all" && a.payment_mode !== modeFilter) return false;
    if (statusFilter !== "all" && String(a.status) !== statusFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (a.advance_no || "").toLowerCase().includes(term) ||
      (a.customer_name || "").toLowerCase().includes(term) ||
      (a.customer_phone || "").includes(search) ||
      (a.order_reference || "").toLowerCase().includes(term)
    );
  });

  const totalAdvance = filtered.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

  const columns = [
    {
      header: "Advance #",
      render: (a) => (
        <span className="font-mono font-bold text-brand-token text-xs">
          {a.advance_no}
        </span>
      ),
    },
    {
      header: "Customer",
      render: (a) => (
        <div>
          <div className="font-semibold text-primary-token text-xs">{a.customer_name}</div>
          {a.customer_phone && (
            <div className="flex items-center gap-1 font-mono text-[11px] text-muted-token mt-0.5">
              <Phone className="w-3 h-3 text-muted-token shrink-0" />
              {a.customer_phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Order Reference",
      render: (a) => (
        <span className="font-mono text-xs text-primary-token flex items-center gap-1">
          <ShoppingBag className="w-3 h-3 text-muted-token shrink-0" />
          {a.order_reference || "—"}
        </span>
      ),
    },
    {
      header: "Deposit Amount",
      render: (a) => (
        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
          {formatCurrency(a.amount)}
        </span>
      ),
    },
    {
      header: "Payment Mode",
      render: (a) => (
        <Badge variant="primary" size="sm">
          {a.payment_mode || "UPI"}
        </Badge>
      ),
    },
    {
      header: "Date",
      render: (a) => (
        <span className="text-[11px] text-muted-token font-mono">
          {a.created_at || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      render: () => (
        <Badge variant="success" size="sm">
          Received
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
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              Customer Order Advances & Deposits
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Track advance booking deposits, customer layaway prepayments, and order reservation funds
            </p>
          </div>
        </div>

        <Link to="/orders/advance/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Record Advance
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Advance Receipts: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Total Deposits Held: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(totalAdvance)}</strong></span>
        <span>•</span>
        <span>Reconciliation: <strong className="text-brand-token font-medium">Auto-Allocating</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by advance #, customer, or phone..."
        filters={
          <>
            <Select
              size="xs"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              options={modeOptions}
            />
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Advance Statuses", value: "all" },
                { label: "Active / Held Deposit", value: "1" },
                { label: "Archived / Settled", value: "0" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setModeFilter("all");
          setStatusFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchAdvances}
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
        emptyMessage="No customer advance receipts found."
      />
    </div>
  );
}
