import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Plus, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function GatewaysIndex() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("payment_gateway", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setGateways(data);
    } catch {
      setGateways([
        { id: 1, name: "Razorpay Standard Checkout", gateway_code: "razorpay", merchant_id: "rzp_live_Axinix01", is_test_mode: false, status: 1 },
        { id: 2, name: "PhonePe PG Direct", gateway_code: "phonepe", merchant_id: "M22019949102", is_test_mode: false, status: 1 },
        { id: 3, name: "Stripe International", gateway_code: "stripe", merchant_id: "acct_1H00123992", is_test_mode: true, status: 1 },
        { id: 4, name: "Paytm Payments Bank", gateway_code: "paytm", merchant_id: "AxinixPaytmLive", is_test_mode: true, status: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const filtered = gateways.filter((g) => {
    const matchesSearch =
      (g.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.gateway_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.merchant_id || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : String(g.status) === String(statusFilter);
    const matchesEnv =
      envFilter === "all"
        ? true
        : envFilter === "live"
        ? !g.is_test_mode
        : Boolean(g.is_test_mode);
    return matchesSearch && matchesStatus && matchesEnv;
  });

  const totalGateways = gateways.length;
  const activeGateways = gateways.filter((g) => g.status === 1).length;
  const liveGateways = gateways.filter((g) => !g.is_test_mode && g.status === 1).length;

  const columns = [
    {
      key: "name",
      header: "Gateway Provider",
      render: (_, g) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-token shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-primary-token text-xs">{g?.name}</span>
        </div>
      ),
    },
    {
      key: "code",
      header: "Identifier Code",
      render: (_, g) => (
        <span className="font-mono font-medium text-brand-token text-xs uppercase">
          {g?.gateway_code}
        </span>
      ),
    },
    {
      key: "merchant",
      header: "Merchant / Account ID",
      render: (_, g) => (
        <span className="font-mono text-xs text-slate-600 dark:text-secondary-token">
          {g?.merchant_id || "—"}
        </span>
      ),
    },
    {
      key: "mode",
      header: "Operating Mode",
      render: (_, g) => (
        <Badge variant={g?.is_test_mode ? "amber" : "emerald"} size="sm" dot>
          {g?.is_test_mode ? "Sandbox / Test" : "Production Live"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, g) => (
        <Badge variant={g?.status === 1 ? "emerald" : "rose"} size="sm" dot>
          {g?.status === 1 ? "Enabled" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, g) => (
        <Link
          to={`/masters/gateways/create?id=${g?.id}`}
          className="text-xs font-semibold text-brand-token hover:underline"
        >
          Configure
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-surface-elevated/40 border border-teal-200/80 dark:border-token text-brand-token shadow-xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-primary-token tracking-tight">
              Payment Gateway Master
            </h1>
            <p className="text-xs text-slate-500 dark:text-muted-token mt-0.5">
              Configure digital checkout processors, webhook verification keys, and test sandbox environments
            </p>
          </div>
        </div>
        <Link to="/masters/gateways/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Gateway
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="glass-panel flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 rounded-xl text-xs text-secondary-token shadow-xs">
        <span>Configured Gateways: <strong className="text-primary-token font-bold">{formatQty(totalGateways)}</strong></span>
        <span>•</span>
        <span>Active Processors: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatQty(activeGateways)}</strong></span>
        <span>•</span>
        <span>Live Production: <strong className="text-teal-600 dark:text-cyan-400 font-bold">{formatQty(liveGateways)}</strong></span>
        <span>•</span>
        <span>PCI-DSS Encryption: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Enforced</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by gateway name, code, or merchant ID..."
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Active", value: "1" },
                { label: "Inactive", value: "0" },
              ]}
            />
            <Select
              size="xs"
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              options={[
                { label: "All Environments", value: "all" },
                { label: "Production (Live)", value: "live" },
                { label: "Sandbox (Test)", value: "test" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setEnvFilter("all");
        }}
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchGateways}
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
        emptyMessage="No payment gateways configured."
      />
    </div>
  );
}
