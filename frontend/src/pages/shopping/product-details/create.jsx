import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Sliders, Save, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={productId ? `/shopping/product-details?id=${productId}` : "/shopping/products"}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Custom Sizing & Bespoke Request</span>
          </h1>
          <p className="text-xs text-gray-400">
            Submit your precise anatomical measurements for made-to-measure tailoring
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
            Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider pt-3 border-t border-white/[0.08]">
            Measurements (Inches)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Chest / Bust</label>
              <input
                type="text"
                placeholder='e.g. 40"'
                value={formData.chest_bust}
                onChange={(e) => setFormData({ ...formData, chest_bust: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Waist</label>
              <input
                type="text"
                placeholder='e.g. 34"'
                value={formData.waist}
                onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Hips</label>
              <input
                type="text"
                placeholder='e.g. 42"'
                value={formData.hips}
                onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Inseam</label>
              <input
                type="text"
                placeholder='e.g. 32"'
                value={formData.inseam_length}
                onChange={(e) => setFormData({ ...formData, inseam_length: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Fit Preference</label>
              <select
                value={formData.preferred_fit}
                onChange={(e) => setFormData({ ...formData, preferred_fit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              >
                <option value="Slim Fit" className="bg-gray-900">Slim / Tailored Fit</option>
                <option value="Regular Fit" className="bg-gray-900">Regular / Classic Fit</option>
                <option value="Relaxed Fit" className="bg-gray-900">Relaxed / Comfort Fit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Special Alteration Notes</label>
              <textarea
                rows={3}
                placeholder="Mention specific collar preferences, cuff styling, or monograms..."
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Submitting..." : "Submit Bespoke Request"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
