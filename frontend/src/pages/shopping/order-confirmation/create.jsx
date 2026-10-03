import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateReorderPage() {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReorder = (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("Please enter previous Order Number");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Items from order ${orderNumber} cloned to active cart!`);
      navigate("/shopping/cart");
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/shopping/order-confirmation"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>One-Click Reorder</span>
          </h1>
          <p className="text-xs text-gray-400">Clone items from a previous order into your shopping cart</p>
        </div>
      </div>

      <form onSubmit={handleReorder} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Previous Order Reference *</label>
          <input
            type="text"
            required
            placeholder="e.g. SO-20261003-8491"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono uppercase"
          />
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/shopping/order-confirmation"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{submitting ? "Cloning Items..." : "Clone to Cart & Reorder"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
