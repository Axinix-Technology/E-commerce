import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, CreditCard } from "lucide-react";

export default function SupplierPaymentFilter() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    payment_method: "all",
    date_from: "",
    date_to: "",
  });

  const handleApply = (e) => {
    e.preventDefault();
    navigate(`/purchase/reports/supplier-payment-report?method=${form.payment_method}&from=${form.date_from}&to=${form.date_to}`);
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/purchase/reports/supplier-payment-report" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent-primary" />
            Filter Supplier Payments
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Filter payments by disbursal mode, date range, or transaction reference</p>
        </div>
      </div>

      <form onSubmit={handleApply} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Payment Method</label>
          <select
            value={form.payment_method}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="all">All Payment Methods</option>
            <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
            <option value="upi">UPI / IMPS</option>
            <option value="cheque">Cheque</option>
            <option value="cash">Counter Cash</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">From Date</label>
            <input
              type="date"
              value={form.date_from}
              onChange={(e) => setForm({ ...form, date_from: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">To Date</label>
            <input
              type="date"
              value={form.date_to}
              onChange={(e) => setForm({ ...form, date_to: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/purchase/reports/supplier-payment-report" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            Apply Filter
          </button>
        </div>
      </form>
    </div>
  );
}
