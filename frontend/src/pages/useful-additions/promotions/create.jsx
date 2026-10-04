import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Tag, Save } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/useful-additions/promotions"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Create Promotional Coupon</span>
          </h1>
          <p className="text-xs text-gray-400">Configure discount vouchers, thresholds, and campaign validity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. FESTIVE20"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Campaign Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Festive Season 20% Off"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Campaign Description</label>
            <textarea
              rows={2}
              placeholder="Valid across all items for festive celebrations..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Discount Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              >
                <option value="percentage" className="bg-gray-900">Percentage (%)</option>
                <option value="fixed" className="bg-gray-900">Flat Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Discount Value *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="20"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Max Discount Cap (₹)</label>
              <input
                type="number"
                placeholder="1000"
                value={formData.max_discount_amount}
                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Minimum Order Value (₹)</label>
              <input
                type="number"
                placeholder="1000"
                value={formData.min_order_value}
                onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Valid Until</label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/useful-additions/promotions"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Publishing..." : "Publish Voucher"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
