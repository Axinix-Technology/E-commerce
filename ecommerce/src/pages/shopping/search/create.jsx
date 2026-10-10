import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BellRing, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Checkbox } from "../../../components/ui";

export default function CreateSearchAlertPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    keyword: queryParam,
    max_price: "",
    email_or_phone: "",
    notify_on_restock: true,
    notify_on_discount: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.keyword || !formData.email_or_phone) {
      toast.error("Search keyword and contact notification channel are required");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Search alert saved! We'll notify you on new arrivals for "${formData.keyword}".`);
      navigate(`/shopping/search?q=${encodeURIComponent(formData.keyword)}`);
    }, 600);
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/shopping/search?q=${encodeURIComponent(queryParam)}`}
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-brand-token" />
            Create Saved Search Alert
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Get automated SMS and email notifications when matching inventory is restocked or discounted
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Keywords / Product Search Term"
          required
          placeholder="e.g. Linen Shirt, Pashmina Stole"
          value={formData.keyword}
          onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
        />

        <Input
          label="Maximum Budget (₹)"
          type="number"
          placeholder="e.g. 5000"
          value={formData.max_price}
          onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
        />

        <Input
          label="Email or Mobile Number for Alerts"
          required
          placeholder="alex@example.com or +91 9876543210"
          value={formData.email_or_phone}
          onChange={(e) => setFormData({ ...formData, email_or_phone: e.target.value })}
        />

        <div className="space-y-2 pt-2 border-t border-token">
          <Checkbox
            label="Notify me immediately when new stock arrives"
            checked={formData.notify_on_restock}
            onChange={(e) => setFormData({ ...formData, notify_on_restock: e.target.checked })}
          />

          <Checkbox
            label="Notify me when matching items go on promotional sale"
            checked={formData.notify_on_discount}
            onChange={(e) => setFormData({ ...formData, notify_on_discount: e.target.checked })}
          />
        </div>

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/shopping/search?q=${encodeURIComponent(queryParam)}`)}
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
            Activate Search Alert
          </Button>
        </div>
      </form>
    </div>
  );
}
