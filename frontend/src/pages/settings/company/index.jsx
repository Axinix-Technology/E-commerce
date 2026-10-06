import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Edit, FileText, Landmark, MapPin, Phone, Mail } from "lucide-react";
import { Button, Badge } from "../../../components/ui";

export default function CompanySettingsIndex() {
  const [company] = useState({
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-token" />
            Company & Legal Entity Profile
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Statutory tax registrations, corporate credentials, and banking information for invoices
          </p>
        </div>
        <Link to="/settings/company/create">
          <Button variant="primary" size="sm" icon={Edit}>
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>GSTIN: <strong className="text-primary-token font-mono font-medium">{company.gstin}</strong></span>
        <span>•</span>
        <span>PAN: <strong className="text-primary-token font-mono font-medium">{company.pan}</strong></span>
        <span>•</span>
        <span>CIN: <strong className="text-brand-token font-mono font-medium">{company.cin}</strong></span>
        <span>•</span>
        <span>KYC Status: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">Verified</strong></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Corporate Identity */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-2 border-b border-token pb-2">
            <FileText className="w-4 h-4 text-brand-token" />
            Corporate Identity
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Legal Name:</span>
              <span className="font-semibold text-primary-token">{company.legal_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Trade / Brand Name:</span>
              <span className="font-semibold text-primary-token">{company.trade_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">GSTIN:</span>
              <span className="font-mono font-bold text-brand-token">{company.gstin}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">PAN:</span>
              <span className="font-mono text-primary-token">{company.pan}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-token">CIN:</span>
              <span className="font-mono text-primary-token">{company.cin}</span>
            </div>
          </div>
        </div>

        {/* Banking & Settlement Details */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-2 border-b border-token pb-2">
            <Landmark className="w-4 h-4 text-brand-token" />
            Primary Bank Account (For Invoices)
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Bank Name:</span>
              <span className="font-semibold text-primary-token">{company.bank_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Account Number:</span>
              <span className="font-mono text-primary-token">{company.bank_account}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">IFSC Code:</span>
              <span className="font-mono text-brand-token font-bold">{company.ifsc}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-token">Branch:</span>
              <span className="text-primary-token">{company.branch}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
