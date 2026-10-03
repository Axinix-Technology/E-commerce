import React from "react";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, Clock, MapPin, Search, ArrowRight, Package } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Shipping & Delivery Policy</span>
          </h1>
          <p className="text-xs text-gray-400">
            Pan-India express logistics, guaranteed SLAs, and tamper-evident serialized packaging
          </p>
        </div>

        <Link
          to="/help-policies/shipping/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Check PIN Deliverability</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Metro Air Express: <strong className="text-white">24 - 48 Hours</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Surface Regional: <strong className="text-white">3 - 5 Days</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          PIN Code Reach: <strong className="text-emerald-400">19,000+ PINs Pan-India</strong>
        </span>
      </div>

      {/* Service Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
              Metro Express (Air Tier)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(0,210,210,0.15)] text-[var(--brand-primary)]">
              24-48 Hours
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Direct priority dispatch via BlueDart and Delhivery Express. Available across all Tier-1 capitals (Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata).
          </p>
          <ul className="text-xs text-gray-400 space-y-1.5 pt-2">
            <li>• Same-day courier pickup for orders placed prior to 2:00 PM IST</li>
            <li>• Real-time GPS vehicle tracking and OTP delivery verification</li>
            <li>• Complimentary on all orders exceeding ₹999</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
              Standard Regional (Surface Tier)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-gray-300">
              3-5 Days
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Reliable transit to all Tier-2, Tier-3, and regional districts. Handled with protective waterproof barcoded cartons.
          </p>
          <ul className="text-xs text-gray-400 space-y-1.5 pt-2">
            <li>• Daily automated tracking updates dispatched via WhatsApp & SMS</li>
            <li>• Full transit insurance coverage included at zero surcharge</li>
            <li>• Flat ₹99 delivery fee for retail orders below ₹999</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
