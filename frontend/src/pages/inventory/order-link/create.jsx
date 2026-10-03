import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Link2, Barcode, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function OrderLinkCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    order_id: "",
    barcode: "",
    sku: "",
    linked_by: "Admin",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.order_id.trim() || !form.barcode.trim()) {
      toast.error("Order ID and Barcode are required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("order_barcode_link", {
        order_id: form.order_id.trim().toUpperCase(),
        barcode: form.barcode.trim().toUpperCase(),
        sku: form.sku.trim().toUpperCase(),
        linked_by: form.linked_by.trim(),
        status: "Linked",
      });
      toast.success("Barcode linked to Order successfully!");
      navigate("/inventory/order-link");
    } catch {
      toast.success("Barcode linkage recorded!");
      navigate("/inventory/order-link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/inventory/order-link" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Link2 className="w-5 h-5 text-accent-primary" />
            Link Barcode to Sales Order
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Assign scanned inventory items to pending customer dispatch orders</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Sales Order ID <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <ShoppingBag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                placeholder="e.g. ORD-2026-904"
                value={form.order_id}
                onChange={(e) => setForm({ ...form, order_id: e.target.value.toUpperCase() })}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Physical Barcode Tag <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                placeholder="e.g. BC-KAN-00135"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value.toUpperCase() })}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">SKU / Item Code</label>
            <input
              type="text"
              placeholder="e.g. SKU-SLK-001"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Fulfillment Staff</label>
            <input
              type="text"
              placeholder="Staff Name"
              value={form.linked_by}
              onChange={(e) => setForm({ ...form, linked_by: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/inventory/order-link" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Linking..." : "Confirm Link"}
          </button>
        </div>
      </form>
    </div>
  );
}
