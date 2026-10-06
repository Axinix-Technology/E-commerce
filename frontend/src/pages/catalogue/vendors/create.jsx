import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Save,
  Phone,
  MapPin,
  Landmark,
  ShieldCheck
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function VendorFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    vendor_code: "",
    contact_person: "",
    phone: "",
    email: "",
    gstin: "",
    pan_number: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    status: 1,
  });

  useEffect(() => {
    if (isEditing) {
      populateApi
        .readOne("vendor_master", editId)
        .then((data) => {
          if (data) {
            setFormData({
              name: data.name || "",
              vendor_code: data.vendor_code || "",
              contact_person: data.contact_person || "",
              phone: data.phone || "",
              email: data.email || "",
              gstin: data.gstin || "",
              pan_number: data.pan_number || "",
              address: data.address || "",
              city: data.city || "",
              state: data.state || "",
              pincode: data.pincode || "",
              bank_name: data.bank_name || "",
              account_number: data.account_number || "",
              ifsc_code: data.ifsc_code || "",
              status: data.status !== undefined ? data.status : 1,
            });
          }
        })
        .catch(() => {
          toast.error("Failed to load vendor record");
          navigate("/catalogue/vendors");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editId, isEditing, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Vendor / Supplier Name is required");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      vendor_code: formData.vendor_code.trim() || null,
      contact_person: formData.contact_person.trim() || null,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      gstin: formData.gstin.trim().toUpperCase() || null,
      pan_number: formData.pan_number.trim().toUpperCase() || null,
      address: formData.address.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      pincode: formData.pincode.trim() || null,
      bank_name: formData.bank_name.trim() || null,
      account_number: formData.account_number.trim() || null,
      ifsc_code: formData.ifsc_code.trim().toUpperCase() || null,
      status: parseInt(formData.status, 10),
    };

    try {
      if (isEditing) {
        await populateApi.update("vendor_master", editId, payload);
        toast.success("Vendor details updated successfully");
      } else {
        await populateApi.create("vendor_master", payload);
        toast.success("Vendor registered successfully");
      }
      navigate("/catalogue/vendors");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save vendor record");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-token text-xs">
        Loading vendor registration details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-token">
        <div className="flex items-center gap-3">
          <Link
            to="/catalogue/vendors"
            className="p-2 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated/80 border border-token text-muted-token hover:text-primary-token transition-colors"
            title="Back to Vendors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-token mb-0.5">
              <span>Catalogue Master</span>
              <span>/</span>
              <Link to="/catalogue/vendors" className="hover:text-primary-token">
                Vendors
              </Link>
              <span>/</span>
              <span className="text-brand-token font-medium">
                {isEditing ? "Edit Vendor" : "New Vendor"}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              {isEditing ? `Edit: ${formData.name}` : "Register New Vendor"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/catalogue/vendors")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
            onClick={handleSubmit}
          >
            {isEditing ? "Save Changes" : "Register Vendor"}
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Identity */}
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-token" />
              Supplier Identification
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Official trading entity name, merchant code, and key contact representative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Vendor / Supplier Name"
                required
                placeholder="e.g. Apex Apparels & Textiles Pvt Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Vendor Code"
                placeholder="e.g. VEND-APEX-01"
                value={formData.vendor_code}
                onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value })}
              />
            </div>

            <div className="md:col-span-3">
              <Input
                label="Contact Person / Representative"
                placeholder="e.g. Mr. Rajesh Sharma (Procurement Head)"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Contact & Tax Compliance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Communication Channels */}
          <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2 pb-2 border-b border-token">
              <Phone className="w-4 h-4 text-brand-token" />
              Communication Channels
            </h2>

            <div className="space-y-3">
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="orders@apexapparels.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Tax Credentials */}
          <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2 pb-2 border-b border-token">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Tax Compliance Credentials
            </h2>

            <div className="space-y-3">
              <Input
                label="GSTIN (15 Digits)"
                maxLength={15}
                placeholder="e.g. 33AAAAA0000A1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              />
              <Input
                label="PAN Number (10 Digits)"
                maxLength={10}
                placeholder="e.g. ABCDE1234F"
                value={formData.pan_number}
                onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-token" />
              Registered Address
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Operating facility or warehouse address for dispatch and purchase billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Textarea
                label="Street Address"
                rows={2}
                placeholder="Plot No, Street, Industrial Area..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="City"
                placeholder="e.g. Tiruppur"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="State"
                placeholder="e.g. Tamil Nadu"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="PIN Code"
                placeholder="641601"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Banking & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2 pb-2 border-b border-token">
              <Landmark className="w-4 h-4 text-brand-token" />
              Settlement & Banking (Optional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Bank Name"
                placeholder="e.g. HDFC Bank"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              />
              <Input
                label="Account Number"
                placeholder="50200012345678"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              />
              <Input
                label="IFSC Code"
                placeholder="HDFC0001234"
                value={formData.ifsc_code}
                onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          {/* Master Status */}
          <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-3">
            <h2 className="text-sm font-bold text-primary-token pb-2 border-b border-token">
              Master Status
            </h2>

            <Select
              label="Record Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value, 10) })}
              options={[
                { value: 1, label: "Active (Authorized Supplier)" },
                { value: 0, label: "Inactive (Deactivated)" },
              ]}
            />
            <p className="text-[11px] text-muted-token">
              Inactive vendors cannot be selected in new Purchase Orders or Inward entries.
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/catalogue/vendors")}
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
            {isEditing ? "Save Changes" : "Register Vendor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
