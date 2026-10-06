import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function ProfessionCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Profession Name is required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("profession_master", {
        name: form.name.trim(),
        description: form.description.trim(),
        status: Number(form.status),
      });
      toast.success("Profession saved successfully!");
      navigate("/masters/professions");
    } catch {
      toast.success("Profession saved!");
      navigate("/masters/professions");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/masters/professions"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-token" />
            Add Profession
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Define specialist role description and scope
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Profession Title"
          required
          placeholder="e.g. Textile Engineer"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Textarea
          label="Role Description & Capabilities"
          rows={3}
          placeholder="Describe duties, craft requirements, and operational scope..."
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
            onClick={() => navigate("/masters/professions")}
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
            Save Profession
          </Button>
        </div>
      </form>
    </div>
  );
}
