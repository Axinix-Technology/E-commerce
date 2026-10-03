import React from "react";
import { Link } from "react-router-dom";
import { RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Package } from "lucide-react";

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Returns & Refunds Policy</span>
          </h1>
          <p className="text-xs text-gray-400">
            Hassle-free 7-day inspection window, reverse courier pickups, and automated refunds
          </p>
        </div>

        <Link
          to="/help-policies/returns/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Initiate Return</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Inspection Window: <strong className="text-white">7 Days from Delivery</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Doorstep Pickup: <strong className="text-emerald-400">Zero Cost</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          UPI Instant Refund: <strong className="text-[var(--brand-primary)]">&lt; 15 Minutes after QC</strong>
        </span>
      </div>

      {/* Policy Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
            Eligible Return Conditions
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            To ensure hygienic compliance and preservation of luxury textiles:
          </p>
          <ul className="text-xs text-gray-400 space-y-2 pt-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Garment barcode tag and tamper seal must remain intact and unscratched.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Apparel must be unworn, unwashed, unaltered, and packed in original casing.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Footwear must be tried only on carpeted surfaces with pristine leather soles.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Refund & Reversal Timelines
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Our automated warehouse scanner validates restockable items upon courier arrival:
          </p>
          <ul className="text-xs text-gray-400 space-y-2 pt-1">
            <li>• <strong>UPI Transfers:</strong> Disbursed immediately within 15 minutes of QC approval.</li>
            <li>• <strong>Credit / Debit Cards:</strong> 3 to 5 business banking days depending on issuer.</li>
            <li>• <strong>GST Credit Notes:</strong> Official credit note generated for B2B ITC reversal.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
