import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function CustomerSignUpPage() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_type: "b2c",
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    company_name: "",
    gstin: "",
    city: "",
    state_id: "",
    pincode: "",
  });

  useEffect(() => {
    populateApi.read("state_master", { limit: 50, sort: ["name"] })
      .then((res) => {
        if (res?.data) {
          setStates(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, state_id: String(res.data[0].id) }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      toast.error("Please fill in full name, phone number, and password");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      // Create CustomerMaster record
      await populateApi.create("customer_master", {
        customer_type: formData.customer_type,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        company_name: formData.customer_type === "b2b" ? formData.company_name.trim() : null,
        gstin: formData.customer_type === "b2b" ? formData.gstin.trim().toUpperCase() : null,
        city: formData.city.trim() || null,
        state_id: formData.state_id ? parseInt(formData.state_id) : null,
        pincode: formData.pincode.trim() || null,
        status: 1,
      });

      localStorage.setItem("customer_token", "demo_jwt_token_retail_user");
      localStorage.setItem(
        "customer_user",
        JSON.stringify({
          name: formData.name,
          email: formData.email || formData.phone,
          customer_type: formData.customer_type,
        })
      );

      toast.success("Account created successfully! Welcome to Axinix.");
      navigate("/customer-account/profile");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to create customer account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/customer-account/auth"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Create Customer Account</span>
          </h1>
          <p className="text-xs text-gray-400">Register as a retail consumer or verified B2B wholesale partner</p>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        {/* Type toggle */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
          <span className="text-xs font-semibold text-gray-300 pl-2">Account Type</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, customer_type: "b2c" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                formData.customer_type === "b2c"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Retail Consumer
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, customer_type: "b2b" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                formData.customer_type === "b2b"
                  ? "bg-[var(--brand-primary)] text-white shadow-xs"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Business (B2B)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Mercer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          {formData.customer_type === "b2b" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.08]">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Company Trade Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mercer Retail Pvt Ltd"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">GSTIN Number *</label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="27AAACM1234F1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono uppercase"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <Link to="/customer-account/auth" className="text-xs text-gray-400 hover:underline">
            Already have an account? Sign in
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? "Registering..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
