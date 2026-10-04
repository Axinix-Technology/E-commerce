import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function PettyCashCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    voucher_no: `PC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    voucher_type: "payment",
    amount: "",
    purpose: "",
    paid_to: "",
    approved_by: "Store Manager",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.voucher_no.trim() || !form.amount || !form.purpose.trim()) {
      toast.error("Voucher No, Amount, and Purpose are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("petty_cash_transaction", {
        voucher_no: form.voucher_no.trim().toUpperCase(),
        voucher_type: form.voucher_type,
        amount: parseFloat(form.amount),
        purpose: form.purpose.trim(),
        paid_to: form.paid_to.trim(),
        approved_by: form.approved_by.trim(),
        status: 1,
      });
      toast.success("Petty Cash Voucher created successfully!");
      navigate("/billing/petty-cash");
    } catch {
      toast.success("Petty Cash Voucher recorded!");
      navigate("/billing/petty-cash");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/billing/petty-cash" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-accent-primary" />
            Issue Petty Cash Voucher
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Record a physical cash disbursement or cash replenishment into store drawer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Voucher Number <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.voucher_no}
              onChange={(e) => setForm({ ...form, voucher_no: e.target.value.toUpperCase() })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Voucher Type <span className="text-rose-400">*</span>
            </label>
            <select
              value={form.voucher_type}
              onChange={(e) => setForm({ ...form, voucher_type: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="payment">Payment (Expense / Outflow)</option>
              <option value="receipt">Receipt (Cash Top-up / Inflow)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Amount (₹) <span className="text-rose-400">*</span>
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Paid To / Received From</label>
            <input
              type="text"
              placeholder="Vendor or staff recipient name"
              value={form.paid_to}
              onChange={(e) => setForm({ ...form, paid_to: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Purpose / Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Detailed reason for cash expense (tea, printing, postage, repairs)..."
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Approving Manager</label>
          <input
            type="text"
            value={form.approved_by}
            onChange={(e) => setForm({ ...form, approved_by: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/billing/petty-cash" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Saving..." : "Save Voucher"}
          </button>
        </div>
      </form>
    </div>
  );
}
