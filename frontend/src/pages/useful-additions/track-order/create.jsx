import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BellRing, Save, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SubscribeTrackingAlertPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackingParam = searchParams.get("tracking") || "";

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tracking_code: trackingParam,
    phone: "",
    email: "",
    via_whatsapp: true,
    via_sms: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tracking_code || !formData.phone) {
      toast.error("Tracking order code and phone number are required");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Live alerts subscribed for ${formData.tracking_code} via WhatsApp & SMS!`);
      navigate(`/useful-additions/track-order?tracking=${encodeURIComponent(formData.tracking_code)}`);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/useful-additions/track-order?tracking=${encodeURIComponent(trackingParam)}`}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Subscribe to Live Tracking Alerts</span>
          </h1>
          <p className="text-xs text-gray-400">Receive instant milestone notifications on WhatsApp and SMS</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Order or Tracking Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. SO-20261003-8491"
              value={formData.tracking_code}
              onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone (for WhatsApp/SMS) *</label>
              <input
                type="tel"
                required
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={formData.via_whatsapp}
                onChange={(e) => setFormData({ ...formData, via_whatsapp: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-0"
              />
              <span>Send me real-time delivery dispatches via WhatsApp</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={formData.via_sms}
                onChange={(e) => setFormData({ ...formData, via_sms: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-0"
              />
              <span>Send me SMS alerts when the package is Out for Delivery</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/useful-additions/track-order"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <BellRing className="w-4 h-4" />
            <span>{submitting ? "Subscribing..." : "Activate Alerts"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
