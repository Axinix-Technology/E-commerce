import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";

export default function SubmitDataConsentRequestPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    request_type: "Export Personal Data",
    reason: "",
  });

  const requestTypeOptions = [
    { value: "Export Personal Data", label: "Export All Account Data (JSON/CSV)" },
    { value: "Revoke Marketing Consent", label: "Opt-out of Promotional SMS & Emails" },
    { value: "Erase Non-Statutory Records", label: "Erase Account and Non-Audit Records" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("DPDP data request registered. You will receive an export link within 24 hours.");
      navigate("/help-policies/privacy-policy");
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/help-policies/privacy-policy">
          <Button variant="outline" size="sm" icon={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-token" />
            <span>DPDP Customer Data Request</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">Exercise statutory data rights under the DPDP Act 2023</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-5">
        <div className="space-y-4">
          <Input
            label="Registered Customer Email"
            type="email"
            required
            placeholder="alex@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Select
            label="Request Type"
            required
            options={requestTypeOptions}
            value={formData.request_type}
            onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
          />

          <Textarea
            label="Remarks or Specific Guidance"
            rows={3}
            placeholder="Provide any additional specifications..."
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
        </div>

        <div className="pt-4 border-t border-token flex items-center justify-end gap-3">
          <Link to="/help-policies/privacy-policy">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            icon={Save}
          >
            {submitting ? "Processing..." : "Submit Data Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
