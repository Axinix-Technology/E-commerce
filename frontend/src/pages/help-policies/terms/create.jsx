import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2, Save } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Checkbox from "../../../components/ui/Checkbox";
import Button from "../../../components/ui/Button";

export default function AcknowledgeTermsPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    business_name: "",
    representative_name: "",
    gstin: "",
    agreed_to_terms: false,
    agreed_to_itc: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.business_name || !formData.representative_name) {
      toast.error("Business name and authorized representative name are required");
      return;
    }
    if (!formData.agreed_to_terms) {
      toast.error("You must agree to the statutory commercial terms");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Statutory B2B commercial agreement acknowledged and logged!");
      navigate("/help-policies/terms");
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/help-policies/terms">
          <Button variant="outline" size="sm" icon={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-token" />
            <span>Statutory Commercial Acknowledgment</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">Formal agreement for enterprise B2B purchasing and GSTR compliance</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company / Entity Name"
              required
              placeholder="e.g. Mercer Retail Pvt Ltd"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
            />

            <Input
              label="Authorized Signatory Name"
              required
              placeholder="e.g. Alex Mercer"
              value={formData.representative_name}
              onChange={(e) => setFormData({ ...formData, representative_name: e.target.value })}
            />
          </div>

          <Input
            label="GSTIN Identifier (Optional)"
            maxLength={15}
            placeholder="33AAACM1234F1Z5"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
            className="font-mono uppercase"
          />

          <div className="space-y-2.5 pt-2 border-t border-token">
            <Checkbox
              id="agreed-terms"
              required
              checked={formData.agreed_to_terms}
              onChange={(e) => setFormData({ ...formData, agreed_to_terms: e.target.checked })}
              label="I agree to statutory commercial terms and exclusive Coimbatore jurisdiction"
            />

            <Checkbox
              id="agreed-itc"
              checked={formData.agreed_to_itc}
              onChange={(e) => setFormData({ ...formData, agreed_to_itc: e.target.checked })}
              label="I confirm GSTIN supplied is active and entitled to Input Tax Credit"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-token flex items-center justify-end gap-3">
          <Link to="/help-policies/terms">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={submitting}
            icon={CheckCircle2}
          >
            {submitting ? "Signing..." : "Acknowledge Terms"}
          </Button>
        </div>
      </form>
    </div>
  );
}
