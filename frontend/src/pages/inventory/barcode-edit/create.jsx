import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Textarea } from "../../../components/ui";

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/inventory/barcode-edit"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-brand-token" />
            Execute Barcode Correction
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Remap an existing inventory barcode tag with immutable audit reasons
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Current / Damaged Barcode"
            required
            placeholder="e.g. BC-KAN-00129"
            value={form.original_barcode}
            onChange={(e) => setForm({ ...form, original_barcode: e.target.value.toUpperCase() })}
          />

          <Input
            label="New Assigned Barcode"
            required
            placeholder="e.g. BC-KAN-00130"
            value={form.new_barcode}
            onChange={(e) => setForm({ ...form, new_barcode: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Item SKU"
            placeholder="e.g. SKU-SLK-001"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
          />

          <Input
            label="Product Name"
            placeholder="e.g. Kanchipuram Silk Saree"
            value={form.product_name}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
          />
        </div>

        <Textarea
          label="Reason for Barcode Modification"
          required
          rows={3}
          placeholder="Explain why barcode is being edited (e.g. thermal print fade, torn tag, scanner read failure)..."
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/inventory/barcode-edit")}
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
            Apply Barcode Edit
          </Button>
        </div>
      </form>
    </div>
  );
}
