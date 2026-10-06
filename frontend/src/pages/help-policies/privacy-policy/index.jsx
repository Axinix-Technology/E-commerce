import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary-token flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-token" />
            <span>Privacy Policy & Data Protection</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Adherence to the Digital Personal Data Protection (DPDP) Act, 2023
          </p>
        </div>

        <Link to="/help-policies/privacy-policy/create" className="self-start sm:self-auto">
          <Button variant="outline" size="sm" icon={Lock}>
            Manage Data Consent
          </Button>
        </Link>
      </div>

      {/* Minimalist Metrics Bar (UI Rule 2) */}
      <div className="glass-panel py-2 px-3.5 rounded-xl border border-token text-xs font-mono flex flex-wrap items-center gap-2.5 sm:gap-3 text-secondary-token">
        <span>
          Compliance: <strong className="text-primary-token font-medium">DPDP Act 2023</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Data Encryption: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">AES-256 Bit</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Third-Party Monetization: <strong className="text-primary-token font-medium">—</strong>
        </span>
      </div>

      {/* Articles */}
      <div className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-6 text-xs text-secondary-token leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-primary-token flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-token" />
            <span>1. Information We Collect</span>
          </h3>
          <p>
            We collect personal identity credentials (Name, Phone Number, Email), delivery addresses, and statutory B2B tax identifiers (GSTIN, Company Name) exclusively for order execution, statutory tax compliance, and courier fulfillment.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-primary-token flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-token" />
            <span>2. Statutory Invoicing & Audit Records</span>
          </h3>
          <p>
            Under Section 16 of the Central Goods and Services Tax (CGST) Act, invoices and transaction ledgers must be retained for 72 months from the due date of filing the relevant annual return. We guarantee that your financial records are maintained in isolated, tamper-evident vaults.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-primary-token flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-token" />
            <span>3. Customer Rights & Data Consent</span>
          </h3>
          <p>
            You retain sovereign control over your personal information. You may request data exports, update communication preferences, or request erasure of non-statutory records at any time.
          </p>
        </section>
      </div>
    </div>
  );
}
