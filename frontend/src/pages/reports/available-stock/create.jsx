import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageCheck, Download } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader, Input, Select, Button } from "../../../components/ui";

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
      <PageHeader
        title="Capture Available Stock Audit Snapshot"
        subtitle="Export physical sellable inventory counts with barcode serial breakdowns"
        icon={PackageCheck}
        backTo="/reports/available-stock"
      />

      <form
        onSubmit={handleSubmit}
        className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-4 shadow-xs"
      >
        <Input
          label="Audit Snapshot Title"
          required
          value={form.audit_title}
          onChange={(e) => setForm({ ...form, audit_title: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Branch / Location"
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            options={[
              { value: "all", label: "All Branches & Central Warehouse" },
              { value: "chennai", label: "Chennai Flagship" },
              { value: "tnagar", label: "T. Nagar Showroom" },
              { value: "central", label: "Central Warehouse" },
              { value: "coimbatore", label: "Coimbatore Branch" },
            ]}
          />

          <Select
            label="Category Filter"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              { value: "all", label: "All Categories" },
              { value: "sarees", label: "Sarees" },
              { value: "dupattas", label: "Dupattas" },
              { value: "kurtis", label: "Kurtis" },
              { value: "accessories", label: "Accessories" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Zero Stock Items"
            value={form.zero_stock_filter}
            onChange={(e) => setForm({ ...form, zero_stock_filter: e.target.value })}
            options={[
              { value: "exclude", label: "Exclude Zero Stock Items" },
              { value: "include", label: "Include Out-of-Stock Items" },
            ]}
          />

          <Select
            label="Export File Type"
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value })}
            options={[
              { value: "excel", label: "Excel Sheet (.xlsx)" },
              { value: "csv", label: "CSV Flat File (.csv)" },
              { value: "pdf", label: "Formatted PDF Document" },
            ]}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-token">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/reports/available-stock")}
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
            Export Snapshot
          </Button>
        </div>
      </form>
    </div>
  );
}
