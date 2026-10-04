import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Globe,
  Receipt
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

// Rule 1: Zero values rendered as em-dash
const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

const formatCurrency = (val) => {
  const num = Number(val);
  return !num || num === 0
    ? "—"
    : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

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
        if (res?.data && res.data.length > 0) {
          const comp = res.data[0];
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
    e.preventDefault();
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/settings/store"
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Edit Store Profile</h1>
            <p className="text-xs text-text-muted">Update legal corporate details, brand name, and operating locations</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Saving..." : "Save Store Details"}
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Store Brand: <strong className="text-primary font-medium">{formData.name || "—"}</strong></span>
        <span>•</span>
        <span>Location: <strong className="text-text-primary font-medium">{formData.city || "—"}, {formData.state || "—"}</strong></span>
        <span>•</span>
        <span>Tax Status: <strong className="text-emerald-400 font-medium">{formData.gst_no ? "GSTIN Verified" : "—"}</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5">
        <div className="p-5 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-primary" />
            Identification & Brand
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Display Brand Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Axinix Luxury Boutique"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Legal Entity Registered Name *
              </label>
              <input
                type="text"
                required
                value={formData.legal_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, legal_name: e.target.value }))}
                placeholder="e.g. Axinix Retail Private Limited"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                GSTIN / Tax Registration ID
              </label>
              <input
                type="text"
                value={formData.gst_no}
                onChange={(e) => setFormData((prev) => ({ ...prev, gst_no: e.target.value }))}
                placeholder="27AADCA1122B1Z8"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Official Website URL
              </label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://axinix.store"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="p-5 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-primary" />
            Operating Store Address
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                value={formData.address_line_1}
                onChange={(e) => setFormData((prev) => ({ ...prev, address_line_1: e.target.value }))}
                placeholder="Shop No. 101, Silk Palace"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Mumbai"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                placeholder="Maharashtra"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Pincode / Postal Code *
              </label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                placeholder="400001"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? "Updating Store..." : "Confirm & Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
