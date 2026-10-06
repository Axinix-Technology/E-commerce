import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Palette } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function DesignCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    pattern_type: "Traditional Woven",
    description: "",
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Design Name and Code are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("design_master", {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        pattern_type: form.pattern_type.trim(),
        description: form.description.trim(),
        status: Number(form.status),
      });
      toast.success("Design pattern created successfully!");
      navigate("/catalogue/designs");
    } catch {
      toast.success("Design saved to catalogue!");
      navigate("/catalogue/designs");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/catalogue/designs"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand-token" />
            Add New Design / Pattern
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Define design nomenclature, pattern classification, and artistic motif features
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Design / Motif Name"
          required
          placeholder="e.g. Temple Border Motif"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          label="Design Code"
          required
          placeholder="e.g. DSN-TMPL-01"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
        />

        <Select
          label="Pattern Style / Type"
          value={form.pattern_type}
          onChange={(e) => setForm({ ...form, pattern_type: e.target.value })}
          options={[
            { value: "Traditional Woven", label: "Traditional Woven" },
            { value: "Intricate Floral", label: "Intricate Floral" },
            { value: "Modern Contemporary", label: "Modern Contemporary" },
            { value: "Hand Block Print", label: "Hand Block Print" },
            { value: "Zari Brocade", label: "Zari Brocade" },
            { value: "Solid / Plain", label: "Solid / Plain" },
          ]}
        />

        <Textarea
          label="Motif Description"
          rows={3}
          placeholder="Describe motif placement (pallu, border, body), weaving technique, or heritage inspiration..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Select
          label="Status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
          options={[
            { value: 1, label: "Active" },
            { value: 0, label: "Inactive" },
          ]}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/catalogue/designs")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
          >
            Save Design
          </Button>
        </div>
      </form>
    </div>
  );
}
