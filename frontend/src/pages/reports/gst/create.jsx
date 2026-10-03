import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function GstReportCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    return_type: "GSTR-1",
    financial_year: "2026-2027",
    month: "September",
    include_hsn: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("GST Return file generated in government portal JSON/Excel schema!");
      navigate("/reports/gst");
    }, 700);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/reports/gst" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent-primary" />
            Generate GST Return Data
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Prepare GSTR-1 outward supply JSON or Excel upload sheets for the GSTN Portal</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Return Type</label>
            <select
              value={form.return_type}
              onChange={(e) => setForm({ ...form, return_type: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="GSTR-1">GSTR-1 (Outward Supplies)</option>
              <option value="GSTR-3B">GSTR-3B (Monthly Summary)</option>
              <option value="GSTR-9">GSTR-9 (Annual Return)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Financial Year</label>
            <select
              value={form.financial_year}
              onChange={(e) => setForm({ ...form, financial_year: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="2026-2027">FY 2026 - 2027</option>
              <option value="2025-2026">FY 2025 - 2026</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Return Month</label>
          <select
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-ground border border-border/40">
          <input
            type="checkbox"
            id="include_hsn"
            checked={form.include_hsn}
            onChange={(e) => setForm({ ...form, include_hsn: e.target.checked })}
            className="rounded border-border text-accent-primary focus:ring-accent-primary"
          />
          <label htmlFor="include_hsn" className="text-xs text-text-secondary">
            Include HSN-wise summary table (mandatory for turnovers above ₹5 Cr)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/reports/gst" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {submitting ? "Exporting..." : "Generate GST JSON"}
          </button>
        </div>
      </form>
    </div>
  );
}
