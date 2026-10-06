import React from "react";
import { Link } from "react-router-dom";
import { FileText, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary-token flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-token" />
            <span>Terms & Conditions of Commercial Sale</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Statutory framework governing retail sales, commercial invoicing, and legal jurisdiction
          </p>
        </div>

        <Link to="/help-policies/terms/create" className="self-start sm:self-auto">
          <Button variant="outline" size="sm" icon={FileText}>
            Acknowledge Agreement
          </Button>
        </Link>
      </div>

      {/* Minimalist Metrics Bar (UI Rule 2) */}
      <div className="glass-panel py-2 px-3.5 rounded-xl border border-token text-xs font-mono flex flex-wrap items-center gap-2.5 sm:gap-3 text-secondary-token">
        <span>
          Applicable Laws: <strong className="text-primary-token font-medium">Indian Contract Act 1872 & CGST Act 2017</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Jurisdiction: <strong className="text-primary-token font-medium">Coimbatore Courts</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Arbitration: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Binding</strong>
        </span>
      </div>

      {/* Terms Body */}
      <div className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-6 text-xs text-secondary-token leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-primary-token">1. Scope of Electronic Contract</h3>
          <p>
            By initiating checkout, confirming an order, or transferring payment on Axinix E-Commerce, you enter into a legally enforceable commercial agreement governed by the Information Technology Act, 2000.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-primary-token">2. Statutory Invoicing & GST Determination</h3>
          <p>
            All displayed retail prices include applicable GST under Indian GST slabs. B2B invoices are rendered compliant with Rule 46 of the CGST Rules, 2017, capturing supplier and recipient GSTINs.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-primary-token">3. Governing Jurisdiction & Dispute Settlement</h3>
          <p>
            All disputes, claims, or controversies arising out of or relating to any transaction shall be subject to the exclusive jurisdiction of the competent civil courts located in Coimbatore, Tamil Nadu, India.
          </p>
        </section>
      </div>
    </div>
  );
}
