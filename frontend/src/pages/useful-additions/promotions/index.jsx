import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tag, Sparkles, Copy, CheckCircle2, Clock, Plus, ArrowRight } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function PromotionsPage() {
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    populateApi.read("promotion_coupon", {
      limit: 20,
      filter: { status: 1 },
      sort: ["-created_at"],
    })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setCoupons(res.data);
        } else {
          // Fallback baseline coupons
          setCoupons([
            {
              id: 1,
              code: "AXINIX10",
              title: "Flat 10% Off Everything",
              description: "Valid across all catalogued couture and apparel lines.",
              discount_type: "percentage",
              discount_value: 10,
              min_order_value: 1000,
              max_discount_amount: 500,
              valid_until: "2026-12-31",
            },
            {
              id: 2,
              code: "WELCOME15",
              title: "New Customer Welcome Bonus",
              description: "Exclusive 15% discount for first-time retail buyers.",
              discount_type: "percentage",
              discount_value: 15,
              min_order_value: 1500,
              max_discount_amount: 750,
              valid_until: "2026-11-30",
            },
            {
              id: 3,
              code: "BULK25",
              title: "Enterprise Wholesale Discount",
              description: "Save 25% on volume orders above ₹5,000.",
              discount_type: "percentage",
              discount_value: 25,
              min_order_value: 5000,
              max_discount_amount: 2500,
              valid_until: "2026-12-31",
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Promotions & Coupon Vouchers</span>
          </h1>
          <p className="text-xs text-gray-400">
            Exclusive campaign discounts, festival vouchers, and volume wholesale rebates
          </p>
        </div>

        <Link
          to="/useful-additions/promotions/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Active Coupons: <strong className="text-white">{coupons.length || "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Max Savings: <strong className="text-[var(--brand-primary)]">Up to ₹2,500 Off</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Stackable: <strong className="text-emerald-400">Cart Integrated</strong>
        </span>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id || c.code}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[rgba(0,210,210,0.3)] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-[rgba(0,210,210,0.15)] text-[var(--brand-primary)] border border-[rgba(0,210,210,0.3)] text-xs font-mono font-bold tracking-wider">
                  {c.code}
                </span>

                <button
                  onClick={() => handleCopyCode(c.code)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedCode === c.code ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-sm font-bold text-white pt-1">{c.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{c.description}</p>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-gray-400">
              <span>Min Order: <strong className="text-gray-200">₹{c.min_order_value?.toLocaleString("en-IN") || 0}</strong></span>
              <span>Max Cap: <strong className="text-gray-200">₹{c.max_discount_amount?.toLocaleString("en-IN") || 0}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
