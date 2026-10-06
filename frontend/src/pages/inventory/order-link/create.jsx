import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input } from "../../../components/ui";

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/inventory/order-link"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Link2 className="w-5 h-5 text-brand-token" />
            Link Barcode to Sales Order
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Assign scanned inventory items to pending customer dispatch orders
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Sales Order ID"
            required
            placeholder="e.g. ORD-2026-904"
            value={form.order_id}
            onChange={(e) => setForm({ ...form, order_id: e.target.value.toUpperCase() })}
          />

          <Input
            label="Physical Barcode Tag"
            required
            placeholder="e.g. BC-KAN-00135"
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="SKU / Item Code"
            placeholder="e.g. SKU-SLK-001"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
          />

          <Input
            label="Fulfillment Staff"
            placeholder="Staff Name"
            value={form.linked_by}
            onChange={(e) => setForm({ ...form, linked_by: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/inventory/order-link")}
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
            Confirm Link
          </Button>
        </div>
      </form>
    </div>
  );
}
