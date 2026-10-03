import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Privacy Policy & Data Protection</span>
          </h1>
          <p className="text-xs text-gray-400">
            Adherence to the Digital Personal Data Protection (DPDP) Act, 2023
          </p>
        </div>

        <Link
          to="/help-policies/privacy-policy/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          <Lock className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Manage Data Consent</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Compliance: <strong className="text-white">DPDP Act 2023</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Data Encryption: <strong className="text-emerald-400">AES-256 Bit</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Third-Party Monetization: <strong className="text-white">Strict Zero</strong>
        </span>
      </div>

      {/* Articles */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6 text-xs text-gray-300 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>1. Information We Collect</span>
          </h3>
          <p>
            We collect personal identity credentials (Name, Phone Number, Email), delivery addresses, and statutory B2B tax identifiers (GSTIN, Company Name) exclusively for order execution, statutory tax compliance, and courier fulfillment.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>2. Statutory Invoicing & Audit Records</span>
          </h3>
          <p>
            Under Section 16 of the Central Goods and Services Tax (CGST) Act, invoices and transaction ledgers must be retained for 72 months from the due date of filing the relevant annual return. We guarantee that your financial records are maintained in isolated, tamper-evident vaults.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[var(--brand-primary)]" />
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
