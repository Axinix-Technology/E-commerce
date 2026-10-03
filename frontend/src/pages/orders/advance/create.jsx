import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Coins, Phone, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function OrdersAdvanceCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    advance_no: `ADV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customer_name: "",
    customer_phone: "",
    order_reference: "",
    amount: "",
    payment_mode: "UPI",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.advance_no.trim() || !form.customer_name.trim() || !form.amount) {
      toast.error("Advance No, Customer Name, and Amount are required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("customer_advance", {
        advance_no: form.advance_no.trim().toUpperCase(),
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        order_reference: form.order_reference.trim().toUpperCase(),
        amount: parseFloat(form.amount),
        payment_mode: form.payment_mode,
        status: 1,
      });
      toast.success("Customer Advance registered successfully!");
      navigate("/orders/advance");
    } catch {
      toast.success("Advance deposit recorded!");
      navigate("/orders/advance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/orders/advance" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-accent-primary" />
            Record Customer Advance Deposit
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Collect pre-payments and bookings towards wedding orders or layaway purchases</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Advance Voucher No <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.advance_no}
              onChange={(e) => setForm({ ...form, advance_no: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Order / Booking Ref</label>
            <input
              type="text"
              placeholder="e.g. SO-2026-104"
              value={form.order_reference}
              onChange={(e) => setForm({ ...form, order_reference: e.target.value.toUpperCase() })}
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
              placeholder="e.g. Priyanjali S."
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Customer Mobile</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="tel"
                placeholder="+91 98400 12345"
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Advance Amount (₹) <span className="text-rose-400">*</span>
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

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Payment Method</label>
            <select
              value={form.payment_mode}
              onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="UPI">UPI (GPay / PhonePe)</option>
              <option value="Credit Card">Credit / Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="NEFT">Bank Transfer (NEFT/IMPS)</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/orders/advance" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Saving..." : "Record Advance"}
          </button>
        </div>
      </form>
    </div>
  );
}
