import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input } from "../../../components/ui";

export default function CreateCheckoutSessionPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");

  const handleStartFreshSession = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Fresh checkout session initialized!");
      navigate("/shopping/products");
    }, 500);
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/shopping/checkout"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-token" />
            Create New Checkout Session
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Initialize a fresh retail checkout transaction with custom PO reference
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleStartFreshSession} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Session Memo / Purchase Order Reference"
          placeholder="e.g. B2B Client PO #9842"
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
        />

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/shopping/checkout")}
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
            Start Fresh Checkout
          </Button>
        </div>
      </form>
    </div>
  );
}
