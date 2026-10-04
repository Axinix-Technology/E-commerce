import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ArrowRightLeft, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function StockInOutCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: `Stock-Movement-${new Date().toISOString().slice(0, 10)}`,
    date_from: new Date().toISOString().slice(0, 10),
    date_to: new Date().toISOString().slice(0, 10),
    category: "all",
    include_zero_movement: false,
    format: "excel",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Stock movement periodic reconciliation compiled!");
      navigate("/reports/stock-in-out");
    }, 700);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/reports/stock-in-out" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-accent-primary" />
            Compile Stock In / Out Periodic Ledger
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Calculate aggregate throughput, opening units, and period-end inventory balances</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Reconciliation Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Date From</label>
            <input
              type="date"
              value={form.date_from}
              onChange={(e) => setForm({ ...form, date_from: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Date To</label>
            <input
              type="date"
              value={form.date_to}
              onChange={(e) => setForm({ ...form, date_to: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Product Categories</option>
              <option value="sarees">Sarees</option>
              <option value="dupattas">Dupattas</option>
              <option value="kurtis">Kurtis</option>
              <option value="fabrics">Fabrics & Materials</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Export File Format</label>
            <select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="pdf">PDF Report</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-ground border border-border/40">
          <input
            type="checkbox"
            id="include_zero_movement"
            checked={form.include_zero_movement}
            onChange={(e) => setForm({ ...form, include_zero_movement: e.target.checked })}
            className="rounded border-border text-accent-primary focus:ring-accent-primary"
          />
          <label htmlFor="include_zero_movement" className="text-xs text-text-secondary">
            Include items with zero movements during this period
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/reports/stock-in-out" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {submitting ? "Exporting..." : "Export Movement Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
