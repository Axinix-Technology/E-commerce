import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Truck, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function BranchTransferReportCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: `Branch-Transfer-Audit-${new Date().toISOString().slice(0, 10)}`,
    from_branch: "all",
    to_branch: "all",
    transit_status: "all",
    format: "excel",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Branch transfer report generated!");
      navigate("/reports/branch-transfer");
    }, 700);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/reports/branch-transfer" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-accent-primary" />
            Generate Branch Transfer Ledger Export
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Filter inter-branch movements and export consignment audit slips</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Audit Ledger Title</label>
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Source Origin Branch</label>
            <select
              value={form.from_branch}
              onChange={(e) => setForm({ ...form, from_branch: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Origin Locations</option>
              <option value="Central Warehouse">Central Warehouse</option>
              <option value="Chennai Flagship">Chennai Flagship</option>
              <option value="T. Nagar Showroom">T. Nagar Showroom</option>
              <option value="Coimbatore Branch">Coimbatore Branch</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Destination Target Branch</label>
            <select
              value={form.to_branch}
              onChange={(e) => setForm({ ...form, to_branch: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Destination Locations</option>
              <option value="Central Warehouse">Central Warehouse</option>
              <option value="Chennai Flagship">Chennai Flagship</option>
              <option value="T. Nagar Showroom">T. Nagar Showroom</option>
              <option value="Coimbatore Branch">Coimbatore Branch</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Transit Status</label>
            <select
              value={form.transit_status}
              onChange={(e) => setForm({ ...form, transit_status: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Statuses</option>
              <option value="In Transit">In Transit</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Received">Received & Reconciled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Export Format</label>
            <select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="excel">Excel Sheet (.xlsx)</option>
              <option value="csv">CSV File (.csv)</option>
              <option value="pdf">PDF Document</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/reports/branch-transfer" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {submitting ? "Exporting..." : "Export Transfer Ledger"}
          </button>
        </div>
      </form>
    </div>
  );
}
