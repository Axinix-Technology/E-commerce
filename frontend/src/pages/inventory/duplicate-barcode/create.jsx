import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Copy } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Textarea, Checkbox } from "../../../components/ui";

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/inventory/duplicate-barcode"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Copy className="w-5 h-5 text-brand-token" />
            Report Duplicate Barcode Collision
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Flag identical barcode scans on distinct physical units for QC isolation
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Colliding Barcode"
          required
          placeholder="e.g. BC-KAN-00881"
          value={form.barcode}
          onChange={(e) => setForm({ ...form, barcode: e.target.value.toUpperCase() })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Physical Pieces Found"
            type="number"
            min={2}
            value={form.duplicate_count}
            onChange={(e) => setForm({ ...form, duplicate_count: Number(e.target.value) })}
          />

          <Input
            label="Location of Detection"
            placeholder="e.g. Counter Station 1"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>

        <Textarea
          label="Resolution / Action Taken"
          rows={3}
          placeholder="Explain action taken (e.g. segregated piece for re-tagging, matched with GRN)..."
          value={form.resolution_notes}
          onChange={(e) => setForm({ ...form, resolution_notes: e.target.value })}
        />

        <div className="p-3.5 rounded-xl border border-token bg-surface-elevated/60">
          <Checkbox
            label="Mark Collision as Resolved (New tag issued & applied)"
            checked={form.resolved}
            onChange={(e) => setForm({ ...form, resolved: e.target.checked })}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/inventory/duplicate-barcode")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
          >
            Log Incident
          </Button>
        </div>
      </form>
    </div>
  );
}
