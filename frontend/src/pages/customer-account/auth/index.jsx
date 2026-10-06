import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Lock, Mail, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

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
        <div className="w-12 h-12 rounded-2xl bg-brand-token/10 border border-brand-token/20 text-brand-token flex items-center justify-center mx-auto shadow-xs">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-primary-token tracking-tight">Customer Portal</h1>
        <p className="text-xs text-muted-token">Sign in to track orders, manage addresses & tax invoices</p>
      </div>

      <form onSubmit={handleSignIn} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-4">
        <Input
          label="Email or Mobile Phone"
          type="text"
          required
          icon={Mail}
          placeholder="alex@example.com or +91 9876543210"
          value={formData.identifier}
          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary-token">Password</span>
            <Link
              to="/customer-account/reset-password"
              className="text-[11px] text-brand-token hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            required
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <Button
          type="submit"
          variant="secondary"
          size="md"
          loading={loading}
          fullWidth
          rightIcon={ArrowRight}
          className="mt-2"
        >
          {loading ? "Verifying..." : "Sign In to Account"}
        </Button>

        <div className="pt-4 border-t border-token text-center">
          <p className="text-xs text-muted-token">
            Don't have an account yet?{" "}
            <Link
              to="/customer-account/auth/create"
              className="text-brand-token hover:underline font-semibold"
            >
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
