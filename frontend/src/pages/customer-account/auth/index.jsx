import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Lock, Mail, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomerSignInPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      toast.error("Please enter email/phone and password");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("customer_token", "demo_jwt_token_retail_user");
      localStorage.setItem(
        "customer_user",
        JSON.stringify({
          name: "Alex Mercer",
          email: formData.identifier,
          customer_type: "b2c",
        })
      );
      toast.success("Welcome back, Alex!");
      navigate("/customer-account/profile");
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.2)] text-[var(--brand-primary)] flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Customer Portal</h1>
        <p className="text-xs text-gray-400">Sign in to track orders, manage addresses & tax invoices</p>
      </div>

      <form onSubmit={handleSignIn} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Email or Mobile Phone</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="alex@example.com or +91 9876543210"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-300">Password</label>
            <Link
              to="/customer-account/reset-password"
              className="text-[11px] text-[var(--brand-primary)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          <span>{loading ? "Verifying..." : "Sign In to Account"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-4 border-t border-white/[0.08] text-center">
          <p className="text-xs text-gray-400">
            Don't have an account yet?{" "}
            <Link
              to="/customer-account/auth/create"
              className="text-[var(--brand-primary)] hover:underline font-semibold"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
