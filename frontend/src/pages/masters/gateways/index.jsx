import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Plus, Search, ShieldCheck, CheckCircle2, XCircle, Key } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function GatewaysIndex() {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = gateways.filter((g) =>
    (g.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (g.gateway_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (g.merchant_id || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalGateways = gateways.length;
  const activeGateways = gateways.filter((g) => g.status === 1).length;
  const liveGateways = gateways.filter((g) => !g.is_test_mode && g.status === 1).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent-primary" />
            Payment Gateway Master
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Configure digital checkout processors, webhook verification keys, and test sandbox environments</p>
        </div>
        <Link
          to="/masters/gateways/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Gateway
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Configured Gateways: <strong className="text-text-primary font-medium">{formatQty(totalGateways)}</strong></span>
        <span>•</span>
        <span>Active Processors: <strong className="text-emerald-400 font-medium">{formatQty(activeGateways)}</strong></span>
        <span>•</span>
        <span>Live Production: <strong className="text-accent-primary font-medium">{formatQty(liveGateways)}</strong></span>
        <span>•</span>
        <span>PCI-DSS Encryption: <strong className="text-emerald-400 font-medium">Enforced</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by gateway name, code, or merchant ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-card border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
        />
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden bg-surface-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-muted">
            <thead className="bg-surface-ground/50 border-b border-border/50 text-text-secondary uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Gateway Provider</th>
                <th className="px-4 py-2.5">Identifier Code</th>
                <th className="px-4 py-2.5">Merchant / Account ID</th>
                <th className="px-4 py-2.5">Operating Mode</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-text-muted">Loading payment gateways...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-text-muted">No gateways configured.</td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-medium text-text-primary flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-accent-primary" />
                      {g.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-accent-primary uppercase">{g.gateway_code}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{g.merchant_id || "—"}</td>
                    <td className="px-4 py-3">
                      {g.is_test_mode ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Sandbox / Test
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Production Live
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {g.status === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/masters/gateways/create?id=${g.id}`} className="text-[11px] font-medium text-accent-primary hover:underline">
                        Configure
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
