import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tag, Sparkles, Copy, CheckCircle2, Plus } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Badge } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

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
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              Promotions & Coupon Vouchers
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Exclusive campaign discounts, festival vouchers, and volume wholesale rebates
            </p>
          </div>
        </div>

        <Link to="/useful-additions/promotions/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Create Coupon
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Active Coupons: <strong className="text-primary-token font-medium">{formatQty(coupons.length)}</strong></span>
        <span>•</span>
        <span>Max Savings: <strong className="text-brand-token font-medium">Up to ₹2,500 Off</strong></span>
        <span>•</span>
        <span>Checkout Integration: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Engine</strong></span>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id || c.code}
            className="p-5 rounded-2xl bg-surface-elevated/40 border border-token hover:border-brand-token/40 transition-all flex flex-col justify-between space-y-4 shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-surface-elevated/80 text-brand-token border border-token text-xs font-mono font-bold tracking-wider shadow-xs">
                  {c.code}
                </span>

                <button
                  onClick={() => handleCopyCode(c.code)}
                  className="px-2.5 py-1 rounded-lg border border-token bg-surface hover:bg-surface-elevated text-secondary-token hover:text-primary-token text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                >
                  {copiedCode === c.code ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-muted-token" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-sm font-bold text-primary-token pt-1">{c.title}</h3>
              <p className="text-xs text-secondary-token leading-relaxed">{c.description}</p>
            </div>

            <div className="pt-3 border-t border-token flex items-center justify-between text-[11px] text-muted-token">
              <span>Min Order: <strong className="text-primary-token">₹{c.min_order_value ? Number(c.min_order_value).toLocaleString("en-IN") : "—"}</strong></span>
              <span>Max Cap: <strong className="text-primary-token">₹{c.max_discount_amount ? Number(c.max_discount_amount).toLocaleString("en-IN") : "—"}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
