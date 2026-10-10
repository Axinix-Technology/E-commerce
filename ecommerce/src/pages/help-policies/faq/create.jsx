import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function SubmitFaqQuestionPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "Orders & Shipping",
    question: "",
    context: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.email.trim()) {
      toast.error("Please provide your email and question");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Question submitted! Our support team will answer your query directly.");
      navigate("/help-policies/faq");
    }, 500);
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/help-policies/faq"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-token" />
            Ask a Question
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Can't find the answer you need? Submit your question below
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Your Name"
            placeholder="Alex Mercer"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="alex@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={[
            { value: "Orders & Shipping", label: "Orders & Shipping" },
            { value: "Returns & Refunds", label: "Returns & Refunds" },
            { value: "Statutory GST & Invoicing", label: "Statutory GST & Invoicing" },
            { value: "Account & Security", label: "Account & Security" },
          ]}
        />

        <Input
          label="Your Question"
          required
          placeholder="e.g. Can I request a Sunday express delivery in Mumbai?"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
        />

        <Textarea
          label="Additional Context"
          rows={3}
          placeholder="Provide any order references or specific requirements..."
          value={formData.context}
          onChange={(e) => setFormData({ ...formData, context: e.target.value })}
        />

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/help-policies/faq")}
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
            Submit Question
          </Button>
        </div>
      </form>
    </div>
  );
}
