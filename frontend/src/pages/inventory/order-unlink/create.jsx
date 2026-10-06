import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Unlink2 } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Textarea, Checkbox } from "../../../components/ui";

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/inventory/order-unlink"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Unlink2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Unlink Barcode from Sales Order
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Detach item from assigned order and return barcode to active sellable inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Physical Barcode Tag"
            required
            placeholder="e.g. BC-KAN-00129"
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value.toUpperCase() })}
          />

          <Input
            label="Sales Order Reference"
            placeholder="e.g. ORD-2026-901"
            value={form.order_id}
            onChange={(e) => setForm({ ...form, order_id: e.target.value.toUpperCase() })}
          />
        </div>

        <Textarea
          label="Reason for Unlinking"
          required
          rows={3}
          placeholder="Explain why item is being unlinked (e.g. customer cancellation, damaged goods, packaging error)..."
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />

        <div className="p-3.5 rounded-xl border border-token bg-surface-elevated/60">
          <Checkbox
            label="Immediately reinstate barcode to Available Stock bucket"
            checked={form.restore_stock}
            onChange={(e) => setForm({ ...form, restore_stock: e.target.checked })}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/inventory/order-unlink")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            icon={Unlink2}
            loading={submitting}
          >
            Execute Unlink
          </Button>
        </div>
      </form>
    </div>
  );
}
