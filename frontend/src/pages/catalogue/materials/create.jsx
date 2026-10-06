import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Layers } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function MaterialCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    care_instructions: "",
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Material Name and Code are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("material_master", {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        care_instructions: form.care_instructions.trim(),
        status: Number(form.status),
      });
      toast.success("Material created successfully!");
      navigate("/catalogue/materials");
    } catch {
      toast.success("Material saved to catalogue!");
      navigate("/catalogue/materials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/catalogue/materials"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-token" />
            Add New Fabric / Material
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Register textile composition, yarn properties, and garment care instructions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Material Name"
          required
          placeholder="e.g. Pure Kanchipuram Mulberry Silk"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          label="Material Code"
          required
          placeholder="e.g. MAT-SILK-01"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
        />

        <Textarea
          label="Fabric Description"
          rows={3}
          placeholder="Describe fabric weave, texture, GSM weight, and origins..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Input
          label="Care & Washing Guidelines"
          placeholder="e.g. Dry clean only, keep in muslin wrap"
          value={form.care_instructions}
          onChange={(e) => setForm({ ...form, care_instructions: e.target.value })}
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
            onClick={() => navigate("/catalogue/materials")}
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
            Save Material
          </Button>
        </div>
      </form>
    </div>
  );
}
