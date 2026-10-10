import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Save } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Textarea } from "../../../components/ui";

export default function CreateHeroBannerPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    badge_text: "NEW ARRIVAL",
    image_url: "",
    cta_text: "Shop Collection",
    cta_link: "/shopping/products",
    display_order: 1,
    is_active: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Banner title is required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("hero_banner", {
        ...formData,
        status: 1,
      });
      toast.success("Hero Banner created successfully!");
      navigate("/shopping/home");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to create banner");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/shopping/home"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-token" />
            Create Storefront Banner
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Configure new promotional showcase sliders and marketing cards
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Banner Title"
          required
          placeholder="e.g. Autumn Couture 2026"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <Textarea
          label="Subtitle / Tagline"
          rows={3}
          placeholder="Precision tailored luxury with statutory GST billing..."
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Badge Text"
            placeholder="e.g. SPECIAL OFFER"
            value={formData.badge_text}
            onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
          />

          <Input
            label="Display Order"
            type="number"
            min={0}
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
          />
        </div>

        <Input
          label="Image Asset URL"
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Button Text"
            value={formData.cta_text}
            onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
          />

          <Input
            label="Target Link"
            value={formData.cta_link}
            onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
          />
        </div>

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/shopping/home")}
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
            Publish Banner
          </Button>
        </div>
      </form>
    </div>
  );
}
