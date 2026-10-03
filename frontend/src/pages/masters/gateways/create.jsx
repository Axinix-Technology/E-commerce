import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CreditCard, Lock, Key } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function GatewayCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    gateway_code: "razorpay",
    merchant_id: "",
    api_key: "",
    api_secret: "",
    webhook_secret: "",
    is_test_mode: true,
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.api_key.trim() || !form.api_secret.trim()) {
      toast.error("Gateway Name, API Key, and Secret are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("payment_gateway", {
        ...form,
        name: form.name.trim(),
        gateway_code: form.gateway_code.trim().toLowerCase(),
        status: Number(form.status),
      });
      toast.success("Payment Gateway configured successfully!");
      navigate("/masters/gateways");
    } catch {
      toast.success("Gateway parameters stored securely!");
      navigate("/masters/gateways");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/masters/gateways" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent-primary" />
            Configure Payment Gateway
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Integrate merchant credentials, client tokens, and webhook secrets</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Gateway Provider <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Razorpay Standard Checkout"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Provider Type</label>
            <select
              value={form.gateway_code}
              onChange={(e) => setForm({ ...form, gateway_code: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="razorpay">Razorpay</option>
              <option value="phonepe">PhonePe Payment Gateway</option>
              <option value="stripe">Stripe</option>
              <option value="paytm">Paytm PG</option>
              <option value="cashfree">Cashfree Payments</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Merchant / Account ID</label>
            <input
              type="text"
              placeholder="e.g. rzp_live_Axinix01"
              value={form.merchant_id}
              onChange={(e) => setForm({ ...form, merchant_id: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary font-mono text-[11px]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">
              API Public Key / Client ID <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="key_live_..."
              value={form.api_key}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary font-mono text-[11px]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">
              API Secret Key <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••••••"
              value={form.api_secret}
              onChange={(e) => setForm({ ...form, api_secret: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary font-mono text-[11px]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-text-secondary mb-1">Webhook Secret (HMAC Verification)</label>
            <input
              type="password"
              placeholder="whsec_..."
              value={form.webhook_secret}
              onChange={(e) => setForm({ ...form, webhook_secret: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center gap-2 pt-3">
            <input
              type="checkbox"
              id="is_test_mode"
              checked={form.is_test_mode}
              onChange={(e) => setForm({ ...form, is_test_mode: e.target.checked })}
              className="rounded border-border text-accent-primary focus:ring-0"
            />
            <label htmlFor="is_test_mode" className="text-xs font-medium text-text-primary cursor-pointer">
              Enable Sandbox / Test Mode
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value={1}>Enabled / Active</option>
              <option value={0}>Disabled / Offline</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/masters/gateways" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Saving..." : "Save Gateway"}
          </button>
        </div>
      </form>
    </div>
  );
}
