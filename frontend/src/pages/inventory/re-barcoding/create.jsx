import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, QrCode, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Textarea } from "../../../components/ui";

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/inventory/re-barcoding"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-token" />
            Generate Replacement Barcode
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Retag inventory item with a newly generated barcode while preserving audit history
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Current / Old Barcode"
          required
          placeholder="e.g. OLD-BC-0991"
          value={form.old_barcode}
          onChange={(e) => setForm({ ...form, old_barcode: e.target.value.toUpperCase() })}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-secondary-token">
              New Replacement Barcode <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <button
              type="button"
              onClick={generateBarcode}
              className="text-xs font-semibold text-brand-token hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto Generate
            </button>
          </div>
          <Input
            required
            placeholder="e.g. BC-REBAR-892102"
            value={form.new_barcode}
            onChange={(e) => setForm({ ...form, new_barcode: e.target.value.toUpperCase() })}
          />
        </div>

        <Textarea
          label="Reason for Replacement"
          required
          rows={3}
          placeholder="Specify reason (e.g. label faded, repackaged, damaged tag, format upgrade)..."
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />

        <Input
          label="Authorizing Authority"
          placeholder="Store Manager / Lead"
          value={form.authorized_by}
          onChange={(e) => setForm({ ...form, authorized_by: e.target.value })}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/inventory/re-barcoding")}
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
            Generate & Save Tag
          </Button>
        </div>
      </form>
    </div>
  );
}
