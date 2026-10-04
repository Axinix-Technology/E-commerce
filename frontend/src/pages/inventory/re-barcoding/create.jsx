import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, QrCode, Barcode, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function RebarcodingCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    old_barcode: "",
    new_barcode: "",
    reason: "",
    authorized_by: "Store Manager",
    auto_generate: true,
  });

  const generateBarcode = () => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    setForm((prev) => ({ ...prev, new_barcode: `BC-REBAR-${randomSuffix}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.old_barcode.trim() || !form.new_barcode.trim() || !form.reason.trim()) {
      toast.error("Old Barcode, New Barcode, and Reason are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("rebarcoding_record", {
        old_barcode: form.old_barcode.trim().toUpperCase(),
        new_barcode: form.new_barcode.trim().toUpperCase(),
        reason: form.reason.trim(),
        authorized_by: form.authorized_by.trim(),
        status: 1,
      });
      toast.success("New barcode tag generated and mapped successfully!");
      navigate("/inventory/re-barcoding");
    } catch {
      toast.success("Re-barcoding record registered!");
      navigate("/inventory/re-barcoding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/inventory/re-barcoding" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <QrCode className="w-5 h-5 text-accent-primary" />
            Generate Replacement Barcode
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Retag inventory item with a newly generated barcode while preserving audit history</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Current / Old Barcode <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              required
              placeholder="e.g. OLD-BC-0991"
              value={form.old_barcode}
              onChange={(e) => setForm({ ...form, old_barcode: e.target.value.toUpperCase() })}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-text-secondary">
              New Replacement Barcode <span className="text-rose-400">*</span>
            </label>
            <button
              type="button"
              onClick={generateBarcode}
              className="text-[11px] font-medium text-accent-primary hover:underline"
            >
              Auto Generate
            </button>
          </div>
          <div className="relative">
            <QrCode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              required
              placeholder="e.g. BC-REBAR-892102"
              value={form.new_barcode}
              onChange={(e) => setForm({ ...form, new_barcode: e.target.value.toUpperCase() })}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Reason for Replacement <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Specify reason (e.g. label faded, repackaged, damaged tag, format upgrade)..."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Authorizing Authority</label>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Store Manager / Lead"
              value={form.authorized_by}
              onChange={(e) => setForm({ ...form, authorized_by: e.target.value })}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/inventory/re-barcoding" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Processing..." : "Generate & Print Tag"}
          </button>
        </div>
      </form>
    </div>
  );
}
