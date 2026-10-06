import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Globe,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input } from "../../../components/ui";

export default function EditStoreSettingsPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    legal_name: "",
    short_name: "",
    gst_no: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    website_url: "",
    instagram_url: "",
  });

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const res = await populateApi.read("company", { limit: 1 });
        const list = Array.isArray(res) ? res : res?.data || [];
        if (list.length > 0) {
          const comp = list[0];
          setCompanyId(comp.id);
          setFormData({
            name: comp.name || "",
            legal_name: comp.legal_name || "",
            short_name: comp.short_name || "",
            gst_no: comp.gst_no || "",
            address_line_1: comp.address_line_1 || "",
            address_line_2: comp.address_line_2 || "",
            city: comp.city || "",
            state: comp.state || "",
            country: comp.country || "India",
            pincode: comp.pincode || "",
            website_url: comp.website_url || "",
            instagram_url: comp.instagram_url || "",
          });
        }
      } catch (err) {
        console.error("Failed loading company profile", err);
      }
    };

    loadCompany();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      if (companyId) {
        await populateApi.update("company", companyId, formData);
      } else {
        await populateApi.create("company", { ...formData, status: 1 });
      }
      toast.success("Store profile updated successfully!");
      navigate("/settings/store");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to update store settings");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/settings/store"
            className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
              <Store className="w-5 h-5 text-brand-token" />
              Configure Store & Company
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Update legal organization credentials, tax numbers, and communication channels
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Save}
          loading={submitting}
          onClick={handleSubmit}
        >
          Save Configuration
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Brand Identity */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-brand-token" />
            Brand & Legal Identity
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Store Display Name"
              required
              fieldType="name"
              placeholder="e.g. Axinix Couture"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />

            <Input
              label="Official Legal Entity Name"
              placeholder="e.g. Axinix Retail Private Limited"
              fieldType="name"
              value={formData.legal_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, legal_name: e.target.value }))}
            />

            <Input
              label="Brand Short Code"
              placeholder="e.g. AXN"
              fieldType="code"
              value={formData.short_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, short_name: e.target.value.toUpperCase() }))}
            />

            <Input
              label="GSTIN / Corporate Tax ID"
              placeholder="e.g. 33AAAAA0000A1Z5"
              fieldType="gstin"
              value={formData.gst_no}
              onChange={(e) => setFormData((prev) => ({ ...prev, gst_no: e.target.value.toUpperCase() }))}
            />
          </div>
        </div>

        {/* Operating Address */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-brand-token" />
            Registered Business Address
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Address Line 1"
              placeholder="Door No., Street..."
              value={formData.address_line_1}
              onChange={(e) => setFormData((prev) => ({ ...prev, address_line_1: e.target.value }))}
            />

            <Input
              label="Address Line 2"
              placeholder="Locality, Landmark..."
              value={formData.address_line_2}
              onChange={(e) => setFormData((prev) => ({ ...prev, address_line_2: e.target.value }))}
            />

            <Input
              label="City / Town"
              placeholder="e.g. Chennai"
              value={formData.city}
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
            />

            <Input
              label="State / Province"
              placeholder="e.g. Tamil Nadu"
              value={formData.state}
              onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
            />

            <Input
              label="Postal Pincode"
              placeholder="600006"
              fieldType="pincode"
              value={formData.pincode}
              onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
            />

            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
            />
          </div>
        </div>

        {/* Digital Channels */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
            <Globe className="w-4 h-4 text-brand-token" />
            Online Web & Social Channels
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Official Website URL"
              type="url"
              fieldType="url"
              placeholder="https://axinix.com"
              value={formData.website_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
            />

            <Input
              label="Instagram Profile"
              placeholder="https://instagram.com/axinix"
              value={formData.instagram_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, instagram_url: e.target.value }))}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
