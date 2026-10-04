import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Save, Sparkles, Layers } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category_id: "",
    brand: "Axinix Tailors",
    selling_price: "",
    material: "",
    gender_label: "Unisex",
    age_group: "Adult",
    care_instructions: "",
    description: "",
    image_url: "",
    // Variant fields
    sku: "",
    size: "M",
    color: "Standard",
    barcode: "",
  });

  useEffect(() => {
    populateApi.read("category_master", { limit: 100, filter: { status: 1 } })
      .then((res) => {
        if (res?.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, category_id: String(res.data[0].id) }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleNameChange = (name) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData((prev) => ({
      ...prev,
      name,
      slug,
      sku: prev.sku || `${slug.slice(0, 8).toUpperCase()}-01`,
      barcode: prev.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.selling_price) {
      toast.error("Product name and selling price are required");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create ProductType
      const prodRes = await populateApi.create("product_type", {
        name: formData.name.trim(),
        slug: formData.slug.trim() || `prod-${Date.now()}`,
        category_id: parseInt(formData.category_id),
        brand: formData.brand.trim(),
        selling_price: parseFloat(formData.selling_price),
        material: formData.material.trim(),
        gender_label: formData.gender_label,
        age_group: formData.age_group,
        care_instructions: formData.care_instructions.trim(),
        description: formData.description.trim(),
        is_active: true,
        status: 1,
      });

      const productId = prodRes?.data?.id || prodRes?.id;

      // 2. Create ProductVariant
      if (productId) {
        await populateApi.create("product_variant", {
          product_id: productId,
          sku: formData.sku.trim() || `SKU-${Date.now()}`,
          size: formData.size.trim(),
          color: formData.color.trim(),
          barcode: formData.barcode.trim(),
          selling_price: parseFloat(formData.selling_price),
          is_active: true,
          status: 1,
        });

        // 3. Create ProductImage if provided
        if (formData.image_url.trim()) {
          await populateApi.create("product_image", {
            product_id: productId,
            image_url: formData.image_url.trim(),
            alt_text: formData.name.trim(),
            is_primary: true,
            status: 1,
          }).catch(() => {});
        }
      }

      toast.success("Product and initial variant catalogued successfully!");
      navigate("/shopping/products");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/shopping/products"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>Add New Product</span>
            </h1>
            <p className="text-xs text-gray-400">Catalogue a new product type and initial variant</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
            General Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Oxford Button-Down Shirt"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-gray-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Brand Name</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Retail Selling Price (M.R.P. ₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="2499.00"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Textile Material</label>
              <input
                type="text"
                placeholder="e.g. 100% Giza Cotton"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">Primary Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider pt-4 border-t border-white/[0.08]">
            Initial Variant & Statutory Barcode
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">SKU Code</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Size</label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/shopping/products"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Save Product"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
