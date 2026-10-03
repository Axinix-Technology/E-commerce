import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  ArrowLeft,
  Save,
  ShoppingBag,
  User,
  DollarSign,
  CheckCircle2
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

export default function RecordPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillSaleId = searchParams.get("sale_id");

  const [salesList, setSalesList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    sale_id: prefillSaleId || "",
    customer_id: "",
    transaction_type: "payment",
    amount: "",
    payment_method: "cash",
    reference_number: `PAY-${Date.now().toString().slice(-6)}`,
    notes: "",
  });

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [salesRes, custRes] = await Promise.all([
          populateApi.read("sale", { limit: 50, sort: ["-sold_at"] }),
          populateApi.read("customer_master", { limit: 50, sort: ["name"] }),
        ]);

        if (salesRes?.data) setSalesList(salesRes.data);
        if (custRes?.data) setCustomers(custRes.data);
      } catch (err) {
        console.error("Failed loading lookup data", err);
      }
    };

    loadLookups();
  }, []);

  const handleSaleSelect = (saleId) => {
    setFormData((prev) => ({ ...prev, sale_id: saleId }));
    const found = salesList.find((s) => String(s.id) === String(saleId));
    if (found) {
      setFormData((prev) => ({
        ...prev,
        customer_id: found.customer?.id || prev.customer_id,
        amount: found.total_amount || prev.amount,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const payload = {
        sale_id: formData.sale_id || null,
        customer_id: formData.customer_id || null,
        transaction_type: formData.transaction_type,
        amount: Number(formData.amount),
        payment_method: formData.payment_method,
        reference_number: formData.reference_number || `PAY-${Date.now().toString().slice(-6)}`,
        transacted_at: now,
        notes: formData.notes || "",
      };

      await populateApi.create("sale_payment", payload);
      toast.success("Payment recorded successfully!");
      navigate("/payments/index");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to record payment");
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
            to="/payments/index"
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Record Payment Receipt</h1>
            <p className="text-xs text-text-muted">Enter manual payment collections or settlement vouchers</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Saving..." : "Save Payment"}
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Payment Method: <strong className="text-primary font-medium capitalize">{formData.payment_method}</strong></span>
        <span>•</span>
        <span>Transaction Type: <strong className="text-text-primary font-medium capitalize">{formData.transaction_type}</strong></span>
        <span>•</span>
        <span>Amount Payable: <strong className="text-emerald-400 font-semibold">{formatCurrency(formData.amount)}</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        <div className="p-5 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Linked Sale Order (Optional)
              </label>
              <select
                value={formData.sale_id}
                onChange={(e) => handleSaleSelect(e.target.value)}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              >
                <option value="">-- No Linked Order / Standalone Receipt --</option>
                {salesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.sale_number} - {s.customer_name || "Guest"} (₹{s.total_amount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Customer (Optional)
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, customer_id: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              >
                <option value="">-- Guest / Counter Walk-in --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || "No phone"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Amount Received (₹) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Payment Reference / Transaction ID
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, reference_number: e.target.value }))}
                placeholder="e.g. UPI-998822 or CHQ-00123"
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Payment Method
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData((prev) => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none capitalize"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="card">Card (POS Terminal)</option>
                <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Transaction Type
              </label>
              <select
                value={formData.transaction_type}
                onChange={(e) => setFormData((prev) => ({ ...prev, transaction_type: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none capitalize"
              >
                <option value="payment">Payment Inward</option>
                <option value="refund">Refund Outward</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1">
              Remarks / Voucher Notes
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Settlement notes, counter shift details..."
              className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Record Payment Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
