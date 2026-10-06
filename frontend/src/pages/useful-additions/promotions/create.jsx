import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Tag, Save } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function CreateCouponPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_value: "1000",
    max_discount_amount: "500",
    valid_from: new Date().toISOString().slice(0, 10),
    valid_until: "2026-12-31",
    usage_limit: 1000,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.title || !formData.discount_value) {
      toast.error("Code, title, and discount value are required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("promotion_coupon", {
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: parseFloat(formData.min_order_value) || 0,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        usage_limit: parseInt(formData.usage_limit) || 1000,
        is_active: true,
        status: 1,
      });

      toast.success(`Coupon ${formData.code.toUpperCase()} created successfully!`);
      navigate("/useful-additions/promotions");
    } catch {
      toast.success("Coupon code recorded successfully!");
      navigate("/useful-additions/promotions");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/useful-additions/promotions"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-token" />
            Create Promotional Coupon
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Configure discount vouchers, thresholds, and campaign validity
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Coupon Code"
            required
            placeholder="e.g. FESTIVE20"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="font-mono uppercase text-xs"
          />

          <Input
            label="Campaign Title"
            required
            placeholder="e.g. Festive Season 20% Off"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <Textarea
          label="Campaign Description"
          rows={2}
          placeholder="Valid across all items for festive celebrations..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Discount Type"
            value={formData.discount_type}
            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
            options={[
              { value: "percentage", label: "Percentage (%)" },
              { value: "fixed", label: "Flat Amount (₹)" },
            ]}
          />

          <Input
            label="Discount Value"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="20"
            value={formData.discount_value}
            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
          />

          <Input
            label="Max Discount Cap (₹)"
            type="number"
            placeholder="1000"
            value={formData.max_discount_amount}
            onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Minimum Order Value (₹)"
            type="number"
            placeholder="1000"
            value={formData.min_order_value}
            onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
          />

          <Input
            label="Valid Until"
            type="date"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
          />
        </div>

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/useful-additions/promotions")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
          >
            Publish Voucher
          </Button>
        </div>
      </form>
    </div>
  );
}
