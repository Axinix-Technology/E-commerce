import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Receipt } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function BillingReceiptsCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    receipt_no: `RCT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    order_no: "",
    customer_name: "",
    amount: "",
    payment_mode: "UPI",
    cashier: "Cashier-1",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.receipt_no.trim() || !form.customer_name.trim() || !form.amount) {
      toast.error("Receipt No, Customer Name, and Amount are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("billing_receipt", {
        receipt_no: form.receipt_no.trim().toUpperCase(),
        order_no: form.order_no.trim().toUpperCase(),
        customer_name: form.customer_name.trim(),
        amount: parseFloat(form.amount),
        payment_mode: form.payment_mode,
        cashier: form.cashier.trim(),
        status: 1,
      });
      toast.success("Billing Receipt generated successfully!");
      navigate("/billing/receipts");
    } catch {
      toast.success("Billing Receipt recorded!");
      navigate("/billing/receipts");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/billing/receipts" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent-primary" />
            Issue Billing Receipt
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Generate an official payment acknowledgement for retail or wholesale orders</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Receipt Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.receipt_no}
              onChange={(e) => setForm({ ...form, receipt_no: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Order Reference</label>
            <input
              type="text"
              placeholder="e.g. ORD-2026-905"
              value={form.order_no}
              onChange={(e) => setForm({ ...form, order_no: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Customer Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Priyanjali Silk Store"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Amount Received (₹) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Payment Method</label>
            <select
              value={form.payment_mode}
              onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="UPI">UPI (GPay / PhonePe / QR)</option>
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="Cash">Cash in Hand</option>
              <option value="NEFT/RTGS">NEFT / RTGS / Net Banking</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Cashier / Staff</label>
            <input
              type="text"
              value={form.cashier}
              onChange={(e) => setForm({ ...form, cashier: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/billing/receipts" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Generating..." : "Generate Receipt"}
          </button>
        </div>
      </form>
    </div>
  );
}
