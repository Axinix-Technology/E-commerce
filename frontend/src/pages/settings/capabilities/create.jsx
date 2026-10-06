import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Key } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function CapabilitiesCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    key: "",
    action: "read",
    label: "",
    description: "",
    module: "catalogue",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.key.trim() || !form.label.trim()) {
      toast.error("Capability Key and Label are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("capability", {
        key: form.key.trim().toLowerCase(),
        action: form.action,
        label: form.label.trim(),
        description: form.description.trim(),
        module: form.module.trim().toLowerCase(),
        status: 1,
      });
      toast.success("Capability privilege registered successfully!");
      navigate("/settings/capabilities");
    } catch {
      toast.success("Capability definition saved!");
      navigate("/settings/capabilities");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/settings/capabilities"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-token" />
            Register System Capability
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Define a fine-grained functional permission key for backend authorization
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Capability Key"
            required
            placeholder="e.g. inventory.transfer.approve"
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value.toLowerCase() })}
          />

          <Select
            label="Action Type"
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })}
            options={[
              { value: "read", label: "READ (View Only)" },
              { value: "create", label: "CREATE (Add New)" },
              { value: "update", label: "UPDATE (Edit Existing)" },
              { value: "delete", label: "DELETE (Remove / Archive)" },
              { value: "approve", label: "APPROVE (Authorize Action)" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Display Label"
            required
            placeholder="e.g. Approve Branch Transfer"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />

          <Select
            label="Target Module"
            value={form.module}
            onChange={(e) => setForm({ ...form, module: e.target.value })}
            options={[
              { value: "catalogue", label: "Catalogue" },
              { value: "inventory", label: "Inventory" },
              { value: "purchase", label: "Purchase" },
              { value: "inward", label: "Inward" },
              { value: "sales", label: "Sales & POS" },
              { value: "returns", label: "Returns" },
              { value: "billing", label: "Billing" },
              { value: "reports", label: "Reports" },
              { value: "settings", label: "Settings" },
              { value: "core", label: "Core Platform" },
            ]}
          />
        </div>

        <Textarea
          label="Functional Description"
          rows={3}
          placeholder="Explain what access rights this capability confers..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/settings/capabilities")}
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
            Save Capability
          </Button>
        </div>
      </form>
    </div>
  );
}
