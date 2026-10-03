import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Phone,
  Mail,
  Receipt,
  MapPin,
  CheckCircle2,
  Edit2,
  ShieldCheck,
  Package,
  CreditCard
} from "lucide-react";

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState({
    name: "Alex Mercer",
    phone: "+91 9876543210",
    email: "alex@example.com",
    customer_type: "b2c",
    company_name: "Mercer Retail Enterprises",
    gstin: "27AAACM1234F1Z5",
    pan_number: "AAACM1234F",
    city: "Mumbai",
    state: "Maharashtra (27)",
    pincode: "400050",
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("customer_user") || "null");
    if (stored) {
      setProfile((prev) => ({ ...prev, ...stored }));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Account Profile</span>
          </h1>
          <p className="text-xs text-gray-400">
            Manage your personal credentials, B2B tax identification, and delivery settings
          </p>
        </div>

        <Link
          to="/customer-account/profile/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Credentials</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Customer Type: <strong className="text-white uppercase">{profile.customer_type}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Verification: <strong className="text-emerald-400">Active & Verified</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Statutory Invoicing: <strong className="text-[var(--brand-primary)]">GSTR-2B Ready</strong>
        </span>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Credentials */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
              Identity & Contact
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-500 block">Full Name</span>
              <p className="font-bold text-white text-sm mt-0.5">{profile.name}</p>
            </div>
            <div>
              <span className="text-gray-500 block">Mobile Phone</span>
              <p className="font-mono text-gray-200 mt-0.5">{profile.phone}</p>
            </div>
            <div>
              <span className="text-gray-500 block">Email Address</span>
              <p className="text-gray-200 mt-0.5">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* B2B Statutory Credentials */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
              Tax & Invoicing (ITC)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10">
              B2B / B2C
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-gray-500 block">Registered Company / Trade Name</span>
              <p className="font-bold text-white mt-0.5">{profile.company_name || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500 block">GSTIN Identification</span>
              <p className="font-mono text-[var(--brand-primary)] font-bold mt-0.5">{profile.gstin || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500 block">Primary Place of Supply</span>
              <p className="text-gray-200 mt-0.5">{profile.state}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/customer-account/orders"
          className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] transition-all flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] text-[var(--brand-primary)]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Order History</h4>
            <p className="text-[11px] text-gray-400">View past sales invoices</p>
          </div>
        </Link>

        <Link
          to="/customer-account/addresses"
          className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] transition-all flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] text-[var(--brand-primary)]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Saved Addresses</h4>
            <p className="text-[11px] text-gray-400">Manage delivery locations</p>
          </div>
        </Link>

        <Link
          to="/customer-account/reset-password"
          className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] transition-all flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] text-[var(--brand-primary)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Security & Password</h4>
            <p className="text-[11px] text-gray-400">Update login credentials</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
