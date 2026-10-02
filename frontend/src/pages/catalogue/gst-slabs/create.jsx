import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgePercent,
  Save,
  Calculator
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function GstFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    rate: "",
    cgst_rate: "",
    sgst_rate: "",
    igst_rate: "",
    description: "",
  });

  useEffect(() => {
    if (isEditing) {
      populateApi
        .readOne("gst_master", editId)
        .then((data) => {
          if (data) {
            setFormData({
              name: data.name || "",
              rate: String(data.rate ?? ""),
              cgst_rate: String(data.cgst_rate ?? ""),
              sgst_rate: String(data.sgst_rate ?? ""),
              igst_rate: String(data.igst_rate ?? ""),
              description: data.description || "",
            });
          }
        })
        .catch(() => {
          toast.error("Failed to load GST slab details");
          navigate("/catalogue/gst-slabs");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editId, isEditing, navigate]);

  const handleRateChange = (rateVal) => {
    const rateNum = parseFloat(rateVal) || 0;
    const half = (rateNum / 2).toFixed(2);
    setFormData((prev) => ({
      ...prev,
      rate: rateVal,
      cgst_rate: half,
      sgst_rate: half,
      igst_rate: rateVal,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.rate === "") {
      toast.error("Slab name and tax rate are required");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      rate: parseFloat(formData.rate),
      cgst_rate: parseFloat(formData.cgst_rate) || 0,
      sgst_rate: parseFloat(formData.sgst_rate) || 0,
      igst_rate: parseFloat(formData.igst_rate) || parseFloat(formData.rate),
      description: formData.description.trim(),
    };

    try {
      if (isEditing) {
        await populateApi.update("gst_master", editId, payload);
        toast.success("GST Slab updated successfully");
      } else {
        await populateApi.create("gst_master", payload);
        toast.success("GST Slab created successfully");
      }
      navigate("/catalogue/gst-slabs");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save GST slab");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-token text-xs">
        Loading GST slab information...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar with Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-token">
        <div className="flex items-center gap-3">
          <Link
            to="/catalogue/gst-slabs"
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface border border-token text-secondary-token hover:text-primary-token transition-colors"
            title="Back to GST Slabs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-token mb-0.5">
              <span>Catalogue Master</span>
              <span>/</span>
              <Link to="/catalogue/gst-slabs" className="hover:text-primary-token">
                GST Master
              </Link>
              <span>/</span>
              <span className="text-brand-token font-medium">
                {isEditing ? "Edit GST Slab" : "New GST Slab"}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              {isEditing ? `Edit: ${formData.name || "GST Slab"}` : "Create New GST Slab"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/catalogue/gst-slabs"
            className="px-4 py-2 rounded-xl border border-token text-secondary-token hover:bg-surface-elevated text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Slab"}</span>
          </button>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tax Slab Configuration Card */}
        <div className="glass-panel p-6 rounded-2xl border border-token space-y-5 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <BadgePercent className="w-4 h-4 text-brand-token" />
              Tax Percentage Configuration
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Specify the total GST percentage and intra/inter-state split rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Slab Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. GST 18%, GST 12%, GST Exempt"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
              <p className="text-[11px] text-muted-token mt-1">Friendly identifier used across invoice and catalog dropdowns.</p>
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Total Tax Rate (%) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 18.00"
                  value={formData.rate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-token font-mono font-bold">%</span>
              </div>
              <p className="text-[11px] text-muted-token mt-1">Entering the rate automatically calculates 50/50 CGST & SGST splits below.</p>
            </div>
          </div>

          {/* Tax Split Breakdown */}
          <div className="p-4 rounded-xl bg-surface-elevated/40 border border-token space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-secondary-token">
              <Calculator className="w-3.5 h-3.5 text-brand-token" />
              Tax Split Breakdown (Auto-Calculated)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-muted-token mb-1">
                  CGST (Central) %
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cgst_rate}
                  onChange={(e) => setFormData({ ...formData, cgst_rate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-muted-token mb-1">
                  SGST (State) %
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sgst_rate}
                  onChange={(e) => setFormData({ ...formData, sgst_rate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-muted-token mb-1">
                  IGST (Integrated) %
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.igst_rate}
                  onChange={(e) => setFormData({ ...formData, igst_rate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-secondary-token mb-1.5">Description</label>
            <textarea
              rows="3"
              placeholder="Optional notes or references for this tax slab..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs resize-none"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/catalogue/gst-slabs"
            className="px-5 py-2 rounded-xl border border-token text-secondary-token hover:bg-surface-elevated text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Slab"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
