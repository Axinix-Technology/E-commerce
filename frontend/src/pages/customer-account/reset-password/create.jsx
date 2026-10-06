import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Save } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

export default function RequestPasswordResetTokenPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequestToken = (e) => {
    e.preventDefault();
    if (!identifier) {
      toast.error("Please enter email or phone");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Security token generated and dispatched via SMS / Email!");
      navigate("/customer-account/reset-password");
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/customer-account/reset-password">
          <Button variant="outline" size="sm" icon={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-brand-token" />
            <span>Generate Security Token</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">Request a high-entropy password recovery link</p>
        </div>
      </div>

      <form onSubmit={handleRequestToken} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-4">
        <Input
          label="Email or Mobile Number"
          type="text"
          required
          placeholder="alex@example.com or +91 9876543210"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <Button
          type="submit"
          variant="secondary"
          size="md"
          loading={submitting}
          fullWidth
        >
          {submitting ? "Generating Token..." : "Dispatch Security Token"}
        </Button>
      </form>
    </div>
  );
}
