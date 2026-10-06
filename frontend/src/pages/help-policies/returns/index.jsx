import React from "react";
import { Link } from "react-router-dom";
import { RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Package } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary-token flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand-token" />
            <span>Returns & Refunds Policy</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Hassle-free 7-day inspection window, reverse courier pickups, and automated refunds
          </p>
        </div>

        <Link to="/help-policies/returns/create" className="self-start sm:self-auto">
          <Button variant="secondary" size="sm" icon={RotateCcw}>
            Initiate Return
          </Button>
        </Link>
      </div>

      {/* Minimalist Metrics Bar (UI Rule 2) */}
      <div className="glass-panel py-2 px-3.5 rounded-xl border border-token text-xs font-mono flex flex-wrap items-center gap-2.5 sm:gap-3 text-secondary-token">
        <span>
          Inspection Window: <strong className="text-primary-token font-medium">7 Days from Delivery</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Doorstep Pickup: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">—</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          UPI Instant Refund: <strong className="text-brand-token font-medium">&lt; 15 Minutes after QC</strong>
        </span>
      </div>

      {/* Policy Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-3">
          <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider">
            Eligible Return Conditions
          </h3>
          <p className="text-xs text-secondary-token leading-relaxed">
            To ensure hygienic compliance and preservation of luxury textiles:
          </p>
          <ul className="text-xs text-secondary-token space-y-2 pt-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Garment barcode tag and tamper seal must remain intact and unscratched.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Apparel must be unworn, unwashed, unaltered, and packed in original casing.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>Footwear must be tried only on carpeted surfaces with pristine leather soles.</span>
            </li>
          </ul>
        </div>

        <div className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-3">
          <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Refund & Reversal Timelines
          </h3>
          <p className="text-xs text-secondary-token leading-relaxed">
            Our automated warehouse scanner validates restockable items upon courier arrival:
          </p>
          <ul className="text-xs text-secondary-token space-y-2 pt-1">
            <li>• <strong className="text-primary-token">UPI Transfers:</strong> Disbursed immediately within 15 minutes of QC approval.</li>
            <li>• <strong className="text-primary-token">Credit / Debit Cards:</strong> 3 to 5 business banking days depending on issuer.</li>
            <li>• <strong className="text-primary-token">GST Credit Notes:</strong> Official credit note generated for B2B ITC reversal.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
