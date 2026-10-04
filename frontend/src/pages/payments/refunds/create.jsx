import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  RotateCcw,
  ArrowLeft,
  Save,
  CreditCard,
  ShoppingBag,
  DollarSign
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

export default function ProcessRefundPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillReturnId = searchParams.get("return_id");
  const prefillSaleId = searchParams.get("sale_id");

  const [returnsList, setReturnsList] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    sales_return_id: prefillReturnId || "",
    sale_id: prefillSaleId || "",
    amount: "",
    payment_method: "upi",
    reference_number: `REF-${Date.now().toString().slice(-6)}`,
    notes: "Refund processed to original source account",
  });

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [retRes, salesRes] = await Promise.all([
          populateApi.read("sales_return", { limit: 50, sort: ["-requested_at"] }),
          populateApi.read("sale", { limit: 50, sort: ["-sold_at"] }),
        ]);

        if (retRes?.data) setReturnsList(retRes.data);
        if (salesRes?.data) setSalesList(salesRes.data);
      } catch (err) {
        console.error("Failed loading returns/sales lookups", err);
      }
    };

    loadLookups();
  }, []);

  const handleReturnSelect = (returnId) => {
    setFormData((prev) => ({ ...prev, sales_return_id: returnId }));
    const found = returnsList.find((r) => String(r.id) === String(returnId));
    if (found) {
      setFormData((prev) => ({
        ...prev,
        sale_id: found.sale?.id || prev.sale_id,
        amount: found.total_refund_amount || prev.amount,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const payload = {
        sale_id: formData.sale_id || null,
        sales_return_id: formData.sales_return_id || null,
        transaction_type: "refund",
        amount: Number(formData.amount),
        payment_method: formData.payment_method,
        reference_number: formData.reference_number || `REF-${Date.now().toString().slice(-6)}`,
        transacted_at: now,
        notes: formData.notes || "",
      };

      await populateApi.create("sale_payment", payload);

      // If associated with a return, mark it refunded
      if (formData.sales_return_id) {
        await populateApi.update("sales_return", formData.sales_return_id, {
          status: "refunded",
        });
      }

      toast.success("Refund processed successfully!");
      navigate("/payments/refunds");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to process refund");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/payments/refunds"
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Process Refund Voucher</h1>
            <p className="text-xs text-text-muted">Issue refund payout to customer account or store credit</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Processing..." : "Disburse Refund"}
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Payment Method: <strong className="text-primary font-medium capitalize">{formData.payment_method}</strong></span>
        <span>•</span>
        <span>Refund Disbursal: <strong className="text-rose-400 font-semibold">{formatCurrency(formData.amount)}</strong></span>
        <span>•</span>
        <span>Mode: <strong className="text-text-primary font-medium">Reversal Payout</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        <div className="p-5 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Linked Return Request (Optional)
              </label>
              <select
                value={formData.sales_return_id}
                onChange={(e) => handleReturnSelect(e.target.value)}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              >
                <option value="">-- No Linked Return Request --</option>
                {returnsList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.return_number} - Refund: ₹{r.total_refund_amount} ({r.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Linked Sale Order (Optional)
              </label>
              <select
                value={formData.sale_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, sale_id: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              >
                <option value="">-- Direct Refund --</option>
                {salesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.sale_number} - {s.customer_name || "Guest"} (₹{s.total_amount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Refund Amount (₹) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none text-rose-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Refund Reference Number
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, reference_number: e.target.value }))}
                placeholder="e.g. REF-2026-001"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Payout Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData((prev) => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none capitalize"
              >
                <option value="upi">UPI Reversal</option>
                <option value="cash">Counter Cash Payout</option>
                <option value="bank_transfer">Bank Transfer (NEFT)</option>
                <option value="card">Card Chargeback Credit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1">
              Refund Reason / Notes
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Reason for refund approval, payment gateway transaction ID..."
              className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Disburse Refund"}
          </button>
        </div>
      </form>
    </div>
  );
}
