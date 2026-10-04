import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Building2,
  Edit2,
  Save,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Globe,
  Receipt,
  ShieldCheck,
  CheckCircle2
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

export default function StoreSettingsPage() {
  const [company, setCompany] = useState(null);
  const [generalSettings, setGeneralSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, setRes] = await Promise.all([
        populateApi.read("company", { limit: 1 }),
        populateApi.read("general_setting", { limit: 50, sort: ["group", "key"] }),
      ]);

      if (compRes?.data && compRes.data.length > 0) {
        setCompany(compRes.data[0]);
      }
      if (setRes?.data) {
        setGeneralSettings(setRes.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load store settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Store & Company Profile</h1>
            <p className="text-xs text-text-muted">Organization identity, tax credentials, address, and localized store parameters</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
            title="Refresh Settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/settings/store/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
            Edit Store Details
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Store Name: <strong className="text-text-primary font-medium">{company?.name || "Axinix Store"}</strong></span>
        <span>•</span>
        <span>GST Registered: <strong className="text-emerald-400 font-medium">{company?.gst_no ? "Yes" : "—"}</strong></span>
        <span>•</span>
        <span>Default Currency: <strong className="text-text-primary font-medium">INR (₹)</strong></span>
        <span>•</span>
        <span>System Parameters: <strong className="text-primary font-medium">{formatQty(generalSettings.length)}</strong></span>
        <span>•</span>
        <span>Store Status: <strong className="text-emerald-400 font-medium">Active</strong></span>
      </div>

      {loading ? (
        <div className="py-24 text-center text-text-muted">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          Loading store configurations...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Organization Profile */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-5 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-primary" />
                  Legal & Operating Details
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Live Operating
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-muted block text-[11px]">Display Brand Name</span>
                  <span className="font-semibold text-text-primary text-sm">
                    {company?.name || "Axinix Luxury Boutique"}
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[11px]">Legal Entity Registered Name</span>
                  <span className="font-medium text-text-primary">
                    {company?.legal_name || company?.name || "Axinix Private Limited"}
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[11px]">GST Number / Tax ID</span>
                  <span className="font-mono font-medium text-emerald-400">
                    {company?.gst_no || "27AADCA1122B1Z8"}
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[11px]">Store Website</span>
                  <span className="text-primary hover:underline">
                    {company?.website_url || "https://axinix.store"}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40 space-y-2 text-xs">
                <span className="text-text-muted block text-[11px]">Registered Headquarters & Counter Address</span>
                <div className="flex items-start gap-2 text-text-primary">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div>{company?.address_line_1 || "101, Silk Palace, Commercial Hub"}</div>
                    {company?.address_line_2 && <div>{company.address_line_2}</div>}
                    <div>
                      {company?.city || "Mumbai"}, {company?.state || "Maharashtra"} - {company?.pincode || "400001"}
                    </div>
                    <div>{company?.country || "India"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* General System & Currency Configuration */}
            <div className="p-5 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
                <Receipt className="w-4 h-4 text-primary" />
                Store Parameters & Formatting
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-text-muted font-medium">
                      <th className="pb-2">Group</th>
                      <th className="pb-2">Key Parameter</th>
                      <th className="pb-2">Value</th>
                      <th className="pb-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-text-primary">
                    {generalSettings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-text-muted">
                          Default system configuration active (INR, 18% GST).
                        </td>
                      </tr>
                    ) : (
                      generalSettings.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 capitalize text-text-muted">{s.group}</td>
                          <td className="py-2.5 font-mono text-primary">{s.key}</td>
                          <td className="py-2.5 font-semibold text-emerald-400">{s.value}</td>
                          <td className="py-2.5 text-text-muted">{s.description || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Fast Contact & Social */}
          <div className="space-y-5">
            <div className="p-5 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
                <Globe className="w-4 h-4 text-primary" />
                Support & Contact Outlets
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-text-muted" />
                  <div>
                    <div className="text-[11px] text-text-muted">Counter Hotline</div>
                    <div className="font-medium text-text-primary">+91 98765 00000</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <div>
                    <div className="text-[11px] text-text-muted">Support Email</div>
                    <div className="font-medium text-text-primary">support@axinix.store</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-text-muted" />
                  <div>
                    <div className="text-[11px] text-text-muted">Instagram Profile</div>
                    <div className="text-primary hover:underline">
                      {company?.instagram_url || "@axinix.official"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/40">
                <Link
                  to="/settings/store/create"
                  className="block text-center py-2 rounded-xl bg-surface-card hover:bg-surface-card/80 border border-border/60 text-text-primary text-xs font-medium transition-colors"
                >
                  Modify Store Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
