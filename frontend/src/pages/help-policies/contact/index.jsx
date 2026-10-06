import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Button, Badge } from "../../../components/ui";

export default function ContactSupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              Contact & Customer Support
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Dedicated enterprise support for statutory billing, transit queries, and return logistics
            </p>
          </div>
        </div>

        <Link to="/help-policies/contact/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Submit Support Ticket
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Support Channels: <strong className="text-primary-token font-medium">Email • Phone • WhatsApp</strong></span>
        <span>•</span>
        <span>First Response SLA: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">&lt; 2 Hours</strong></span>
        <span>•</span>
        <span>Availability: <strong className="text-brand-token font-medium">Mon-Sat (9 AM - 7 PM IST)</strong></span>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-elevated/40 border border-token space-y-2 shadow-xs">
          <div className="p-2.5 w-fit rounded-xl bg-surface-elevated/80 border border-token text-brand-token">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-primary-token">Direct Email Assistance</h3>
          <p className="text-[11px] text-muted-token">Invoicing, GSTR-2B, returns, and general inquiries</p>
          <a
            href="mailto:support@axinix.com"
            className="text-xs text-brand-token hover:underline font-mono block pt-1"
          >
            support@axinix.com
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated/40 border border-token space-y-2 shadow-xs">
          <div className="p-2.5 w-fit rounded-xl bg-surface-elevated/80 border border-token text-brand-token">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-primary-token">Direct Toll-Free Line</h3>
          <p className="text-[11px] text-muted-token">Immediate telephone assistance with order dispatch</p>
          <a
            href="tel:+918002938192"
            className="text-xs text-brand-token hover:underline font-mono block pt-1"
          >
            +91 (800) 293-8192
          </a>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated/40 border border-token space-y-2 shadow-xs">
          <div className="p-2.5 w-fit rounded-xl bg-surface-elevated/80 border border-token text-brand-token">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-primary-token">WhatsApp Business</h3>
          <p className="text-[11px] text-muted-token">Real-time parcel tracking and sizing guidance</p>
          <span className="text-xs text-brand-token font-mono block pt-1">
            +91 98765 43210
          </span>
        </div>
      </div>

      {/* Fulfillment Center HQ */}
      <div className="p-5 md:p-6 rounded-2xl bg-surface-elevated/40 border border-token space-y-3 shadow-xs">
        <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider">
          Fulfillment Headquarters & Central Hub
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-primary-token block">Axinix Commerce Private Limited</span>
            <p className="text-muted-token">Plot 14-B, Avinashi Road Commercial Corridor</p>
            <p className="text-muted-token">Peelamedu, Coimbatore, Tamil Nadu - 641004</p>
            <p className="text-muted-token font-mono">GSTIN: 33AAAAA0000A1Z5</p>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-primary-token block">Operating Hours</span>
            <p className="text-muted-token">Monday to Saturday: 09:00 AM – 07:00 PM IST</p>
            <p className="text-muted-token">Sunday: Closed for inventory physical audits</p>
            <p className="text-brand-token font-medium">Statutory Tax Portal: 24/7 API Sync Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
