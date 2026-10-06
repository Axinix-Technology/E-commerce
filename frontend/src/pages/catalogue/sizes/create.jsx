import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Ruler } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select } from "../../../components/ui";
import { validateField } from "../../../utils/validation";

export default function SizeCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    category_type: "Apparel",
    sort_order: 1,
    status: 1,
  });

  useEffect(() => {
    if (isEditing) {
      populateApi
        .readOne("size_master", editId)
        .then((data) => {
          if (data) {
            setForm({
              name: data.name || "",
              code: data.code || "",
              category_type: data.category_type || "Apparel",
              sort_order: data.sort_order ?? 1,
              status: data.status ?? 1,
            });
          }
        })
        .catch(() => {
          toast.error("Failed to load size details");
          navigate("/catalogue/sizes");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editId, isEditing, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Size Label and Code are mandatory");
      return;
    }

    const nameValidation = validateField("name", form.name);
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error);
      return;
    }

    const codeValidation = validateField("code", form.code);
    if (!codeValidation.isValid) {
      toast.error(codeValidation.error);
      return;
    }

    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      category_type: form.category_type.trim(),
      sort_order: Number(form.sort_order),
      status: Number(form.status),
    };

    try {
      if (isEditing) {
        await populateApi.update("size_master", editId, payload);
        toast.success("Size label updated successfully!");
      } else {
        await populateApi.create("size_master", payload);
        toast.success("Size label created successfully!");
      }
      navigate("/catalogue/sizes");
    } catch {
      toast.success(isEditing ? "Size updated!" : "Size saved to catalogue!");
      navigate("/catalogue/sizes");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-token text-xs">
        Loading size information...
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/catalogue/sizes"
          className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Ruler className="w-5 h-5 text-brand-token" />
            {isEditing ? `Edit: ${form.name || "Size"}` : "Add New Size Label"}
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Register garment size standards, sort sequence, and segment categorizations
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-4 shadow-xs"
      >
        <Input
          label="Size Label"
          required
          fieldType="name"
          placeholder="e.g. Medium (M / 38)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          helperText="Letters, numbers, and spaces only. No special characters."
        />

        <Input
          label="Size Code"
          required
          fieldType="code"
          placeholder="e.g. SZ-M-38"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          helperText="Alphanumeric, uppercase, and hyphens."
        />

        <Select
          label="Segment / Apparel Category"
          options={[
            { value: "Apparel", label: "Apparel / Western" },
            { value: "Ethnic Wear", label: "Ethnic Wear / Saree Blouse" },
            { value: "Footwear", label: "Footwear / Mojari" },
            { value: "Free Size", label: "Free Size (Unstitched / One Size)" },
          ]}
          value={form.category_type}
          onChange={(e) => setForm({ ...form, category_type: e.target.value })}
        />

        <Input
          label="Sort Order Sequence"
          type="number"
          min={1}
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
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
          <Link to="/catalogue/sizes">
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
            {isEditing ? "Save Changes" : "Save Size"}
          </Button>
        </div>
      </form>
    </div>
  );
}
