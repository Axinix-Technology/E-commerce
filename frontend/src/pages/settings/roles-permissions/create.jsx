import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  Save,
  Lock,
  Key,
  ShieldAlert
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea, Checkbox, Badge } from "../../../components/ui";

// Rule 1: Zero values rendered as em-dash
const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function RoleFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [capabilities, setCapabilities] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_superadmin: false,
    status: 1,
  });

  useEffect(() => {
    populateApi
      .read("capability", { limit: 100, sort: ["module", "key"] })
      .then((res) => {
        if (res?.data) setCapabilities(res.data);
      })
      .catch((err) => console.error("Failed loading capabilities", err));

    if (editId) {
      populateApi
        .read("role", { filter: { id: editId } })
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            const r = res.data[0];
            setFormData({
              name: r.name || "",
              description: r.description || "",
              is_superadmin: Boolean(r.is_superadmin),
              status: r.status ?? 1,
            });
          }
        })
        .catch((err) => console.error("Failed loading role", err));
    }
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await populateApi.update("role", editId, formData);
        toast.success("Role updated successfully");
      } else {
        await populateApi.create("role", formData);
        toast.success("New role created successfully");
      }
      navigate("/settings/roles-permissions");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save role");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/settings/roles-permissions"
            className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              {editId ? "Edit Role & Policies" : "Create Security Role"}
            </h1>
            <p className="text-xs text-muted-token">
              Define permission envelope, administrative bypass, and business capabilities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/settings/roles-permissions")}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
            onClick={handleSubmit}
          >
            {editId ? "Update Role" : "Save Role"}
          </Button>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Role Identifier: <strong className="text-primary-token font-medium">{formData.name || "—"}</strong></span>
        <span>•</span>
        <span>
          Privilege Mode:{" "}
          <strong className={formData.is_superadmin ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-emerald-600 dark:text-emerald-400 font-semibold"}>
            {formData.is_superadmin ? "Superadmin Bypass" : "Policy Gated"}
          </strong>
        </span>
        <span>•</span>
        <span>Capability Pool: <strong className="text-primary-token font-medium">{formatQty(capabilities.length)} Modules</strong></span>
        <span>•</span>
        <span>Status: <strong className="text-primary-token font-medium">{formData.status === 1 ? "Active" : "Inactive"}</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
          <Input
            label="Role Name"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Store Manager, Lead Cashier, Inventory Clerk"
          />

          <Textarea
            label="Description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Purpose and access boundary of this role..."
          />

          <div className="p-4 rounded-xl border border-token bg-surface-elevated/60">
            <Checkbox
              label="Super Administrator Bypass"
              checked={formData.is_superadmin}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_superadmin: e.target.checked }))}
            />
            <p className="text-[11px] text-muted-token mt-1 ml-6">
              Grants unrestricted root access across all catalogue, financial reports, settings, and database endpoints.
            </p>
          </div>

          <Select
            label="Role Status"
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: Number(e.target.value) }))}
            options={[
              { value: 1, label: "Active" },
              { value: 0, label: "Inactive / Deprecated" },
            ]}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={submitting}
              icon={Save}
            >
              {editId ? "Update Role" : "Create Security Role"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
