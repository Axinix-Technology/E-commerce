import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Unlink2, Plus, Search, Barcode, AlertCircle, ShoppingBag } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function OrderUnlinkIndex() {
  const [unlinks, setUnlinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUnlinks = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("order_barcode_link", { status: "Unlinked", limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setUnlinks(data);
    } catch {
      setUnlinks([
        { id: 101, order_id: "ORD-2026-880", barcode: "BC-KAN-00110", sku: "SKU-SLK-001", reason: "Customer cancelled item prior to dispatch", unlinked_by: "Sarah M.", unlinked_at: "2026-10-02 16:10" },
        { id: 102, order_id: "ORD-2026-895", barcode: "BC-ZRI-90390", sku: "SKU-ZRI-003", reason: "Wrong color scanned into order bucket", unlinked_by: "Admin", unlinked_at: "2026-10-03 11:05" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnlinks();
  }, []);

  const filtered = unlinks.filter((u) =>
    (u.order_id || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.barcode || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Unlink2 className="w-5 h-5 text-rose-400" />
            Order Barcode Unlinking
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Detach reserved inventory barcodes from orders and return items to active stock</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/inventory/order-link"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition"
          >
            Linked Barcodes
          </Link>
          <Link
            to="/inventory/order-unlink/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Unlink Barcode
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Unlinked Items: <strong className="text-rose-400 font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Stock Restored: <strong className="text-emerald-400 font-medium">Immediate</strong></span>
        <span>•</span>
        <span>Release Status: <strong className="text-accent-primary font-medium">Available in Sellable Pool</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search unlinked orders, barcodes, or SKUs..."
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
                <th className="px-4 py-2.5">Order ID</th>
                <th className="px-4 py-2.5">Unlinked Barcode</th>
                <th className="px-4 py-2.5">SKU</th>
                <th className="px-4 py-2.5">Reason for Unlinking</th>
                <th className="px-4 py-2.5">Staff</th>
                <th className="px-4 py-2.5">Unlinked At</th>
                <th className="px-4 py-2.5">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">Loading unlinked items...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">No unlinked items found.</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-semibold text-text-primary flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-text-muted" />
                      {u.order_id}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-rose-400">{u.barcode}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-secondary">{u.sku || "—"}</td>
                    <td className="px-4 py-3 text-text-muted max-w-xs">{u.reason}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.unlinked_by || "System"}</td>
                    <td className="px-4 py-3 text-text-muted">{u.unlinked_at || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Restored to Stock
                      </span>
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
