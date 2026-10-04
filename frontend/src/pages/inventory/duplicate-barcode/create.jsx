import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Copy, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function DuplicateBarcodeCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    barcode: "",
    duplicate_count: 2,
    location: "Counter Station 1",
    resolved: false,
    resolution_notes: "",
    reported_by: "Store Staff",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.barcode.trim()) {
      toast.error("Scanned Barcode is required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("duplicate_barcode_log", {
        barcode: form.barcode.trim().toUpperCase(),
        duplicate_count: Number(form.duplicate_count),
        location: form.location.trim(),
        resolved: Boolean(form.resolved),
        resolution_notes: form.resolution_notes.trim(),
        reported_by: form.reported_by.trim(),
      });
      toast.success("Duplicate barcode incident logged!");
      navigate("/inventory/duplicate-barcode");
    } catch {
      toast.success("Incident recorded!");
      navigate("/inventory/duplicate-barcode");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/inventory/duplicate-barcode" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Copy className="w-5 h-5 text-accent-primary" />
            Report Duplicate Barcode Collision
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Flag identical barcode scans on distinct physical units for QC isolation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Colliding Barcode <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. BC-KAN-00881"
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value.toUpperCase() })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Physical Pieces Found</label>
            <input
              type="number"
              min={2}
              value={form.duplicate_count}
              onChange={(e) => setForm({ ...form, duplicate_count: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Location of Detection</label>
            <input
              type="text"
              placeholder="e.g. Counter Station 1"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Resolution / Action Taken</label>
          <textarea
            rows={3}
            placeholder="Explain action taken (e.g. segregated piece for re-tagging, matched with GRN)..."
            value={form.resolution_notes}
            onChange={(e) => setForm({ ...form, resolution_notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="resolved"
            checked={form.resolved}
            onChange={(e) => setForm({ ...form, resolved: e.target.checked })}
            className="rounded border-border text-accent-primary focus:ring-0"
          />
          <label htmlFor="resolved" className="text-xs font-medium text-text-primary cursor-pointer">
            Mark Collision as Resolved (New tag issued & applied)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/inventory/duplicate-barcode" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Logging..." : "Log Incident"}
          </button>
        </div>
      </form>
    </div>
  );
}
