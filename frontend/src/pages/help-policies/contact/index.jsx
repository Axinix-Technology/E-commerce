import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  Plus,
  ArrowRight
} from "lucide-react";

export default function ContactSupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Contact & Customer Support</span>
          </h1>
          <p className="text-xs text-gray-400">
            Dedicated enterprise support for statutory billing, transit queries, and return logistics
          </p>
        </div>

        <Link
          to="/help-policies/contact/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Support Ticket</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Support Channels: <strong className="text-white">Email • Phone • WhatsApp</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          First Response SLA: <strong className="text-emerald-400">&lt; 2 Hours</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Availability: <strong className="text-[var(--brand-primary)]">Mon-Sat (9 AM - 7 PM IST)</strong>
        </span>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-[rgba(0,210,210,0.1)] text-[var(--brand-primary)]">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-white">Direct Email Assistance</h3>
          <p className="text-[11px] text-gray-400">Invoicing, GSTR-2B, returns, and general inquiries</p>
          <a
            href="mailto:support@axinix.com"
            className="text-xs text-[var(--brand-primary)] hover:underline font-mono block pt-1"
          >
            support@axinix.com
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-[rgba(0,210,210,0.1)] text-[var(--brand-primary)]">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-white">Direct Toll-Free Line</h3>
          <p className="text-[11px] text-gray-400">Immediate telephone assistance with order dispatch</p>
          <a
            href="tel:+918002938192"
            className="text-xs text-[var(--brand-primary)] hover:underline font-mono block pt-1"
          >
            +91 (800) 293-8192
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-[rgba(0,210,210,0.1)] text-[var(--brand-primary)]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-white">WhatsApp Business</h3>
          <p className="text-[11px] text-gray-400">Real-time parcel tracking and sizing guidance</p>
          <span className="text-xs text-[var(--brand-primary)] font-mono block pt-1">
            +91 98765 43210
          </span>
        </div>
      </div>

      {/* Fulfillment Center HQ */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
        <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
          Fulfillment Headquarters & Central Hub
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500 block mb-1">Corporate & Logistics Address</span>
            <p className="font-bold text-white">Axinix Technologies Private Limited</p>
            <p className="text-gray-300">Phase II, Avinashi Road Tech Park, Peelamedu</p>
            <p className="text-gray-400">Coimbatore, Tamil Nadu - 641004, India</p>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Statutory Registrations</span>
            <p className="text-gray-300">GSTIN: <strong className="text-white font-mono">33AABCA1234F1Z5</strong></p>
            <p className="text-gray-300">State Jurisdiction: <strong className="text-white">Tamil Nadu (33)</strong></p>
            <p className="text-gray-300">CIN: <strong className="text-white font-mono">U72900TZ2026PTC039482</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
