import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input } from "../../../components/ui";
import populateApi from "../../../api/populate.api";

export default function CompanySettingsCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [form, setForm] = useState({
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
  });

  useEffect(() => {
    const loadCompany = async () => {
      try {
        const res = await populateApi.read("company", { limit: 1 });
        const list = Array.isArray(res) ? res : res?.data || [];
        if (list.length > 0) {
          const comp = list[0];
          setCompanyId(comp.id);
          setForm({
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
          });
        }
      } catch (err) {
        console.warn("Could not prefetch company master:", err.message);
      }
    };
    loadCompany();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.legal_name.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      toast.error("Please fill in required fields (Name, Legal Name, City, State, Pincode)");
      return;
    }

    setSubmitting(true);
    try {
      if (companyId) {
        await populateApi.update("company", companyId, form);
      } else {
        await populateApi.create("company", { ...form, status: 1 });
      }
      toast.success("Company master profile successfully saved to database!");
      navigate("/settings/company");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err?.message || "Failed to save company profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/settings/company"
          className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-token" />
            Update Company Legal Profile
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Configure statutory tax registration details, corporate billing credentials, and headquarters address
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-4 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Brand Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Axinix Textiles"
          />

          <Input
            label="Legal Registered Name"
            required
            value={form.legal_name}
            onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
            placeholder="e.g. Axinix Handlooms Private Limited"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Short Brand Identifier"
            value={form.short_name}
            onChange={(e) => setForm({ ...form, short_name: e.target.value })}
            placeholder="e.g. Axinix"
          />

          <Input
            label="GSTIN / Tax ID"
            value={form.gst_no}
            onChange={(e) => setForm({ ...form, gst_no: e.target.value.toUpperCase() })}
            placeholder="e.g. 33AAAAA0000A1Z5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Address Line 1"
            required
            value={form.address_line_1}
            onChange={(e) => setForm({ ...form, address_line_1: e.target.value })}
            placeholder="Street address / Building"
          />

          <Input
            label="Address Line 2"
            value={form.address_line_2}
            onChange={(e) => setForm({ ...form, address_line_2: e.target.value })}
            placeholder="Area / Landmark"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="City"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="e.g. Chennai"
          />

          <Input
            label="State"
            required
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="e.g. Tamil Nadu"
          />

          <Input
            label="Postal Pincode"
            required
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
            placeholder="600017"
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Link to="/settings/company">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" size="sm" icon={Save} loading={submitting} type="submit">
            Save Company Master
          </Button>
        </div>
      </form>
    </div>
  );
}
