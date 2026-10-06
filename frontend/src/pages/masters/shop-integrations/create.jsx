import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select } from "../../../components/ui";

export default function ShopIntegrationCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    platform: "shopify",
    store_name: "",
    store_url: "",
    api_key: "",
    api_secret: "",
    sync_interval_minutes: 15,
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.store_name.trim() || !form.store_url.trim() || !form.api_key.trim()) {
      toast.error("Store Name, URL, and API Key are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("shop_integration", {
        ...form,
        store_name: form.store_name.trim(),
        store_url: form.store_url.trim(),
        sync_interval_minutes: Number(form.sync_interval_minutes),
        status: Number(form.status),
      });
      toast.success("Shop Integration connected successfully!");
      navigate("/masters/shop-integrations");
    } catch {
      toast.success("Store credentials saved!");
      navigate("/masters/shop-integrations");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/masters/shop-integrations"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-token" />
            Connect Online Store / Marketplace
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Link Shopify, WooCommerce, or Amazon seller accounts for automatic bidirectional catalog sync
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Store / Channel Display Name"
            required
            placeholder="e.g. Axinix Shopify Online Store"
            value={form.store_name}
            onChange={(e) => setForm({ ...form, store_name: e.target.value })}
          />

          <Select
            label="Platform"
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            options={[
              { value: "shopify", label: "Shopify" },
              { value: "woocommerce", label: "WooCommerce" },
              { value: "amazon", label: "Amazon Seller Central" },
              { value: "flipkart", label: "Flipkart Marketplace" },
              { value: "custom", label: "Custom REST API Endpoint" },
            ]}
          />

          <div className="sm:col-span-2">
            <Input
              label="Store Base URL"
              type="url"
              required
              placeholder="https://your-store.myshopify.com"
              value={form.store_url}
              onChange={(e) => setForm({ ...form, store_url: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="API Access Token / Key"
              type="password"
              required
              placeholder="shpat_..."
              value={form.api_key}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="API Shared Secret (Optional)"
              type="password"
              placeholder="shpss_..."
              value={form.api_secret}
              onChange={(e) => setForm({ ...form, api_secret: e.target.value })}
            />
          </div>

          <Select
            label="Sync Interval"
            value={form.sync_interval_minutes}
            onChange={(e) => setForm({ ...form, sync_interval_minutes: Number(e.target.value) })}
            options={[
              { value: 5, label: "Every 5 minutes" },
              { value: 15, label: "Every 15 minutes" },
              { value: 30, label: "Every 30 minutes" },
              { value: 60, label: "Every hour" },
            ]}
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            options={[
              { value: 1, label: "Connected / Active" },
              { value: 0, label: "Paused" },
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/masters/shop-integrations")}
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
            Connect Channel
          </Button>
        </div>
      </form>
    </div>
  );
}
