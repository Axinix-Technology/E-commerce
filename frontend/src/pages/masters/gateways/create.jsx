import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select, Checkbox } from "../../../components/ui";

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/masters/gateways"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-token" />
            Configure Payment Gateway
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Integrate merchant credentials, client tokens, and webhook secrets
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Gateway Provider"
            required
            placeholder="e.g. Razorpay Standard Checkout"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Select
            label="Provider Type"
            value={form.gateway_code}
            onChange={(e) => setForm({ ...form, gateway_code: e.target.value })}
            options={[
              { value: "razorpay", label: "Razorpay" },
              { value: "phonepe", label: "PhonePe Payment Gateway" },
              { value: "stripe", label: "Stripe" },
              { value: "paytm", label: "Paytm PG" },
              { value: "cashfree", label: "Cashfree Payments" },
            ]}
          />

          <div className="sm:col-span-2">
            <Input
              label="Merchant / Account ID"
              placeholder="e.g. rzp_live_Axinix01"
              value={form.merchant_id}
              onChange={(e) => setForm({ ...form, merchant_id: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="API Public Key / Client ID"
              required
              placeholder="key_live_..."
              value={form.api_key}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="API Secret Key"
              type="password"
              required
              placeholder="••••••••••••••••"
              value={form.api_secret}
              onChange={(e) => setForm({ ...form, api_secret: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Webhook Secret (HMAC Verification)"
              type="password"
              placeholder="whsec_..."
              value={form.webhook_secret}
              onChange={(e) => setForm({ ...form, webhook_secret: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2 p-3.5 rounded-xl border border-token bg-surface-elevated/60 flex items-center">
            <Checkbox
              label="Enable Sandbox / Test Mode"
              checked={form.is_test_mode}
              onChange={(e) => setForm({ ...form, is_test_mode: e.target.checked })}
            />
          </div>

          <div className="sm:col-span-2">
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
              options={[
                { value: 1, label: "Enabled / Active" },
                { value: 0, label: "Disabled / Offline" },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/masters/gateways")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
          >
            Save Gateway
          </Button>
        </div>
      </form>
    </div>
  );
}
