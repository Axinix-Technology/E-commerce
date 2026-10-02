import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Save,
  Tag,
  IndianRupee,
  ShieldCheck
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function ProductFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
    brand: "",
    selling_price: "",
    material: "",
    care_instructions: "",
    age_group: "",
    gender_label: "",
    description: "",
    status: 1,
  });

  useEffect(() => {
    // 1. Fetch categories for dropdown
    populateApi
      .read("category_master", { limit: 100, fields: ["id", "name"] })
      .then((res) => {
        if (res?.data) {
          setCategories(res.data);
          if (!isEditing && res.data.length > 0 && !formData.category_id) {
            setFormData((prev) => ({ ...prev, category_id: String(res.data[0].id) }));
          }
        }
      })
      .catch(() => {});

    // 2. If editing, load product details
    if (isEditing) {
      populateApi
        .readOne("product_type", editId, {
          populate: { category: ["id", "name"] },
        })
        .then((data) => {
          if (data) {
            setFormData({
              name: data.name || "",
              slug: data.slug || "",
              category_id: data.category?.id ? String(data.category.id) : (data.category_id ? String(data.category_id) : ""),
              brand: data.brand || "",
              selling_price: data.selling_price || "",
              material: data.material || "",
              care_instructions: data.care_instructions || "",
              age_group: data.age_group || "",
              gender_label: data.gender_label || "",
              description: data.description || "",
              status: data.status !== undefined ? data.status : 1,
            });
          }
        })
        .catch(() => {
          toast.error("Failed to load product details");
          navigate("/catalogue/products");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [editId, isEditing, navigate]);

  const handleNameChange = (nameVal) => {
    const slugVal = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: prev.slug === "" || !isEditing ? slugVal : prev.slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) {
      toast.error("Product name and category are required");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      category_id: parseInt(formData.category_id, 10),
      brand: formData.brand.trim(),
      selling_price: formData.selling_price ? parseFloat(formData.selling_price) : 0.0,
      material: formData.material.trim(),
      care_instructions: formData.care_instructions.trim(),
      age_group: formData.age_group.trim(),
      gender_label: formData.gender_label.trim(),
      description: formData.description.trim(),
      status: parseInt(formData.status, 10),
    };

    try {
      if (isEditing) {
        await populateApi.update("product_type", editId, payload);
        toast.success("Product updated successfully");
      } else {
        await populateApi.create("product_type", payload);
        toast.success("Product created successfully");
      }
      navigate("/catalogue/products");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-token text-xs">
        Loading product information...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar with Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-token">
        <div className="flex items-center gap-3">
          <Link
            to="/catalogue/products"
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface border border-token text-secondary-token hover:text-primary-token transition-colors"
            title="Back to Products"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-token mb-0.5">
              <span>Catalogue Master</span>
              <span>/</span>
              <Link to="/catalogue/products" className="hover:text-primary-token">
                Product
              </Link>
              <span>/</span>
              <span className="text-brand-token font-medium">
                {isEditing ? "Edit Product" : "New Product"}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              {isEditing ? `Edit: ${formData.name}` : "Create New Product"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/catalogue/products"
            className="px-4 py-2 rounded-xl border border-token hover:bg-surface-elevated text-secondary-token text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Product Information Card */}
        <div className="glass-panel p-6 rounded-2xl border border-token space-y-5 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-token" />
              General Information
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Define the core taxonomy, retail selling price (MRP), and merchandising identity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Classic Oxford Shoes, Organic Cotton T-Shirt"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                URL Slug / Key <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="classic-oxford-shoes"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              >
                <option value="">— Select Category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">Brand / Label</label>
              <input
                type="text"
                placeholder="e.g. Nike, Raymond, Loigmax"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Selling Price / M.R.P. (₹)
              </label>
              <div className="relative">
                <span className="text-xs font-mono text-muted-token absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-surface-elevated border border-token text-xs text-primary-token font-mono font-semibold focus:outline-none focus:border-[var(--brand-secondary)] transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-secondary-token mb-1.5">Description</label>
            <textarea
              rows="3"
              placeholder="Marketing highlights, product overview, and merchandising copy..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs resize-none"
            />
          </div>
        </div>

        {/* Specifications & Attributes Card */}
        <div className="glass-panel p-6 rounded-2xl border border-token space-y-5 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-token" />
              Specifications & Style Attributes
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Merchandise demographics, fabric composition, and care instructions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">Material Composition</label>
              <input
                type="text"
                placeholder="e.g. 100% Genuine Leather, Pure Cotton"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">Gender Label</label>
              <input
                type="text"
                placeholder="e.g. Men, Women, Unisex, Boys"
                value={formData.gender_label}
                onChange={(e) => setFormData({ ...formData, gender_label: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">Age Group</label>
              <input
                type="text"
                placeholder="e.g. Adult, Teens, Kids, Infant"
                value={formData.age_group}
                onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">Care Instructions</label>
              <input
                type="text"
                placeholder="e.g. Machine wash cold, dry clean only"
                value={formData.care_instructions}
                onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value, 10) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              >
                <option value={1}>Active (Available for Catalogue)</option>
                <option value={0}>Inactive (Archived)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/catalogue/products"
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
            <span>{submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
