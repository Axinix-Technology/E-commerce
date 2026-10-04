import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, FileSpreadsheet } from "lucide-react";

export default function BarcodeEditLogFilter() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date_from: "",
    date_to: "",
  });

  const handleApply = (e) => {
    e.preventDefault();
    navigate(`/inventory/barcode-edit-log?from=${form.date_from}&to=${form.date_to}`);
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/inventory/barcode-edit-log" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent-primary" />
            Filter Barcode Edit Log
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Filter historical barcode changes by date ranges</p>
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

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/inventory/barcode-edit-log" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            Filter Log
          </button>
        </div>
      </form>
    </div>
  );
}
