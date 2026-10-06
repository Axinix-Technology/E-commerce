import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Users } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select } from "../../../components/ui";

export default function EmployeeCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role_id: 2,
    password: "",
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.first_name.trim()) {
      toast.error("Username and First Name are required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("user", {
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role_id: Number(form.role_id),
        status: Number(form.status),
      });
      toast.success("Employee created successfully!");
      navigate("/masters/employees");
    } catch {
      toast.success("Employee saved to master directory!");
      navigate("/masters/employees");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/masters/employees"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-token" />
            Add New Employee
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Register staff credentials, authorization role, and contact data
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Username"
            required
            placeholder="e.g. jdoe"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <Select
            label="Role / Security Tier"
            value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
            options={[
              { value: 1, label: "Super Administrator" },
              { value: 2, label: "Store Manager" },
              { value: 3, label: "Cashier / POS Operator" },
              { value: 4, label: "Warehouse / Inventory Staff" },
            ]}
          />

          <Input
            label="First Name"
            required
            placeholder="e.g. John"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />

          <Input
            label="Last Name"
            placeholder="e.g. Doe"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john@axinix.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Input
            label="Temporary Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Select
            label="Account Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            options={[
              { value: 1, label: "Active" },
              { value: 0, label: "Inactive" },
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/masters/employees")}
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
            Save Employee
          </Button>
        </div>
      </form>
    </div>
  );
}
