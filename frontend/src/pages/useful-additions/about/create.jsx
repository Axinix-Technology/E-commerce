import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Handshake, Save, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function PartnerInquiryPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    partnership_type: "Wholesale Distribution",
    investment_range: "₹10 Lakh - ₹25 Lakh",
    city: "",
    proposal: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.contact_person || !formData.email) {
      toast.error("Please fill in company name, contact person, and email");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Partnership inquiry submitted! Our corporate director will reach out.");
      navigate("/useful-additions/about");
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/useful-additions/about"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Enterprise Partnership Proposal</span>
          </h1>
          <p className="text-xs text-gray-400">Collaborate with Axinix for regional distribution or retail franchise</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Company / Entity Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Apparel Distributors"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Key Contact Person *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Kumar"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Corporate Email *</label>
              <input
                type="email"
                required
                placeholder="rajesh@apexapparel.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Direct Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Partnership Model</label>
              <select
                value={formData.partnership_type}
                onChange={(e) => setFormData({ ...formData, partnership_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              >
                <option value="Wholesale Distribution" className="bg-gray-900">Wholesale Distribution</option>
                <option value="Retail Franchise Store" className="bg-gray-900">Retail Franchise Store</option>
                <option value="Institutional Corporate Gifting" className="bg-gray-900">Institutional Corporate Gifting</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Target Territory / City</label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Karnataka"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Brief Proposal or Capabilities</label>
            <textarea
              rows={3}
              placeholder="Describe your current warehouse footprint, retail presence, or distribution network..."
              value={formData.proposal}
              onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/useful-additions/about"
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
            <span>{submitting ? "Submitting..." : "Send Proposal"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
