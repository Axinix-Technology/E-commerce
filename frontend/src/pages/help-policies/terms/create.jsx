import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function AcknowledgeTermsPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    business_name: "",
    representative_name: "",
    gstin: "",
    agreed_to_terms: false,
    agreed_to_itc: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.business_name || !formData.representative_name) {
      toast.error("Business name and authorized representative name are required");
      return;
    }
    if (!formData.agreed_to_terms) {
      toast.error("You must agree to the statutory commercial terms");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Statutory B2B commercial agreement acknowledged and logged!");
      navigate("/help-policies/terms");
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/help-policies/terms"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Statutory Commercial Acknowledgment</span>
          </h1>
          <p className="text-xs text-gray-400">Formal agreement for enterprise B2B purchasing and GSTR compliance</p>
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
                placeholder="e.g. Mercer Retail Pvt Ltd"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Authorized Signatory Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Mercer"
                value={formData.representative_name}
                onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">GSTIN Identifier (Optional)</label>
            <input
              type="text"
              maxLength={15}
              placeholder="33AAACM1234F1Z5"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono uppercase"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.08]">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                required
                checked={formData.agreed_to_terms}
                onChange={(e) => setFormData({ ...formData, agreed_to_terms: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-0"
              />
              <span>I agree to statutory commercial terms and exclusive Coimbatore jurisdiction</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-300">
              <input
                type="checkbox"
                checked={formData.agreed_to_itc}
                onChange={(e) => setFormData({ ...formData, agreed_to_itc: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-0"
              />
              <span>I confirm GSTIN supplied is active and entitled to Input Tax Credit</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/help-policies/terms"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? "Signing..." : "Acknowledge Terms"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
