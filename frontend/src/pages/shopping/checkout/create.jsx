import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Save } from "lucide-react";
import toast from "react-hot-toast";

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/shopping/checkout"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Create New Checkout Session</span>
          </h1>
          <p className="text-xs text-gray-400">Initialize a fresh retail checkout transaction</p>
        </div>
      </div>

      <form onSubmit={handleStartFreshSession} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Session Memo / Purchase Order Reference</label>
          <input
            type="text"
            placeholder="e.g. B2B Client PO #9842"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/shopping/checkout"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Initializing..." : "Start Fresh Checkout"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
