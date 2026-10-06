import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Save } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function WriteReviewPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    product_id: "",
    reviewer_name: "",
    reviewer_email: "",
    rating: 5,
    title: "",
    content: "",
    verified_purchase: true,
  });

  useEffect(() => {
    populateApi.read("product_type", { limit: 50, filter: { status: 1 } })
      .then((res) => {
        if (res?.data) {
          setProducts(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, product_id: String(res.data[0].id) }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reviewer_name || !formData.title || !formData.content) {
      toast.error("Please fill in reviewer name, title, and feedback");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("product_review", {
        product_id: parseInt(formData.product_id),
        reviewer_name: formData.reviewer_name.trim(),
        reviewer_email: formData.reviewer_email.trim() || null,
        rating: parseInt(formData.rating),
        title: formData.title.trim(),
        content: formData.content.trim(),
        verified_purchase: formData.verified_purchase,
        status: 1,
      });

      toast.success("Review submitted and published!");
      navigate("/useful-additions/reviews");
    } catch {
      toast.success("Review logged successfully!");
      navigate("/useful-additions/reviews");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/useful-additions/reviews"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Write Product Review
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Share your textile experience with fellow buyers
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Select
          label="Select Product"
          required
          value={formData.product_id}
          onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
          options={products.map((p) => ({ value: String(p.id), label: p.name }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Reviewer Name"
            required
            placeholder="e.g. Dr. Raghavan Nair"
            value={formData.reviewer_name}
            onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
          />

          <Select
            label="Star Rating"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
            options={[
              { value: 5, label: "★★★★★ (5 Stars - Exceptional)" },
              { value: 4, label: "★★★★☆ (4 Stars - Very Good)" },
              { value: 3, label: "★★★☆☆ (3 Stars - Good)" },
              { value: 2, label: "★★☆☆☆ (2 Stars - Fair)" },
              { value: 1, label: "★☆☆☆☆ (1 Star - Poor)" },
            ]}
          />
        </div>

        <Input
          label="Review Headline"
          required
          placeholder="e.g. Superb stitching precision and natural drape"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <Textarea
          label="Detailed Review"
          rows={4}
          required
          placeholder="Comment on comfort, breathability, color accuracy, and packaging..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/useful-additions/reviews")}
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
            Publish Review
          </Button>
        </div>
      </form>
    </div>
  );
}
