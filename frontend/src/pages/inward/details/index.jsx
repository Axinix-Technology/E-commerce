import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Truck,
  ArrowLeft,
  Printer,
  Building2,
  Calendar,
  Package,
  QrCode,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

// Rule 1: Zero values rendered as em-dash
const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

const formatCurrency = (val) => {
  const num = Number(val);
  return !num || num === 0
    ? "—"
    : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function InwardDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inwardId = searchParams.get("id");

  const [inward, setInward] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInwardDetails = async () => {
    if (!inwardId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await populateApi.read("purchase_inward", {
        filter: { id: inwardId },
        populate: {
          vendor: ["id", "name", "vendor_code", "phone", "email", "gstin"],
          items: ["id", "quantity", "taxable_amount", "tax_rate", "tax_amount", "total_amount", "variant"],
        },
      });

      if (res?.data && res.data.length > 0) {
        setInward(res.data[0]);
      } else {
        toast.error("Inward record not found");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load inward details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInwardDetails();
  }, [inwardId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-text-muted">
        <Truck className="w-8 h-8 animate-bounce mx-auto mb-2 text-primary" />
        Loading inward details...
      </div>
    );
  }

  if (!inward) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-text-muted text-sm">Please select a valid GRN to inspect.</p>
        <Link
          to="/inward/purchase"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inward List
        </Link>
      </div>
    );
  }

  const itemsList = inward.items || [];
  const totalUnits = itemsList.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/inward/purchase"
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary tracking-tight">
                GRN {inward.inward_number}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Received / Stocked
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Inwarded on {inward.inward_date || new Date(inward.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary text-xs font-medium transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print GRN Slip
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Vendor: <strong className="text-primary font-medium">{inward.vendor?.name || "—"}</strong></span>
        <span>•</span>
        <span>Bill No: <strong className="text-text-primary font-medium">{inward.invoice_number || "—"}</strong></span>
        <span>•</span>
        <span>Items: <strong className="text-text-primary font-medium">{formatQty(itemsList.length)}</strong></span>
        <span>•</span>
        <span>Units: <strong className="text-text-primary font-medium">{formatQty(totalUnits)}</strong></span>
        <span>•</span>
        <span>Taxable: <strong className="text-text-primary font-medium">{formatCurrency(inward.total_taxable_amount)}</strong></span>
        <span>•</span>
        <span>Total GRN Value: <strong className="text-emerald-400 font-semibold">{formatCurrency(inward.total_amount)}</strong></span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Line Items */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <Package className="w-4 h-4 text-primary" />
              Inward Items Inspection
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-text-muted font-medium">
                    <th className="pb-2">SKU / Item</th>
                    <th className="pb-2 text-center">Inward Qty</th>
                    <th className="pb-2 text-right">Taxable Net</th>
                    <th className="pb-2 text-center">GST %</th>
                    <th className="pb-2 text-right">Tax Amount</th>
                    <th className="pb-2 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-text-primary">
                  {itemsList.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5">
                        <div className="font-mono font-medium text-text-primary">
                          {item.variant?.sku || `Variant #${item.variant_id || item.variant?.id}`}
                        </div>
                        <div className="text-[11px] text-text-muted">
                          {item.variant?.product?.name || "Product Stock"}
                        </div>
                      </td>
                      <td className="py-2.5 text-center font-medium">
                        {formatQty(item.quantity)}
                      </td>
                      <td className="py-2.5 text-right text-text-muted">
                        {formatCurrency(item.taxable_amount)}
                      </td>
                      <td className="py-2.5 text-center text-text-muted">
                        {Number(item.tax_rate) > 0 ? `${item.tax_rate}%` : "—"}
                      </td>
                      <td className="py-2.5 text-right text-text-muted">
                        {formatCurrency(item.tax_amount)}
                      </td>
                      <td className="py-2.5 text-right font-medium text-emerald-400">
                        {formatCurrency(item.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Vendor Snapshot & Costing */}
        <div className="space-y-5">
          {/* Vendor Card */}
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-primary" />
              Vendor Details
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-medium text-text-primary text-sm">
                {inward.vendor?.name}
              </div>
              <div className="text-text-muted">Code: {inward.vendor?.vendor_code || "—"}</div>
              {inward.vendor?.gstin && (
                <div className="text-text-muted font-mono">GSTIN: {inward.vendor.gstin}</div>
              )}
              {inward.vendor?.phone && (
                <div className="text-text-muted">Phone: {inward.vendor.phone}</div>
              )}
              {inward.vendor?.email && (
                <div className="text-text-muted">Email: {inward.vendor.email}</div>
              )}
            </div>
          </div>

          {/* GRN Value Card */}
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <FileText className="w-4 h-4 text-primary" />
              Valuation Breakdown
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Taxable Value:</span>
                <span>{formatCurrency(inward.total_taxable_amount)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Input GST:</span>
                <span>{formatCurrency(inward.total_tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border/40">
                <span>Total GRN Value:</span>
                <span className="text-emerald-400">{formatCurrency(inward.total_amount)}</span>
              </div>
            </div>

            {inward.remarks && (
              <div className="pt-3 border-t border-border/40 text-[11px] text-text-muted">
                <span className="font-medium text-text-primary">Remarks: </span>
                {inward.remarks}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
