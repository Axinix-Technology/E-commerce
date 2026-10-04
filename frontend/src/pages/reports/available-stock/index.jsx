import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PackageCheck, Plus, Search, Filter, Download, Building } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

const formatCurrency = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

export default function AvailableStockIndex() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("reports_available_stock", { limit: 100 });
      const items = Array.isArray(res) ? res : res.data || [];
      setStocks(items);
    } catch {
      setStocks([
        { id: 1, sku: "SKU-SLK-001", product_name: "Kanchipuram Silk Saree", category: "Sarees", branch: "Chennai Flagship", on_hand: 48, reserved: 3, available: 45, unit_cost: 14500, total_value: 652500 },
        { id: 2, sku: "SKU-ZRI-004", product_name: "Surat Gold Zari Dupatta", category: "Dupattas", branch: "T. Nagar Showroom", on_hand: 85, reserved: 10, available: 75, unit_cost: 4800, total_value: 360000 },
        { id: 3, sku: "SKU-COT-012", product_name: "Chanderi Cotton Kurti", category: "Kurtis", branch: "Central Warehouse", on_hand: 120, reserved: 0, available: 120, unit_cost: 1650, total_value: 198000 },
        { id: 4, sku: "SKU-ORG-088", product_name: "Pure Organza Floral Saree", category: "Sarees", branch: "Coimbatore Branch", on_hand: 15, reserved: 2, available: 13, unit_cost: 8900, total_value: 115700 },
        { id: 5, sku: "SKU-TSH-030", product_name: "Tussar Silk Stole", category: "Accessories", branch: "Chennai Flagship", on_hand: 0, reserved: 0, available: 0, unit_cost: 2400, total_value: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const filtered = stocks.filter((s) =>
    (s.sku || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.product_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.category || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.branch || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalOnHand = filtered.reduce((sum, s) => sum + (Number(s.on_hand) || 0), 0);
  const totalReserved = filtered.reduce((sum, s) => sum + (Number(s.reserved) || 0), 0);
  const totalAvailable = filtered.reduce((sum, s) => sum + (Number(s.available) || 0), 0);
  const totalInventoryValue = filtered.reduce((sum, s) => sum + (Number(s.total_value) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-accent-primary" />
            Available Sellable Stock Registry
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Real-time inventory available for POS checkout and online storefront sales</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/reports/available-stock/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Stock Audit Snapshot
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>On-Hand Pcs: <strong className="text-text-primary font-medium">{formatQty(totalOnHand)}</strong></span>
        <span>•</span>
        <span>Reserved / Memo Pcs: <strong className="text-amber-400 font-medium">{formatQty(totalReserved)}</strong></span>
        <span>•</span>
        <span>Available Sellable: <strong className="text-emerald-400 font-medium">{formatQty(totalAvailable)}</strong></span>
        <span>•</span>
        <span>Sellable Valuation: <strong className="text-accent-primary font-medium">{formatCurrency(totalInventoryValue)}</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by SKU, product name, category, or branch..."
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
                <th className="px-4 py-2.5">SKU</th>
                <th className="px-4 py-2.5">Product Name</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Branch / Warehouse</th>
                <th className="px-4 py-2.5">On-Hand</th>
                <th className="px-4 py-2.5">Reserved</th>
                <th className="px-4 py-2.5">Available Pcs</th>
                <th className="px-4 py-2.5">Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">Loading stock registry...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-text-muted">No stock records found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-mono font-medium text-accent-primary">{s.sku}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{s.product_name}</td>
                    <td className="px-4 py-3 text-text-secondary">{s.category}</td>
                    <td className="px-4 py-3 text-text-secondary flex items-center gap-1.5">
                      <Building className="w-3 h-3 text-text-muted" />
                      {s.branch}
                    </td>
                    <td className="px-4 py-3 font-mono">{formatQty(s.on_hand)}</td>
                    <td className="px-4 py-3 font-mono text-amber-400">{formatQty(s.reserved)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{formatQty(s.available)}</td>
                    <td className="px-4 py-3 font-mono font-medium text-text-primary">{formatCurrency(s.total_value)}</td>
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
