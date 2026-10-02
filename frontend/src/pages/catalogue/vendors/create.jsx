import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Save,
  Phone,
  Mail,
  MapPin,
  Landmark,
  ShieldCheck
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

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
      {/* Top Bar with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-token">
        <div className="flex items-center gap-3">
          <Link
            to="/catalogue/vendors"
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface border border-token text-secondary-token hover:text-primary-token transition-colors"
            title="Back to Vendors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-token mb-0.5">
              <span>Catalogue Master</span>
              <span>/</span>
              <Link to="/catalogue/vendors" className="hover:text-primary-token">
                Vendor Registration
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
          <Link
            to="/catalogue/vendors"
            className="px-4 py-2 rounded-xl border border-token hover:bg-surface-elevated text-secondary-token text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : isEditing ? "Save Changes" : "Register Vendor"}</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Identity */}
        <div className="glass-panel p-6 rounded-2xl border border-token space-y-5 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-token" />
              Supplier Identification
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Official trading entity name, merchant code, and key contact representative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="md:col-span-2">
              <label className="block font-semibold text-secondary-token mb-1.5">
                Vendor / Supplier Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Apparels & Textiles Pvt Ltd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Vendor Code
              </label>
              <input
                type="text"
                placeholder="e.g. VEND-APEX-01"
                value={formData.vendor_code}
                onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-semibold text-secondary-token mb-1.5">
                Contact Person / Representative
              </label>
              <input
                type="text"
                placeholder="e.g. Mr. Rajesh Sharma (Procurement Head)"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Contact & Tax Compliance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Communication Channels */}
          <div className="glass-panel p-6 rounded-2xl border border-token space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2 pb-2 border-b border-token">
              <Phone className="w-4 h-4 text-brand-token" />
              Communication Channels
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-secondary-token mb-1.5">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-secondary-token mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="orders@apexapparels.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>
            </div>
          </div>

          {/* Tax Credentials */}
          <div className="glass-panel p-6 rounded-2xl border border-token space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2 pb-2 border-b border-token">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Tax Compliance Credentials
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-secondary-token mb-1.5">
                  GSTIN (15 Digits)
                </label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono uppercase focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-secondary-token mb-1.5">
                  PAN Number (10 Digits)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. ABCDE1234F"
                  value={formData.pan_number}
                  onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono uppercase focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="glass-panel p-6 rounded-2xl border border-token space-y-5 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-token" />
              Registered Address
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Operating facility or warehouse address for dispatch and purchase billing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="md:col-span-3">
              <label className="block font-semibold text-secondary-token mb-1.5">Street Address</label>
              <textarea
                rows="2"
                placeholder="Plot No, Street, Industrial Area..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs resize-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">City</label>
              <input
                type="text"
                placeholder="e.g. Tiruppur"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">State</label>
              <input
                type="text"
                placeholder="e.g. Tamil Nadu"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">PIN Code</label>
              <input
                type="text"
                placeholder="641601"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Banking & Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-token space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2 pb-2 border-b border-token">
              <Landmark className="w-4 h-4 text-brand-token" />
              Settlement & Banking (Optional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-secondary-token mb-1.5">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-secondary-token mb-1.5">Account Number</label>
                <input
                  type="text"
                  placeholder="50200012345678"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-secondary-token mb-1.5">IFSC Code</label>
                <input
                  type="text"
                  placeholder="HDFC0001234"
                  value={formData.ifsc_code}
                  onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono uppercase focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>
            </div>
          </div>

          {/* Master Status */}
          <div className="glass-panel p-6 rounded-2xl border border-token space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-primary-token pb-2 border-b border-token">
              Master Status
            </h2>

            <div className="text-xs space-y-2">
              <label className="block font-semibold text-secondary-token">Record Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              >
                <option value={1}>Active (Authorized Supplier)</option>
                <option value={0}>Inactive (Deactivated)</option>
              </select>
              <p className="text-[10px] text-muted-token">
                Inactive vendors cannot be selected in new Purchase Orders or Inward entries.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/catalogue/vendors"
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
            <span>{submitting ? "Saving..." : isEditing ? "Save Changes" : "Register Vendor"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
