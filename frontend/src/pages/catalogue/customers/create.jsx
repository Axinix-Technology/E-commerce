import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Save,
  Phone,
  MapPin,
  Building2,
  ShieldCheck
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_type: "b2c",
    name: "",
    phone: "",
    email: "",
    company_name: "",
    gstin: "",
    pan_number: "",
    billing_address: "",
    shipping_address: "",
    city: "",
    state_id: "",
    pincode: "",
    status: 1,
  });

  useEffect(() => {
    // 1. Fetch statutory states for Place of Supply
    populateApi
      .read("state_master", { limit: 100, sort: ["code"] })
      .then((res) => {
        if (res?.data) {
          setStates(res.data);
          if (!isEditing && res.data.length > 0 && !formData.state_id) {
            const tn = res.data.find((s) => s.code === "33") || res.data[0];
            setFormData((prev) => ({ ...prev, state_id: String(tn.id) }));
          }
        }
      })
      .catch(() => {});

    // 2. Load customer details if editing
    if (isEditing) {
      populateApi
        .readOne("customer_master", editId, {
          populate: { state: ["id", "code", "name"] },
        })
        .then((data) => {
          if (data) {
            setFormData({
              customer_type: data.customer_type || "b2c",
              name: data.name || "",
              phone: data.phone || "",
              email: data.email || "",
              company_name: data.company_name || "",
              gstin: data.gstin || "",
              pan_number: data.pan_number || "",
              billing_address: data.billing_address || "",
              shipping_address: data.shipping_address || "",
              city: data.city || "",
              state_id: data.state?.id ? String(data.state.id) : (data.state_id ? String(data.state_id) : ""),
              pincode: data.pincode || "",
              status: data.status !== undefined ? data.status : 1,
            });
          }
        })
        .catch(() => {
          toast.error("Failed to load customer details");
          navigate("/catalogue/customers");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editId, isEditing, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Customer name and phone number are required.");
      return;
    }

    setSubmitting(true);
    const payload = {
      customer_type: formData.customer_type,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || null,
      company_name: formData.customer_type === "b2b" ? (formData.company_name.trim() || null) : null,
      gstin: formData.customer_type === "b2b" ? (formData.gstin.trim().toUpperCase() || null) : null,
      pan_number: formData.pan_number.trim().toUpperCase() || null,
      billing_address: formData.billing_address.trim() || null,
      shipping_address: formData.shipping_address.trim() || (formData.billing_address.trim() || null),
      city: formData.city.trim() || null,
      state_id: formData.state_id ? parseInt(formData.state_id, 10) : null,
      pincode: formData.pincode.trim() || null,
      status: parseInt(formData.status, 10),
    };

    try {
      if (isEditing) {
        await populateApi.update("customer_master", editId, payload);
        toast.success("Customer account updated successfully");
      } else {
        await populateApi.create("customer_master", payload);
        toast.success("Customer registered successfully");
      }
      navigate("/catalogue/customers");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save customer account");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-token text-xs">
        Loading customer account details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-token">
        <div className="flex items-center gap-3">
          <Link
            to="/catalogue/customers"
            className="p-2 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated/80 border border-token text-muted-token hover:text-primary-token transition-colors"
            title="Back to Customers"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-token mb-0.5">
              <span>Catalogue Master</span>
              <span>/</span>
              <Link to="/catalogue/customers" className="hover:text-primary-token">
                Customers
              </Link>
              <span>/</span>
              <span className="text-brand-token font-medium">
                {isEditing ? "Edit Customer" : "New Customer"}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              {isEditing ? `Edit: ${formData.name}` : "Register New Customer"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/catalogue/customers")}
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
            {isEditing ? "Save Changes" : "Save Customer"}
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Classification */}
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
          <h2 className="text-sm font-bold text-primary-token flex items-center gap-2 pb-2 border-b border-token">
            <Users className="w-4 h-4 text-brand-token" />
            Account Classification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                formData.customer_type === "b2c"
                  ? "bg-brand-token/10 border-brand-token"
                  : "bg-surface-elevated border-token hover:border-token"
              }`}
            >
              <input
                type="radio"
                name="customer_type"
                value="b2c"
                checked={formData.customer_type === "b2c"}
                onChange={() => setFormData({ ...formData, customer_type: "b2c" })}
                className="mt-1"
              />
              <div>
                <span className="block text-xs font-bold text-primary-token">Retail Consumer (B2C)</span>
                <span className="block text-[11px] text-muted-token mt-0.5">
                  Standard consumer billing, walk-in shoppers, and e-commerce orders.
                </span>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                formData.customer_type === "b2b"
                  ? "bg-brand-token/10 border-brand-token"
                  : "bg-surface-elevated border-token hover:border-token"
              }`}
            >
              <input
                type="radio"
                name="customer_type"
                value="b2b"
                checked={formData.customer_type === "b2b"}
                onChange={() => setFormData({ ...formData, customer_type: "b2b" })}
                className="mt-1"
              />
              <div>
                <span className="block text-xs font-bold text-primary-token">Registered Business (B2B)</span>
                <span className="block text-[11px] text-muted-token mt-0.5">
                  Corporate tax invoice with GSTIN for input tax credit claims.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Primary Contact Details */}
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-token" />
              Contact Information
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Personal name and primary communication channels for invoice delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={formData.customer_type === "b2b" ? "md:col-span-1" : "md:col-span-2"}>
              <Input
                label="Customer Name"
                required
                placeholder="e.g. Arun Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {formData.customer_type === "b2b" && (
              <div className="md:col-span-2">
                <Input
                  label="Company / Trade Name"
                  required
                  placeholder="e.g. Axinix Textiles Private Limited"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
            )}

            <div>
              <Input
                label="Phone Number"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="customer@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* GST & Tax Compliance */}
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
          <h2 className="text-sm font-bold text-primary-token flex items-center gap-2 pb-2 border-b border-token">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Tax Compliance Credentials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={`GSTIN Number (15 Digits) ${formData.customer_type === "b2b" ? "*" : ""}`}
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

        {/* Address & Statutory Place of Supply */}
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-token" />
              Address & Place of Supply (POS)
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              The statutory State determines whether CGST+SGST or IGST is charged on the invoice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Textarea
                label="Billing Address"
                rows={2}
                placeholder="Door No, Street, Landmark..."
                value={formData.billing_address}
                onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
              />
            </div>

            <div>
              <Select
                label="State (GST Place of Supply)"
                required
                value={formData.state_id}
                onChange={(e) => setFormData({ ...formData, state_id: e.target.value })}
                options={[
                  { value: "", label: "— Select State —" },
                  ...states.map((s) => ({
                    value: String(s.id),
                    label: `[${s.code}] ${s.name}`,
                  })),
                ]}
              />
            </div>

            <div>
              <Input
                label="City / Town"
                placeholder="e.g. Chennai, Coimbatore"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="PIN Code"
                placeholder="600001"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
          <h2 className="text-sm font-bold text-primary-token pb-2 border-b border-token">
            Account Status
          </h2>

          <div className="max-w-xs">
            <Select
              label="Record Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value, 10) })}
              options={[
                { value: 1, label: "Active Account" },
                { value: 0, label: "Inactive / Suspended" },
              ]}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/catalogue/customers")}
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
            {isEditing ? "Save Changes" : "Save Customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
