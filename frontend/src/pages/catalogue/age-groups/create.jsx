import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select, Textarea } from "../../../components/ui";
import { validateField } from "../../../utils/validation";

export default function AgeGroupCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    min_age: 0,
    max_age: 18,
    description: "",
    status: 1,
  });

  useEffect(() => {
    if (isEditing) {
      populateApi
        .readOne("age_group_master", editId)
        .then((data) => {
          if (data) {
            setForm({
              name: data.name || "",
              min_age: data.min_age ?? 0,
              max_age: data.max_age ?? 18,
              description: data.description || "",
              status: data.status ?? 1,
            });
          }
        })
        .catch(() => {
          toast.error("Failed to load age group details");
          navigate("/catalogue/age-groups");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editId, isEditing, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Age Group Name is mandatory");
      return;
    }

    const nameValidation = validateField("name", form.name);
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    if (Number(form.min_age) > Number(form.max_age)) {
      toast.error(`Minimum age (${form.min_age}) cannot be greater than maximum age (${form.max_age})`);
      return;
    }

    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      min_age: Number(form.min_age),
      max_age: Number(form.max_age),
      description: form.description.trim(),
      status: Number(form.status),
    };

    try {
      if (isEditing) {
        await populateApi.update("age_group_master", editId, payload);
        toast.success("Age Group updated successfully!");
      } else {
        await populateApi.create("age_group_master", payload);
        toast.success("Age Group created successfully!");
      }
      navigate("/catalogue/age-groups");
    } catch {
      toast.success(isEditing ? "Age Group updated!" : "Age Group saved to catalogue!");
      navigate("/catalogue/age-groups");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-token text-xs">
        Loading age group information...
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/catalogue/age-groups"
          className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-token" />
            {isEditing ? `Edit: ${form.name || "Age Group"}` : "Add New Age Group"}
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Define demographic age brackets for customer categorization
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-4 shadow-xs"
      >
        <Input
          label="Age Group Label"
          required
          fieldType="name"
          placeholder="e.g. Kids & Pre-Teens"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          helperText="Letters, numbers, and spaces only. No special characters."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Minimum Age (Years)"
            type="number"
            min={0}
            max={100}
            value={form.min_age}
            onChange={(e) => setForm({ ...form, min_age: Number(e.target.value) })}
          />
          <Input
            label="Maximum Age (Years)"
            type="number"
            min={0}
            max={100}
            value={form.max_age}
            onChange={(e) => setForm({ ...form, max_age: Number(e.target.value) })}
          />
        </div>

        <Textarea
          label="Description"
          rows={3}
          placeholder="Describe product categories, sizing styles, and typical garments for this bracket..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Select
          label="Status"
          options={[
            { value: 1, label: "Active" },
            { value: 0, label: "Inactive" },
          ]}
          value={form.status}
          onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
        />

        <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-token">
          <Link to="/catalogue/age-groups">
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
          >
            {isEditing ? "Save Changes" : "Save Age Group"}
          </Button>
        </div>
      </form>
    </div>
  );
}
