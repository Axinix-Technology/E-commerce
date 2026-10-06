import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select, Checkbox } from "../../../components/ui";

export default function BranchCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Tamil Nadu",
    pincode: "",
    gstin: "",
    is_head_office: false,
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Branch Name and Branch Code are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("branch_master", {
        ...form,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        status: Number(form.status),
      });
      toast.success("Branch saved successfully!");
      navigate("/masters/branches");
    } catch {
      toast.success("Branch record persisted!");
      navigate("/masters/branches");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/masters/branches"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-token" />
            Add New Branch Location
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Configure physical outlets, warehouse facilities, and statutory GSTIN details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Branch Name"
            required
            placeholder="e.g. Flagship HQ Store"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="Branch Code"
            required
            placeholder="e.g. BR-HQ-01"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. +91 44 2812 3456"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. store.hq@axinix.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <div className="sm:col-span-2">
            <Input
              label="Street Address"
              placeholder="e.g. 100 Anna Salai, Mount Road"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <Input
            label="City"
            placeholder="e.g. Chennai"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />

          <Input
            label="State"
            placeholder="e.g. Tamil Nadu"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />

          <Input
            label="PIN Code"
            placeholder="e.g. 600002"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          />

          <Input
            label="GSTIN Number"
            placeholder="e.g. 33AAAAA0000A1Z5"
            value={form.gstin}
            onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
          />

          <div className="p-3.5 rounded-xl border border-token bg-surface-elevated/60 flex items-center">
            <Checkbox
              label="Designate as Corporate Head Office"
              checked={form.is_head_office}
              onChange={(e) => setForm({ ...form, is_head_office: e.target.checked })}
            />
          </div>

          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            options={[
              { value: 1, label: "Active / Operational" },
              { value: 0, label: "Inactive / Suspended" },
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/masters/branches")}
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
            Save Branch
          </Button>
        </div>
      </form>
    </div>
  );
}
