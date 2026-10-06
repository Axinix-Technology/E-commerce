import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BellRing, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Checkbox } from "../../../components/ui";

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
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/useful-additions/track-order?tracking=${encodeURIComponent(trackingParam)}`}
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-brand-token" />
            Subscribe to Live Tracking Alerts
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Receive instant milestone notifications on WhatsApp and SMS
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Order or Tracking Number"
          required
          placeholder="e.g. SO-20261003-8491"
          value={formData.tracking_code}
          onChange={(e) => setFormData({ ...formData, tracking_code: e.target.value })}
          className="font-mono uppercase text-xs"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mobile Phone (for WhatsApp/SMS)"
            type="tel"
            required
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="alex@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-token">
          <Checkbox
            label="Send me real-time delivery dispatches via WhatsApp"
            checked={formData.via_whatsapp}
            onChange={(e) => setFormData({ ...formData, via_whatsapp: e.target.checked })}
          />

          <Checkbox
            label="Send me SMS alerts when the package is Out for Delivery"
            checked={formData.via_sms}
            onChange={(e) => setFormData({ ...formData, via_sms: e.target.checked })}
          />
        </div>

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/useful-additions/track-order")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="sm"
            icon={BellRing}
            loading={submitting}
          >
            Activate Alerts
          </Button>
        </div>
      </form>
    </div>
  );
}
