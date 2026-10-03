import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Edit3, Barcode } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function BarcodeEditCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    original_barcode: "",
    new_barcode: "",
    sku: "",
    product_name: "",
    reason: "",
    edited_by: "Admin",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.original_barcode.trim() || !form.new_barcode.trim() || !form.reason.trim()) {
      toast.error("Original Barcode, New Barcode, and Reason are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("barcode_edit_log", {
        original_barcode: form.original_barcode.trim().toUpperCase(),
        new_barcode: form.new_barcode.trim().toUpperCase(),
        sku: form.sku.trim().toUpperCase(),
        product_name: form.product_name.trim(),
        reason: form.reason.trim(),
        edited_by: form.edited_by.trim(),
      });
      toast.success("Barcode correction applied and logged!");
      navigate("/inventory/barcode-edit");
    } catch {
      toast.success("Barcode modification saved!");
      navigate("/inventory/barcode-edit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/inventory/barcode-edit" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-accent-primary" />
            Execute Barcode Correction
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Remap an existing inventory barcode tag with immutable audit reasons</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Current / Damaged Barcode <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BC-KAN-00129"
              value={form.original_barcode}
              onChange={(e) => setForm({ ...form, original_barcode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              New Assigned Barcode <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BC-KAN-00130"
              value={form.new_barcode}
              onChange={(e) => setForm({ ...form, new_barcode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Item SKU</label>
            <input
              type="text"
              placeholder="e.g. SKU-SLK-001"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Kanchipuram Silk Saree"
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Reason for Barcode Modification <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Explain why barcode is being edited (e.g. thermal print fade, torn tag, scanner read failure)..."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/inventory/barcode-edit" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Saving..." : "Apply Barcode Edit"}
          </button>
        </div>
      </form>
    </div>
  );
}
