import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Handshake, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function PartnerInquiryPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    partnership_type: "Wholesale Distribution",
    investment_range: "₹10 Lakh - ₹25 Lakh",
    city: "",
    proposal: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.contact_person || !formData.email) {
      toast.error("Please fill in company name, contact person, and email");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Partnership inquiry submitted! Our corporate director will reach out.");
      navigate("/useful-additions/about");
    }, 500);
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/useful-additions/about"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Handshake className="w-5 h-5 text-brand-token" />
            Enterprise Partnership Proposal
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Collaborate with Axinix for regional distribution or retail franchise
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company / Entity Name"
            required
            placeholder="e.g. Apex Apparel Distributors"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          />

          <Input
            label="Key Contact Person"
            required
            placeholder="e.g. Rajesh Kumar"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
          />

          <Input
            label="Corporate Email"
            type="email"
            required
            placeholder="rajesh@apexapparel.in"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Direct Phone"
            type="tel"
            required
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Partnership Model"
            value={formData.partnership_type}
            onChange={(e) => setFormData({ ...formData, partnership_type: e.target.value })}
            options={[
              { value: "Wholesale Distribution", label: "Wholesale Distribution" },
              { value: "Retail Franchise Store", label: "Retail Franchise Store" },
              { value: "Institutional Corporate Gifting", label: "Institutional Corporate Gifting" },
            ]}
          />

          <Input
            label="Target Territory / City"
            placeholder="e.g. Bengaluru, Karnataka"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <Textarea
          label="Brief Proposal or Capabilities"
          rows={3}
          placeholder="Describe your current warehouse footprint, retail presence, or distribution network..."
          value={formData.proposal}
          onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
        />

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/useful-additions/about")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="sm"
            icon={Send}
            loading={submitting}
          >
            Send Proposal
          </Button>
        </div>
      </form>
    </div>
  );
}
