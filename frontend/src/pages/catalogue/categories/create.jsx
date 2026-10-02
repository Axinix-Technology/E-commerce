import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  FolderTree,
  Save,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function CategoryFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [parentCategories, setParentCategories] = useState([]);
  const [gstSlabs, setGstSlabs] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    hsn_code: "",
    parent_id: "",
    tax_group_id: "",
  });

  useEffect(() => {
    // 1. Fetch dropdown options (parent categories & GST slabs)
    Promise.all([
      populateApi.read("category_master", { limit: 100, fields: ["id", "name"] }),
      populateApi.read("gst_master", { limit: 100, fields: ["id", "name", "rate"] }),
    ]).then(([catRes, gstRes]) => {
      if (catRes?.data) setParentCategories(catRes.data);
      if (gstRes?.data) setGstSlabs(gstRes.data);
    }).catch(() => {});

    // 2. If editing, hydrate data
    if (isEditing) {
      populateApi
        .readOne("category_master", editId, {
          populate: { parent: ["id", "name"], tax_group: ["id", "name"] },
        })
        .then((data) => {
          if (data) {
            setFormData({
              name: data.name || "",
              description: data.description || "",
              hsn_code: data.hsn_code || "",
              parent_id: data.parent?.id ? String(data.parent.id) : (data.parent_id ? String(data.parent_id) : ""),
              tax_group_id: data.tax_group?.id ? String(data.tax_group.id) : (data.tax_group_id ? String(data.tax_group_id) : ""),
            });
          }
        })
        .catch((err) => {
          toast.error("Failed to load category details");
          navigate("/catalogue/categories");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editId, isEditing, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      hsn_code: formData.hsn_code.trim(),
      parent_id: formData.parent_id ? parseInt(formData.parent_id, 10) : null,
      tax_group_id: formData.tax_group_id ? parseInt(formData.tax_group_id, 10) : null,
    };

    try {
      if (isEditing) {
        await populateApi.update("category_master", editId, payload);
        toast.success("Category updated successfully");
      } else {
        await populateApi.create("category_master", payload);
        toast.success("Category created successfully");
      }
      navigate("/catalogue/categories");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-token text-xs">
        Loading category information...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar with Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-token">
        <div className="flex items-center gap-3">
          <Link
            to="/catalogue/categories"
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface border border-token text-secondary-token hover:text-primary-token transition-colors"
            title="Back to Categories"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-token mb-0.5">
              <span>Catalogue Master</span>
              <span>/</span>
              <Link to="/catalogue/categories" className="hover:text-primary-token">
                Categories
              </Link>
              <span>/</span>
              <span className="text-brand-token font-medium">
                {isEditing ? "Edit Category" : "New Category"}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              {isEditing ? `Edit: ${formData.name || "Category"}` : "Create New Category"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/catalogue/categories"
            className="px-4 py-2 rounded-xl border border-token text-secondary-token hover:bg-surface-elevated text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}</span>
          </button>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Category Details Card */}
        <div className="glass-panel p-6 rounded-2xl border border-token space-y-5 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-brand-token" />
              General Information
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Primary identification and naming for the category node.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Category Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Footwear, Electronics, Men's Apparel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
              <p className="text-[11px] text-muted-token mt-1">Unique display name shown in menus and catalog trees.</p>
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Parent Category (Optional)
              </label>
              <select
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              >
                <option value="">— None (Top-Level Category) —</option>
                {parentCategories
                  .filter((p) => !isEditing || String(p.id) !== String(editId))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <p className="text-[11px] text-muted-token mt-1">Nest this category under an existing parent category.</p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-secondary-token mb-1.5">Description</label>
            <textarea
              rows="3"
              placeholder="Describe the type of products grouped under this category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs resize-none"
            />
          </div>
        </div>

        {/* Taxation and Classification Card */}
        <div className="glass-panel p-6 rounded-2xl border border-token space-y-5 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-primary-token">
              Taxation & Regulatory Codes
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Specify Harmonized System of Nomenclature (HSN) and assigned GST rate slab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                HSN Code
              </label>
              <input
                type="text"
                placeholder="e.g. 6403, 8517"
                value={formData.hsn_code}
                onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
              <p className="text-[11px] text-muted-token mt-1">4 to 8 digit Indian GST tariff classification code.</p>
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Assigned GST Slab
              </label>
              <select
                value={formData.tax_group_id}
                onChange={(e) => setFormData({ ...formData, tax_group_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              >
                <option value="">— Select Applicable GST Slab —</option>
                {gstSlabs.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.rate}%)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-token mt-1">Products inheriting this category will apply this tax rate.</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/catalogue/categories"
            className="px-5 py-2 rounded-xl border border-token text-secondary-token hover:bg-surface-elevated text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
