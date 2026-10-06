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
import { Button, Input, Textarea } from "../../../components/ui";

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
            className="p-2 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated/80 border border-token text-muted-token hover:text-primary-token transition-colors"
            title="Back to GST Slabs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-token mb-0.5">
              <span>Catalogue Master</span>
              <span>/</span>
              <Link to="/catalogue/gst-slabs" className="hover:text-primary-token">
                GST Slabs
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
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/catalogue/gst-slabs")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
            onClick={handleSubmit}
          >
            {isEditing ? "Save Changes" : "Create Slab"}
          </Button>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tax Slab Configuration Card */}
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <BadgePercent className="w-4 h-4 text-brand-token" />
              Tax Percentage Configuration
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Specify the total GST percentage and intra/inter-state split rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Slab Name"
              required
              placeholder="e.g. GST 18%, GST 12%, GST Exempt"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Total Tax Rate (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              placeholder="e.g. 18.00"
              value={formData.rate}
              onChange={(e) => handleRateChange(e.target.value)}
            />
          </div>

          {/* Automatic Split Info Box */}
          <div className="p-4 rounded-xl bg-surface-elevated/60 border border-token">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-token mb-3">
              <Calculator className="w-4 h-4 text-brand-token" />
              <span>Statutory Rate Split Matrix</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="CGST (Central Tax %)"
                type="number"
                step="0.01"
                min="0"
                value={formData.cgst_rate}
                onChange={(e) => setFormData({ ...formData, cgst_rate: e.target.value })}
              />

              <Input
                label="SGST (State Tax %)"
                type="number"
                step="0.01"
                min="0"
                value={formData.sgst_rate}
                onChange={(e) => setFormData({ ...formData, sgst_rate: e.target.value })}
              />

              <Input
                label="IGST (Inter-State Tax %)"
                type="number"
                step="0.01"
                min="0"
                value={formData.igst_rate}
                onChange={(e) => setFormData({ ...formData, igst_rate: e.target.value })}
              />
            </div>
          </div>

          <Textarea
            label="Tax Specification / Notes"
            rows={3}
            placeholder="HSN categories or garment pricing ranges this slab applies to..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/catalogue/gst-slabs")}
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
            {isEditing ? "Save Changes" : "Create Slab"}
          </Button>
        </div>
      </form>
    </div>
  );
}
