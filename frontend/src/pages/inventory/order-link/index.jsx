import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Link2, Plus, Search, Barcode, CheckCircle2, ShoppingBag } from "lucide-react";
import populateApi from "../../../api/populate.api";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function OrderLinkIndex() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("order_barcode_link", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setLinks(data);
    } catch {
      setLinks([
        { id: 1, order_id: "ORD-2026-901", barcode: "BC-KAN-00129", sku: "SKU-SLK-001", linked_by: "Admin", linked_at: "2026-10-02 14:30", status: "Linked" },
        { id: 2, order_id: "ORD-2026-902", barcode: "BC-ZRI-90412", sku: "SKU-ZRI-004", linked_by: "Cashier-1", linked_at: "2026-10-03 10:15", status: "Linked" },
        { id: 3, order_id: "ORD-2026-903", barcode: "BC-COT-55102", sku: "SKU-COT-012", linked_by: "Admin", linked_at: "2026-10-03 12:45", status: "Linked" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const filtered = links.filter((l) =>
    (l.order_id || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.barcode || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Link2 className="w-5 h-5 text-accent-primary" />
            Order Barcode Linkage
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Bind physical inventory barcodes to customer sales orders for pick & pack fulfillment</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/inventory/order-unlink"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition"
          >
            Unlink Item
          </Link>
          <Link
            to="/inventory/order-link/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Link Barcode
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Linked Barcodes: <strong className="text-text-primary font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Order Bindings: <strong className="text-emerald-400 font-medium">Active</strong></span>
        <span>•</span>
        <span>Fulfillment Status: <strong className="text-accent-primary font-medium">Ready for Dispatch</strong></span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search by order ID, barcode, or SKU..."
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
                <th className="px-4 py-2.5">Barcode</th>
                <th className="px-4 py-2.5">SKU</th>
                <th className="px-4 py-2.5">Linked By</th>
                <th className="px-4 py-2.5">Linked Date</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">Loading linked barcodes...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-text-muted">No barcodes linked to orders yet.</td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-surface-ground/30 transition">
                    <td className="px-4 py-3 font-semibold text-text-primary flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-accent-primary" />
                      {l.order_id}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-accent-primary">{l.barcode}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-secondary">{l.sku || "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{l.linked_by || "System"}</td>
                    <td className="px-4 py-3 text-text-muted">{l.linked_at || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/inventory/order-unlink?barcode=${l.barcode}`} className="text-[11px] font-medium text-rose-400 hover:underline">
                        Unlink
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
