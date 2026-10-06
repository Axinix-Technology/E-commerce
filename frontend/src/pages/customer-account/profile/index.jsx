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
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

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
          <h1 className="text-xl font-bold tracking-tight text-primary-token flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-token" />
            <span>Account Profile</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Manage your personal credentials, B2B tax identification, and delivery settings
          </p>
        </div>

        <Link to="/customer-account/profile/create" className="self-start sm:self-auto">
          <Button variant="secondary" size="sm" icon={Edit2}>
            Edit Credentials
          </Button>
        </Link>
      </div>

      {/* Minimalist Metrics Bar (UI Rule 2) */}
      <div className="glass-panel py-2 px-3.5 rounded-xl border border-token text-xs font-mono flex flex-wrap items-center gap-2.5 sm:gap-3 text-secondary-token">
        <span>
          Customer Type: <strong className="text-primary-token uppercase font-medium">{profile.customer_type}</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Verification: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Active & Verified</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Statutory Invoicing: <strong className="text-brand-token font-medium">GSTR-2B Ready</strong>
        </span>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Personal Credentials */}
        <div className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider">
              Identity & Contact
            </h3>
            <Badge variant="emerald" size="xs">
              Verified
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-token block">Full Name</span>
              <p className="font-bold text-primary-token text-sm mt-0.5">{profile.name}</p>
            </div>
            <div>
              <span className="text-muted-token block">Mobile Phone</span>
              <p className="font-mono text-secondary-token mt-0.5">{profile.phone}</p>
            </div>
            <div>
              <span className="text-muted-token block">Email Address</span>
              <p className="text-secondary-token mt-0.5">{profile.email}</p>
            </div>
          </div>
        </div>

        {/* B2B Statutory Credentials */}
        <div className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider">
              Tax & Invoicing (ITC)
            </h3>
            <Badge variant="neutral" size="xs">
              B2B / B2C
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted-token block">Registered Company / Trade Name</span>
              <p className="font-bold text-primary-token mt-0.5">{profile.company_name || "—"}</p>
            </div>
            <div>
              <span className="text-muted-token block">GSTIN Identification</span>
              <p className="font-mono text-brand-token font-bold mt-0.5">{profile.gstin || "—"}</p>
            </div>
            <div>
              <span className="text-muted-token block">Primary Place of Supply</span>
              <p className="text-secondary-token mt-0.5">{profile.state}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/customer-account/orders"
          className="card-surface hover:bg-surface-elevated p-4 rounded-2xl border border-token transition-all flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-brand-token/10 text-brand-token border border-brand-token/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-primary-token">Order History</h4>
            <p className="text-[11px] text-muted-token">View past sales invoices</p>
          </div>
        </Link>

        <Link
          to="/customer-account/addresses"
          className="card-surface hover:bg-surface-elevated p-4 rounded-2xl border border-token transition-all flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-brand-token/10 text-brand-token border border-brand-token/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-primary-token">Saved Addresses</h4>
            <p className="text-[11px] text-muted-token">Manage delivery locations</p>
          </div>
        </Link>

        <Link
          to="/customer-account/reset-password"
          className="card-surface hover:bg-surface-elevated p-4 rounded-2xl border border-token transition-all flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-brand-token/10 text-brand-token border border-brand-token/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-primary-token">Security & Password</h4>
            <p className="text-[11px] text-muted-token">Update login credentials</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
