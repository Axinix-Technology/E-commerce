import React from "react";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, Clock, MapPin, Search, ArrowRight, Package } from "lucide-react";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary-token flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-token" />
            <span>Shipping & Delivery Policy</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Pan-India express logistics, guaranteed SLAs, and tamper-evident serialized packaging
          </p>
        </div>

        <Link to="/help-policies/shipping/create" className="self-start sm:self-auto">
          <Button variant="secondary" size="sm" icon={Search}>
            Check PIN Deliverability
          </Button>
        </Link>
      </div>

      {/* Minimalist Metrics Bar (UI Rule 2) */}
      <div className="glass-panel py-2 px-3.5 rounded-xl border border-token text-xs font-mono flex flex-wrap items-center gap-2.5 sm:gap-3 text-secondary-token">
        <span>
          Metro Air Express: <strong className="text-primary-token font-medium">24 - 48 Hours</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Surface Regional: <strong className="text-primary-token font-medium">3 - 5 Days</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          PIN Code Reach: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">19,000+ PINs Pan-India</strong>
        </span>
      </div>

      {/* Service Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider">
              Metro Express (Air Tier)
            </h3>
            <Badge variant="brand" size="xs">
              24-48 Hours
            </Badge>
          </div>
          <p className="text-xs text-secondary-token leading-relaxed">
            Direct priority dispatch via BlueDart and Delhivery Express. Available across all Tier-1 capitals (Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, Kolkata).
          </p>
          <ul className="text-xs text-secondary-token space-y-1.5 pt-2">
            <li>• Same-day courier pickup for orders placed prior to 2:00 PM IST</li>
            <li>• Real-time GPS vehicle tracking and OTP delivery verification</li>
            <li>• Complimentary on all orders exceeding ₹999</li>
          </ul>
        </div>

        <div className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider">
              Standard Regional (Surface Tier)
            </h3>
            <Badge variant="neutral" size="xs">
              3-5 Days
            </Badge>
          </div>
          <p className="text-xs text-secondary-token leading-relaxed">
            Reliable transit to all Tier-2, Tier-3, and regional districts. Handled with protective waterproof barcoded cartons.
          </p>
          <ul className="text-xs text-secondary-token space-y-1.5 pt-2">
            <li>• Daily automated tracking updates dispatched via WhatsApp & SMS</li>
            <li>• Full transit insurance coverage included at zero surcharge</li>
            <li>• Flat ₹99 delivery fee for retail orders below ₹999</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
