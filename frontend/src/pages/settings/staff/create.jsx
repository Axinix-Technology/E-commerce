import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Users,
  ArrowLeft,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Select } from "../../../components/ui";

export default function StaffMemberCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role_id: "",
    city: "",
    status: 1,
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await populateApi.read("role", { limit: 50, sort: ["name"] });
        const list = Array.isArray(res) ? res : res?.data || [];
        setRoles(list);
      } catch (err) {
        console.error("Failed loading roles", err);
      }
    };

    loadRoles();

    if (editId) {
      populateApi
        .read("user", { filter: { id: editId } })
        .then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          if (list.length > 0) {
            const u = list[0];
            setFormData({
              username: u.username || "",
              password: "",
              first_name: u.first_name || "",
              last_name: u.last_name || "",
              email: u.email || "",
              phone: u.phone || "",
              role_id: u.role_id || "",
              city: u.city || "",
              status: u.status ?? 1,
            });
          }
        })
        .catch((err) => console.error("Failed loading user", err));
    }
  }, [editId]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.password && editId) {
        delete payload.password;
      }

      if (editId) {
        await populateApi.update("user", editId, payload);
        toast.success("Staff profile updated!");
      } else {
        await populateApi.create("user", payload);
        toast.success("Staff member created successfully!");
      }
      navigate("/settings/staff");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save staff profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/settings/staff"
          className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-token" />
            {editId ? `Edit Staff: @${formData.username}` : "Register New Staff Member"}
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Provision dashboard access, security roles, and counter permissions
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-4 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            required
            fieldType="name"
            placeholder="e.g. John"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />

          <Input
            label="Last Name"
            fieldType="name"
            placeholder="e.g. Doe"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Username"
            required
            fieldType="code"
            placeholder="e.g. jdoe"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
          />

          <Input
            label={editId ? "Change Password (leave blank to keep)" : "Password"}
            type="password"
            required={!editId}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            fieldType="email"
            placeholder="staff@axinix.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Mobile Phone"
            fieldType="phone"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Role & Access Group"
            value={formData.role_id}
            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
            placeholder="-- Assign Role --"
            options={roles.map((r) => ({
              value: r.id,
              label: `${r.name} ${r.is_superadmin ? "(Full Admin)" : ""}`,
            }))}
          />

          <Select
            label="Account Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
            options={[
              { label: "Active & Authorized", value: 1 },
              { label: "Suspended / Disabled", value: 0 },
            ]}
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-token">
          <Link to="/settings/staff">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
            onClick={handleSubmit}
          >
            {editId ? "Update Staff" : "Create Account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
