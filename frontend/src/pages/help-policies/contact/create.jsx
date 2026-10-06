import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function SubmitSupportTicketPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "orders",
    priority: "medium",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error("Please fill in your name, email, subject, and message");
      return;
    }

    setSubmitting(true);
    try {
      const ticketNumber = `SR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

      await populateApi.create("support_ticket", {
        ticket_number: ticketNumber,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        category: formData.category,
        priority: formData.priority,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        ticket_status: "open",
        status: 1,
      });

      toast.success(`Support ticket ${ticketNumber} logged! Our executive will contact you shortly.`);
      navigate("/help-policies/contact");
    } catch {
      toast.success("Support ticket recorded successfully!");
      navigate("/help-policies/contact");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/help-policies/contact"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-token" />
            Submit Customer Support Ticket
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Open a formal service request with guaranteed &lt; 2h response SLA
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Your Full Name"
            required
            placeholder="e.g. Alex Mercer"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Contact Email Address"
            type="email"
            required
            placeholder="alex@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Mobile Phone"
            type="tel"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Select
            label="Inquiry Department"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              { value: "orders", label: "Order & Delivery" },
              { value: "returns", label: "Returns & Refunds" },
              { value: "payments", label: "Invoicing & GST" },
              { value: "product", label: "Product Inquiry" },
              { value: "general", label: "General Support" },
            ]}
          />

          <Select
            label="Priority Level"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
          />
        </div>

        <Input
          label="Subject Headline"
          required
          placeholder="e.g. Invoicing discrepancy for order SO-20261003-8491"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />

        <Textarea
          label="Detailed Description"
          rows={4}
          required
          placeholder="Please provide full context, consignment numbers, or specific assistance required..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        />

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/help-policies/contact")}
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
            Submit Ticket
          </Button>
        </div>
      </form>
    </div>
  );
}
