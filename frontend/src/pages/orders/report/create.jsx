import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileBarChart, Download } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Select } from "../../../components/ui";

export default function OrdersReportCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    report_title: `Orders-Summary-${new Date().toISOString().slice(0, 10)}`,
    date_from: new Date().toISOString().slice(0, 10),
    date_to: new Date().toISOString().slice(0, 10),
    channel: "all",
    format: "excel",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Order report snapshot generated & ready for download!");
      navigate("/orders/report");
    }, 700);
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/orders/report"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-brand-token" />
            Generate Custom Orders Snapshot
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Filter, compile, and schedule export for sales orders analytics and audit
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Snapshot / Report Title"
          required
          value={form.report_title}
          onChange={(e) => setForm({ ...form, report_title: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date From"
            type="date"
            value={form.date_from}
            onChange={(e) => setForm({ ...form, date_from: e.target.value })}
          />

          <Input
            label="Date To"
            type="date"
            value={form.date_to}
            onChange={(e) => setForm({ ...form, date_to: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Channel Filter"
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
            options={[
              { value: "all", label: "All Channels" },
              { value: "pos", label: "Store POS" },
              { value: "web", label: "Web Storefront" },
              { value: "wholesale", label: "B2B Wholesale" },
            ]}
          />

          <Select
            label="Export Format"
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value })}
            options={[
              { value: "excel", label: "Excel (.xlsx)" },
              { value: "csv", label: "CSV (.csv)" },
              { value: "pdf", label: "PDF Document" },
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/orders/report")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Download}
            loading={submitting}
          >
            Generate & Export
          </Button>
        </div>
      </form>
    </div>
  );
}
