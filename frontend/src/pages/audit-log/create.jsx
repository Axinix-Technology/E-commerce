import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../api/populate.api";
import { Button, Input, Select, Textarea } from "../../components/ui";

export default function AuditLogCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    user: "admin",
    action: "UPDATE",
    module: "inventory",
    description: "",
    ip_address: "127.0.0.1",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user.trim() || !form.description.trim()) {
      toast.error("User and Description are required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("audit_log", {
        user: form.user.trim(),
        user_name: form.user.trim(),
        action: form.action,
        module: form.module,
        entity: form.module,
        description: form.description.trim(),
        details: form.description.trim(),
        ip_address: form.ip_address.trim(),
      });
      toast.success("Audit trail event manually logged!");
      navigate("/audit-log");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to record audit event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/audit-log"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-token" />
            Append Manual Audit Log Event
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Register a manual administrative compliance note or security event
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Actor / Username"
            required
            value={form.user}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
          />

          <Select
            label="Action Type"
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })}
            options={[
              { value: "CREATE", label: "CREATE" },
              { value: "UPDATE", label: "UPDATE" },
              { value: "DELETE", label: "DELETE" },
              { value: "APPROVE", label: "APPROVE" },
              { value: "TRANSFER", label: "TRANSFER" },
              { value: "SECURITY", label: "SECURITY" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Module"
            value={form.module}
            onChange={(e) => setForm({ ...form, module: e.target.value })}
            options={[
              { value: "inventory", label: "Inventory" },
              { value: "catalogue", label: "Catalogue" },
              { value: "sales", label: "Sales & POS" },
              { value: "billing", label: "Billing" },
              { value: "purchase", label: "Purchase" },
              { value: "reports", label: "Reports" },
              { value: "settings", label: "Settings" },
              { value: "core", label: "Core System" },
            ]}
          />

          <Input
            label="IP Address"
            value={form.ip_address}
            onChange={(e) => setForm({ ...form, ip_address: e.target.value })}
          />
        </div>

        <Textarea
          label="Activity Description"
          required
          rows={3}
          placeholder="Detailed description of the administrative mutation or audit event..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/audit-log")}
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
            Log Event
          </Button>
        </div>
      </form>
    </div>
  );
}
