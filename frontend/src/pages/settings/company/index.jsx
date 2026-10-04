import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Edit, CheckCircle2, MapPin, Phone, Mail, FileText, Landmark } from "lucide-react";

export default function CompanySettingsIndex() {
  const [company, setCompany] = useState({
    legal_name: "Axinix Silk & Handlooms Private Limited",
    trade_name: "Axinix Textiles",
    gstin: "33AAACA1234F1Z8",
    pan: "AAACA1234F",
    cin: "U17111TN2026PTC109922",
    email: "corporate@axinixtextiles.com",
    phone: "+91 44 2815 9900",
    registered_address: "No. 42, Usman Road, T. Nagar, Chennai - 600017, Tamil Nadu, India",
    bank_name: "HDFC Bank Ltd",
    bank_account: "50200088991122",
    ifsc: "HDFC0000128",
    branch: "T. Nagar Branch, Chennai",
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-accent-primary" />
            Company & Legal Entity Profile
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Statutory tax registrations, corporate credentials, and banking information for invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/settings/company/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>GSTIN: <strong className="text-text-primary font-mono font-medium">{company.gstin}</strong></span>
        <span>•</span>
        <span>PAN: <strong className="text-text-primary font-mono font-medium">{company.pan}</strong></span>
        <span>•</span>
        <span>CIN: <strong className="text-accent-primary font-mono font-medium">{company.cin}</strong></span>
        <span>•</span>
        <span>KYC & Legal Verification: <strong className="text-emerald-400 font-medium">Verified</strong></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-3">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border/40 pb-2">
            <FileText className="w-4 h-4 text-accent-primary" />
            Corporate Identity
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Legal Registered Name</span>
              <span className="font-semibold text-text-primary">{company.legal_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Trade / Brand Name</span>
              <span className="font-semibold text-text-primary">{company.trade_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Official Email</span>
              <span className="text-accent-primary">{company.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Official Phone</span>
              <span className="text-text-primary">{company.phone}</span>
            </div>
            <div className="py-1">
              <span className="text-text-secondary block mb-0.5">Registered Office Address</span>
              <span className="text-text-primary flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                {company.registered_address}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-3">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-border/40 pb-2">
            <Landmark className="w-4 h-4 text-accent-primary" />
            Bank & Remittance Details
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Bank Name</span>
              <span className="font-semibold text-text-primary">{company.bank_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">Current Account No</span>
              <span className="font-mono font-semibold text-text-primary">{company.bank_account}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/30">
              <span className="text-text-secondary">IFSC Code</span>
              <span className="font-mono font-semibold text-accent-primary">{company.ifsc}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-text-secondary">Bank Branch</span>
              <span className="text-text-primary">{company.branch}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
