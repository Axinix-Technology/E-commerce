import React from "react";
import { Link } from "react-router-dom";
import { FileText, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Terms & Conditions of Commercial Sale</span>
          </h1>
          <p className="text-xs text-gray-400">
            Statutory framework governing retail sales, commercial invoicing, and legal jurisdiction
          </p>
        </div>

        <Link
          to="/help-policies/terms/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Acknowledge Agreement</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Applicable Laws: <strong className="text-white">Indian Contract Act 1872 & CGST Act 2017</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Jurisdiction: <strong className="text-white">Coimbatore Courts</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Arbitration: <strong className="text-emerald-400">Binding</strong>
        </span>
      </div>

      {/* Terms Body */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6 text-xs text-gray-300 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">1. Scope of Electronic Contract</h3>
          <p>
            By initiating checkout, confirming an order, or transferring payment on Axinix E-Commerce, you enter into a legally enforceable commercial agreement governed by the Information Technology Act, 2000.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">2. Statutory Invoicing & GST Determination</h3>
          <p>
            All displayed retail prices include applicable GST under Indian GST slabs. B2B invoices are rendered compliant with Rule 46 of the CGST Rules, 2017, capturing supplier and recipient GSTINs.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white">3. Governing Jurisdiction & Dispute Settlement</h3>
          <p>
            All disputes, claims, or controversies arising out of or relating to any transaction shall be subject to the exclusive jurisdiction of the competent civil courts located in Coimbatore, Tamil Nadu, India.
          </p>
        </section>
      </div>
    </div>
  );
}
