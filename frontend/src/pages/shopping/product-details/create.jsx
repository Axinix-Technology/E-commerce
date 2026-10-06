import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sliders, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function CustomSizingRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    email: "",
    chest_bust: "",
    waist: "",
    hips: "",
    inseam_length: "",
    preferred_fit: "Slim Fit",
    special_instructions: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.phone) {
      toast.error("Name and contact phone are required");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Bespoke custom sizing specifications received! Our master tailor will contact you.");
      navigate(productId ? `/shopping/product-details?id=${productId}` : "/shopping/products");
    }, 600);
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={productId ? `/shopping/product-details?id=${productId}` : "/shopping/products"}
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-token" />
            Custom Sizing & Bespoke Request
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Submit your precise anatomical measurements for made-to-measure tailoring
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-5">
        <div>
          <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider mb-4">
            Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            />

            <Input
              label="Mobile Phone"
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <div className="sm:col-span-2">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-token">
          <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider mb-4">
            Measurements (Inches)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Chest / Bust"
              placeholder='e.g. 40"'
              value={formData.chest_bust}
              onChange={(e) => setFormData({ ...formData, chest_bust: e.target.value })}
              className="font-mono text-xs"
            />

            <Input
              label="Waist"
              placeholder='e.g. 34"'
              value={formData.waist}
              onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
              className="font-mono text-xs"
            />

            <Input
              label="Hips"
              placeholder='e.g. 42"'
              value={formData.hips}
              onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
              className="font-mono text-xs"
            />

            <Input
              label="Inseam"
              placeholder='e.g. 32"'
              value={formData.inseam_length}
              onChange={(e) => setFormData({ ...formData, inseam_length: e.target.value })}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-4 pt-4">
            <Select
              label="Fit Preference"
              value={formData.preferred_fit}
              onChange={(e) => setFormData({ ...formData, preferred_fit: e.target.value })}
              options={[
                { value: "Slim Fit", label: "Slim / Tailored Fit" },
                { value: "Regular Fit", label: "Regular / Classic Fit" },
                { value: "Relaxed Fit", label: "Relaxed / Comfort Fit" },
              ]}
            />

            <Textarea
              label="Special Alteration Notes"
              rows={3}
              placeholder="Mention specific collar preferences, cuff styling, or monograms..."
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate(productId ? `/shopping/product-details?id=${productId}` : "/shopping/products")}
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
            Submit Bespoke Request
          </Button>
        </div>
      </form>
    </div>
  );
}
