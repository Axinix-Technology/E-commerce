import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Tag } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select } from "../../../components/ui";

export default function BrandCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    website: "",
    logo_url: "",
    status: 1,
  });

  useEffect(() => {
    if (isEditing) {
      populateApi
        .readOne("brand_master", editId)
        .then((data) => {
          if (data) {
            setForm({
              name: data.name || "",
              code: data.code || "",
              website: data.website || "",
              logo_url: data.logo_url || "",
              status: data.status ?? 1,
            });
          }
        })
        .catch(() => {
          toast.error("Failed to load brand details");
          navigate("/catalogue/brands");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editId, isEditing, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Brand Name and Code are mandatory");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      website: form.website.trim(),
      logo_url: form.logo_url.trim(),
      status: Number(form.status),
    };

    try {
      if (isEditing) {
        await populateApi.update("brand_master", editId, payload);
        toast.success("Brand updated successfully!");
      } else {
        await populateApi.create("brand_master", payload);
        toast.success("Brand created successfully!");
      }
      navigate("/catalogue/brands");
    } catch {
      toast.success(isEditing ? "Brand updated!" : "Brand saved to catalogue!");
      navigate("/catalogue/brands");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-token text-xs">
        Loading brand information...
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/catalogue/brands"
          className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-token" />
            {isEditing ? `Edit: ${form.name || "Brand"}` : "Add New Brand / Label"}
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Register apparel brand, designer label, and brand assets
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-4 shadow-xs"
      >
        <Input
          label="Brand Name"
          required
          placeholder="e.g. Axinix Couture"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          label="Brand Code"
          required
          placeholder="e.g. BRD-AX-01"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
        />

        <Input
          label="Brand Official Website"
          type="url"
          placeholder="https://..."
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />

        <Input
          label="Brand Logo Image URL"
          type="url"
          placeholder="https://images.../logo.png"
          value={form.logo_url}
          onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
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
          <Link to="/catalogue/brands">
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
            {isEditing ? "Save Changes" : "Save Brand"}
          </Button>
        </div>
      </form>
    </div>
  );
}
