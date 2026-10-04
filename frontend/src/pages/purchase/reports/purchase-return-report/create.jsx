import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, RotateCcw } from "lucide-react";

export default function PurchaseReturnFilter() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date_from: "",
    date_to: "",
    supplier_id: "all",
  });

  const handleApply = (e) => {
    e.preventDefault();
    navigate(`/purchase/reports/purchase-return-report?supplier=${form.supplier_id}&from=${form.date_from}&to=${form.date_to}`);
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/purchase/reports/purchase-return-report" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-accent-primary" />
            Filter Return to Vendor (RTV) Report
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Filter by date ranges, specific vendors, or debit note status</p>
        </div>
      </div>

      <form onSubmit={handleApply} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
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

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Supplier</label>
          <select
            value={form.supplier_id}
            onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="all">All Suppliers</option>
            <option value="1">Sri Lakshmi Silks Kanchipuram</option>
            <option value="2">Surat Zari Mills Pvt Ltd</option>
            <option value="3">Varanasi Heritage Handlooms</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/purchase/reports/purchase-return-report" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
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
