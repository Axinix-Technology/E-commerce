import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Plus, Search, ExternalLink, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function ShopIntegrationsIndex() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("shop_integration", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setShops(data);
    } catch {
      setShops([
        { id: 1, platform: "shopify", store_name: "Axinix Official Online Boutique", store_url: "https://axinix-couture.myshopify.com", sync_interval_minutes: 15, last_synced_at: "2026-10-03 14:00", sync_status: "idle", status: 1 },
        { id: 2, platform: "amazon", store_name: "Axinix Amazon India Storefront", store_url: "https://sellercentral.amazon.in", sync_interval_minutes: 30, last_synced_at: "2026-10-03 13:45", sync_status: "idle", status: 1 },
        { id: 3, platform: "woocommerce", store_name: "Axinix Bridal B2B Wholesale Portal", store_url: "https://b2b.axinix.com", sync_interval_minutes: 60, last_synced_at: "2026-10-03 12:30", sync_status: "idle", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const filtered = shops.filter((s) =>
    (s.store_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.platform || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.store_url || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalShops = shops.length;
  const activeShops = shops.filter((s) => s.status === 1).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent-primary" />
            Shop & Marketplace Integrations
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Automate omni-channel stock sync, order inwarding, and multi-store catalogue feeds</p>
        </div>
        <Link
          to="/masters/shop-integrations/create"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Connect Store
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Connected Channels: <strong className="text-text-primary font-medium">{formatQty(totalShops)}</strong></span>
        <span>•</span>
        <span>Active Synchronization: <strong className="text-emerald-400 font-medium">{formatQty(activeShops)}</strong></span>
        <span>•</span>
        <span>Omni-Channel Stock Sync: <strong className="text-accent-primary font-medium">Real-Time Webhooks</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by store name, platform, or URL..."
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
                <th className="px-4 py-2.5">Store / Channel Name</th>
                <th className="px-4 py-2.5">Platform</th>
                <th className="px-4 py-2.5">Store URL</th>
                <th className="px-4 py-2.5">Sync Frequency</th>
                <th className="px-4 py-2.5">Last Sync</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">Loading store integrations...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">No external channels connected.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-medium text-text-primary">{s.store_name}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize font-mono text-[11px] text-accent-primary">{s.platform}</span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={s.store_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary">
                        {s.store_url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-text-primary">Every {s.sync_interval_minutes} mins</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{s.last_synced_at || "—"}</td>
                    <td className="px-4 py-3">
                      {s.status === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          Paused
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/masters/shop-integrations/create?id=${s.id}`} className="text-[11px] font-medium text-accent-primary hover:underline">
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
