import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input } from "../../../components/ui";

export default function CompanySettingsCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    legal_name: "Axinix Silk & Handlooms Private Limited",
    trade_name: "Axinix Textiles",
    gstin: "33AAACA1234F1Z8",
    pan: "AAACA1234F",
    cin: "U17111TN2026PTC109922",
    email: "corporate@axinixtextiles.com",
    phone: "+91 44 2815 9900",
    registered_address: "No. 42, Usman Road, T. Nagar, Chennai - 600017, Tamil Nadu, India",
    bank_name: "HDFC Bank Ltd",
    bank_account: "50200088991122",
    ifsc: "HDFC0000128",
    branch: "T. Nagar Branch, Chennai",
  });

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Company profile and statutory tax credentials updated!");
      navigate("/settings/company");
    }, 400);
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
            Edit tax registration details, corporate billing credentials, and bank payout coordinates
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-4 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Legal Registered Name"
            required
            fieldType="name"
            value={form.legal_name}
            onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
          />

          <Input
            label="Trade / Brand Name"
            required
            fieldType="name"
            value={form.trade_name}
            onChange={(e) => setForm({ ...form, trade_name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="GSTIN"
            required
            fieldType="gstin"
            value={form.gstin}
            onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
          />

          <Input
            label="PAN Number"
            fieldType="code"
            value={form.pan}
            onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
          />

          <Input
            label="CIN Number"
            fieldType="code"
            value={form.cin}
            onChange={(e) => setForm({ ...form, cin: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Official Corporate Email"
            type="email"
            fieldType="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Corporate Phone"
            fieldType="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <Input
          label="Registered Business Address"
          value={form.registered_address}
          onChange={(e) => setForm({ ...form, registered_address: e.target.value })}
        />

        <div className="pt-2 border-t border-token grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Bank Name"
            value={form.bank_name}
            onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
          />

          <Input
            label="Bank Account Number"
            value={form.bank_account}
            onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
          />

          <Input
            label="IFSC Code"
            fieldType="code"
            value={form.ifsc}
            onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
          />

          <Input
            label="Bank Branch"
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-token">
          <Link to="/settings/company">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
            onClick={handleSubmit}
          >
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
