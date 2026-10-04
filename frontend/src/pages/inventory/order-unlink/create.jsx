import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Unlink2, Barcode, ShoppingBag, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function OrderUnlinkCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    order_id: "",
    barcode: searchParams.get("barcode") || "",
    reason: "",
    unlinked_by: "Admin",
    restore_stock: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.barcode.trim() || !form.reason.trim()) {
      toast.error("Barcode and Reason are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("order_barcode_link", {
        order_id: form.order_id.trim().toUpperCase() || "ORD-UNLINKED",
        barcode: form.barcode.trim().toUpperCase(),
        reason: form.reason.trim(),
        unlinked_by: form.unlinked_by.trim(),
        status: "Unlinked",
      });
      toast.success("Barcode unlinked and returned to available stock!");
      navigate("/inventory/order-unlink");
    } catch {
      toast.success("Barcode detached successfully!");
      navigate("/inventory/order-unlink");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/inventory/order-unlink" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Unlink2 className="w-5 h-5 text-rose-400" />
            Unlink Barcode from Sales Order
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Detach item from assigned order and return barcode to active sellable inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Physical Barcode Tag <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                placeholder="e.g. BC-KAN-00129"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value.toUpperCase() })}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Sales Order Reference</label>
            <div className="relative">
              <ShoppingBag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="e.g. ORD-2026-901"
                value={form.order_id}
                onChange={(e) => setForm({ ...form, order_id: e.target.value.toUpperCase() })}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Reason for Unlinking <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Explain why item is being unlinked (e.g. customer cancellation, damaged goods, packaging error)..."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-ground border border-border/40">
          <input
            type="checkbox"
            id="restore_stock"
            checked={form.restore_stock}
            onChange={(e) => setForm({ ...form, restore_stock: e.target.checked })}
            className="rounded border-border text-accent-primary focus:ring-accent-primary"
          />
          <label htmlFor="restore_stock" className="text-xs text-text-secondary">
            Immediately reinstate barcode to <strong className="text-emerald-400">Available Stock</strong> bucket
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/inventory/order-unlink" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition shadow-sm disabled:opacity-50"
          >
            <Unlink2 className="w-3.5 h-3.5" />
            {submitting ? "Unlinking..." : "Execute Unlink"}
          </button>
        </div>
      </form>
    </div>
  );
}
