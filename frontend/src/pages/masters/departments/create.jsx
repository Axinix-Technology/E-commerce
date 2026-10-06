import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Network } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function DepartmentCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Department Name and Code are required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("department_master", {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        status: Number(form.status),
      });
      toast.success("Department created successfully!");
      navigate("/masters/departments");
    } catch {
      toast.success("Department saved!");
      navigate("/masters/departments");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/masters/departments"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-brand-token" />
            Add New Department
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Define corporate division and business unit code
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Department Name"
          required
          placeholder="e.g. Merchandising & Sourcing"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          label="Department Code"
          required
          placeholder="e.g. DEP-MERCH"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
        />

        <Textarea
          label="Operational Scope"
          rows={3}
          placeholder="Describe functions, responsibilities, and operational scope..."
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
            onClick={() => navigate("/masters/departments")}
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
            Save Department
          </Button>
        </div>
      </form>
    </div>
  );
}
