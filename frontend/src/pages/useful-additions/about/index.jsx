import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  Handshake,
  ArrowRight
} from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>About Axinix E-Commerce</span>
          </h1>
          <p className="text-xs text-gray-400">
            Crafting luxury apparel with ERP-grade inventory accuracy & statutory integrity
          </p>
        </div>

        <Link
          to="/useful-additions/about/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Handshake className="w-4 h-4" />
          <span>Partner with Us</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Barcode Accuracy: <strong className="text-white">99.98%</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Statutory Compliance: <strong className="text-emerald-400">100% Audit Ready</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Fulfillment Hubs: <strong className="text-[var(--brand-primary)]">Coimbatore & Mumbai</strong>
        </span>
      </div>

      {/* Narrative Section */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4 text-xs text-gray-300 leading-relaxed">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Our Operational Heritage
        </h2>
        <p>
          Founded in Coimbatore, the textile capital of South India, Axinix merges time-honored artisanal craftsmanship with modern enterprise software precision. We believe that true luxury is not merely aesthetic elegance—it is structural integrity, supply chain transparency, and rigorous statutory compliance.
        </p>
        <p>
          Every garment across our catalogued collections carries an individual serialized GS1-compliant barcode tag from the initial weaving loom through quality inspection, warehouse stocking, and final courier dispatch.
        </p>
      </div>

      {/* Core Benchmarks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <Award className="w-6 h-6 text-[var(--brand-primary)]" />
          <h3 className="text-xs font-bold text-white">Artisan Weaving Standards</h3>
          <p className="text-[11px] text-gray-400">
            Hand-selected natural fibers including European flax linen, Giza cotton, and pure Kashmir silk.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h3 className="text-xs font-bold text-white">Statutory GST Precision</h3>
          <p className="text-[11px] text-gray-400">
            Automated CGST, SGST, and IGST Place of Supply tax determination for 100% GSTR-2B compliance.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
          <TrendingUp className="w-6 h-6 text-[var(--brand-primary)]" />
          <h3 className="text-xs font-bold text-white">Omnichannel Scale</h3>
          <p className="text-[11px] text-gray-400">
            Seamless multi-channel inventory synchronization across our storefront, Amazon, and Flipkart.
          </p>
        </div>
      </div>
    </div>
  );
}
