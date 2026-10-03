import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, PackageCheck, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function AvailableStockCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    audit_title: `Available-Stock-Audit-${new Date().toISOString().slice(0, 10)}`,
    branch: "all",
    category: "all",
    zero_stock_filter: "exclude",
    format: "excel",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Available stock audit snapshot generated!");
      navigate("/reports/available-stock");
    }, 700);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/reports/available-stock" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-accent-primary" />
            Capture Available Stock Audit Snapshot
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Export physical sellable inventory counts with barcode serial breakdowns</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Audit Snapshot Title</label>
          <input
            type="text"
            required
            value={form.audit_title}
            onChange={(e) => setForm({ ...form, audit_title: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Branch / Location</label>
            <select
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Branches & Central Warehouse</option>
              <option value="chennai">Chennai Flagship</option>
              <option value="tnagar">T. Nagar Showroom</option>
              <option value="central">Central Warehouse</option>
              <option value="coimbatore">Coimbatore Branch</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Category Filter</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Categories</option>
              <option value="sarees">Sarees</option>
              <option value="dupattas">Dupattas</option>
              <option value="kurtis">Kurtis</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Zero Stock Items</label>
            <select
              value={form.zero_stock_filter}
              onChange={(e) => setForm({ ...form, zero_stock_filter: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="exclude">Exclude Zero Stock Items</option>
              <option value="include">Include Out-of-Stock Items</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Export File Type</label>
            <select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="excel">Excel Sheet (.xlsx)</option>
              <option value="csv">CSV Flat File (.csv)</option>
              <option value="pdf">Formatted PDF Document</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/reports/available-stock" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {submitting ? "Compiling..." : "Export Snapshot"}
          </button>
        </div>
      </form>
    </div>
  );
}
