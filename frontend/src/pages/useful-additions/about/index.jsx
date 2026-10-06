import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  TrendingUp,
  Award,
  Handshake,
} from "lucide-react";
import { Button, Badge } from "../../../components/ui";

export default function AboutUsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              About Axinix E-Commerce
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Crafting luxury apparel with ERP-grade inventory accuracy & statutory integrity
            </p>
          </div>
        </div>

        <Link to="/useful-additions/about/create">
          <Button variant="primary" size="sm" icon={Handshake}>
            Partner with Us
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Barcode Accuracy: <strong className="text-primary-token font-medium">99.98%</strong></span>
        <span>•</span>
        <span>Statutory Compliance: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Audit Ready</strong></span>
        <span>•</span>
        <span>Fulfillment Hubs: <strong className="text-brand-token font-medium">Coimbatore & Mumbai</strong></span>
      </div>

      {/* Narrative Section */}
      <div className="p-5 md:p-6 rounded-2xl bg-surface-elevated/40 border border-token space-y-3 text-xs text-secondary-token leading-relaxed shadow-xs">
        <h2 className="text-sm font-bold text-primary-token uppercase tracking-wider">
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
        <div className="p-5 rounded-2xl bg-surface-elevated/40 border border-token space-y-2 shadow-xs">
          <Award className="w-6 h-6 text-brand-token" />
          <h3 className="text-xs font-bold text-primary-token">Artisan Weaving Standards</h3>
          <p className="text-[11px] text-muted-token">
            Hand-selected natural fibers including European flax linen, Giza cotton, and pure Kashmir silk.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated/40 border border-token space-y-2 shadow-xs">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold text-primary-token">Statutory GST Precision</h3>
          <p className="text-[11px] text-muted-token">
            Automated CGST, SGST, and IGST Place of Supply tax determination for 100% GSTR-2B compliance.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-elevated/40 border border-token space-y-2 shadow-xs">
          <TrendingUp className="w-6 h-6 text-brand-token" />
          <h3 className="text-xs font-bold text-primary-token">Omnichannel Scale</h3>
          <p className="text-[11px] text-muted-token">
            Seamless multi-channel inventory synchronization across our storefront, Amazon, and Flipkart.
          </p>
        </div>
      </div>
    </div>
  );
}
