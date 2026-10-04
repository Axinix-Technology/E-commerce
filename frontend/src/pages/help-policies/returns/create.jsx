import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function InitiateReversePickupPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    order_number: "",
    reason: "Size Issue / Exchange",
    pickup_address: "",
    contact_phone: "",
    confirm_intact_tags: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.order_number || !formData.pickup_address || !formData.contact_phone) {
      toast.error("Please fill in Order Number, pickup address, and phone");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const rmaId = `RMA-${Date.now().toString().slice(-6)}`;
      toast.success(`Reverse pickup ${rmaId} registered! BlueDart will pick up within 24h.`);
      navigate("/help-policies/returns");
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/help-policies/returns"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Schedule Reverse Doorstep Pickup</span>
          </h1>
          <p className="text-xs text-gray-400">Initiate complimentary courier collection for eligible items</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Order Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. SO-20261003-8491"
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 9876543210"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Primary Reason *</label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            >
              <option value="Size Issue / Exchange" className="bg-gray-900">Size Issue / Exchange</option>
              <option value="Fabric / Drape Difference" className="bg-gray-900">Fabric / Drape Difference</option>
              <option value="Defective Garment" className="bg-gray-900">Defective Garment</option>
              <option value="Incorrect Item Dispatched" className="bg-gray-900">Incorrect Item Dispatched</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Doorstep Pickup Address *</label>
            <textarea
              rows={2}
              required
              placeholder="Flat 402, Highline Residency, Bandra West, Mumbai - 400050"
              value={formData.pickup_address}
              onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-300 pt-2 border-t border-white/[0.08]">
            <input
              type="checkbox"
              checked={formData.confirm_intact_tags}
              onChange={(e) => setFormData({ ...formData, confirm_intact_tags: e.target.checked })}
              className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-0"
            />
            <span>I confirm the items are in original condition with barcoded tags attached</span>
          </label>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/help-policies/returns"
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
            <span>{submitting ? "Booking..." : "Confirm Pickup Booking"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
