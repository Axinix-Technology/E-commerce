import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BellRing, Save } from "lucide-react";
import toast from "react-hot-toast";

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/shopping/search?q=${encodeURIComponent(queryParam)}`}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Create Saved Search Alert</span>
          </h1>
          <p className="text-xs text-gray-400">
            Get automated SMS and email notifications when matching inventory is restocked or discounted
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Keywords / Product Search Term *</label>
            <input
              type="text"
              required
              placeholder="e.g. Linen Shirt, Pashmina Stole"
              value={formData.keyword}
              onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Maximum Budget (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={formData.max_price}
              onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email or Mobile Number for Alerts *</label>
            <input
              type="text"
              required
              placeholder="alex@example.com or +91 9876543210"
              value={formData.email_or_phone}
              onChange={(e) => setFormData({ ...formData, email_or_phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={formData.notify_on_restock}
                onChange={(e) => setFormData({ ...formData, notify_on_restock: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-0"
              />
              <span>Notify me immediately when new stock arrives</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={formData.notify_on_discount}
                onChange={(e) => setFormData({ ...formData, notify_on_discount: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-0"
              />
              <span>Notify me when matching items go on promotional sale</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Activate Search Alert"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
