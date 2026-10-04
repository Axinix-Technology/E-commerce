import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CompanySettingsCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    legal_name: "Axinix Silk & Handlooms Private Limited",
    trade_name: "Axinix Textiles",
    gstin: "33AAACA1234F1Z8",
    pan: "AAACA1234F",
    cin: "U17111TN2026PTC109922",
    email: "corporate@axinixtextiles.com",
    phone: "+91 44 2815 9900",
    registered_address: "No. 42, Usman Road, T. Nagar, Chennai - 600017, Tamil Nadu, India",
    bank_name: "HDFC Bank Ltd",
    bank_account: "50200088991122",
    ifsc: "HDFC0000128",
    branch: "T. Nagar Branch, Chennai",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Company profile and statutory tax credentials updated!");
      navigate("/settings/company");
    }, 600);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/settings/company" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-accent-primary" />
            Update Company Legal Profile
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Edit tax registration details, corporate billing credentials, and bank payout coordinates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Legal Registered Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.legal_name}
              onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Trade / Brand Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.trade_name}
              onChange={(e) => setForm({ ...form, trade_name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              GSTIN <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">PAN Number</label>
            <input
              type="text"
              value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">CIN Number</label>
            <input
              type="text"
              value={form.cin}
              onChange={(e) => setForm({ ...form, cin: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Official Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Official Telephone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Registered Office Address <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            required
            value={form.registered_address}
            onChange={(e) => setForm({ ...form, registered_address: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="pt-2 border-t border-border/30 space-y-3">
          <h3 className="text-xs font-bold text-text-primary">Bank Account Coordinates</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Bank Name</label>
              <input
                type="text"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Account Number</label>
              <input
                type="text"
                value={form.bank_account}
                onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">IFSC Code</label>
              <input
                type="text"
                value={form.ifsc}
                onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Branch Name</label>
              <input
                type="text"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/settings/company" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Updating..." : "Save Company Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
