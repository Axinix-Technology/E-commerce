import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightLeft, Download } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, Input, Select, Checkbox, Button } from "../../../components/ui";

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
      <PageHeader
        title="Compile Stock In / Out Periodic Ledger"
        subtitle="Calculate aggregate throughput, opening units, and period-end inventory balances"
        icon={ArrowRightLeft}
        backTo="/reports/stock-in-out"
      />

      <form
        onSubmit={handleSubmit}
        className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-4 shadow-xs"
      >
        <Input
          label="Reconciliation Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            label="Product Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              { value: "all", label: "All Product Categories" },
              { value: "sarees", label: "Sarees" },
              { value: "dupattas", label: "Dupattas" },
              { value: "kurtis", label: "Kurtis" },
              { value: "fabrics", label: "Fabrics & Materials" },
            ]}
          />

          <Select
            label="Export File Format"
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value })}
            options={[
              { value: "excel", label: "Excel (.xlsx)" },
              { value: "csv", label: "CSV (.csv)" },
              { value: "pdf", label: "PDF Report" },
            ]}
          />
        </div>

        <div className="p-3 rounded-xl bg-surface-elevated border border-token">
          <Checkbox
            label="Include items with zero movements during this period"
            description="Preserve zero-movement SKUs in period balance ledger"
            checked={form.include_zero_movement}
            onChange={(e) => setForm({ ...form, include_zero_movement: e.target.checked })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-token">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/reports/stock-in-out")}
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
            Export Movement Report
          </Button>
        </div>
      </form>
    </div>
  );
}
