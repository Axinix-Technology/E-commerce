import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, User } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [states, setStates] = useState([]);

  const [formData, setFormData] = useState({
    name: "Alex Mercer",
    phone: "+91 9876543210",
    email: "alex@example.com",
    customer_type: "b2c",
    company_name: "Mercer Retail Enterprises",
    gstin: "27AAACM1234F1Z5",
    city: "Mumbai",
    state_id: "",
    pincode: "400050",
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("customer_user") || "null");
    if (stored) {
      setFormData((prev) => ({ ...prev, ...stored }));
    }

    populateApi.read("state_master", { limit: 50, sort: ["name"] })
      .then((res) => {
        if (res?.data) {
          setStates(res.data);
          if (res.data.length > 0 && !formData.state_id) {
            setFormData((prev) => ({ ...prev, state_id: String(res.data[0].id) }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      localStorage.setItem("customer_user", JSON.stringify(formData));
      toast.success("Profile credentials updated successfully!");
      navigate("/customer-account/profile");
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/customer-account/profile"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Edit Profile & Tax Credentials</span>
          </h1>
          <p className="text-xs text-gray-400">Update statutory invoicing details and contact preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
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
            B2B Commercial Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Company / Trade Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">GSTIN Number</label>
              <input
                type="text"
                maxLength={15}
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">PIN Code</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/customer-account/profile"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
