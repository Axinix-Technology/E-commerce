import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Save, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function SubmitFaqQuestionPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "Orders & Shipping",
    question: "",
    context: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.email.trim()) {
      toast.error("Please provide your email and question");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Question submitted! Our support team will answer your query directly.");
      navigate("/help-policies/faq");
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/help-policies/faq"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Ask a Question</span>
          </h1>
          <p className="text-xs text-gray-400">Can't find the answer you need? Submit your question below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="Alex Mercer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            >
              <option value="Orders & Shipping" className="bg-gray-900">Orders & Shipping</option>
              <option value="Returns & Refunds" className="bg-gray-900">Returns & Refunds</option>
              <option value="Statutory GST & Invoicing" className="bg-gray-900">Statutory GST & Invoicing</option>
              <option value="Account & Security" className="bg-gray-900">Account & Security</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Your Question *</label>
            <input
              type="text"
              required
              placeholder="e.g. Can I request a Sunday express delivery in Mumbai?"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Additional Context</label>
            <textarea
              rows={3}
              placeholder="Provide any order references or specific requirements..."
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/help-policies/faq"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Sending..." : "Submit Question"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
