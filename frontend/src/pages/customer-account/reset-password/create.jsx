import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Save } from "lucide-react";
import toast from "react-hot-toast";

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
        <Link
          to="/customer-account/reset-password"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Generate Security Token</span>
          </h1>
          <p className="text-xs text-gray-400">Request a high-entropy password recovery link</p>
        </div>
      </div>

      <form onSubmit={handleRequestToken} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Email or Mobile Number</label>
          <input
            type="text"
            required
            placeholder="alex@example.com or +91 9876543210"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>{submitting ? "Generating Token..." : "Dispatch Security Token"}</span>
        </button>
      </form>
    </div>
  );
}
