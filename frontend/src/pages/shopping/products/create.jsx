import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Save } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Select } from "../../../components/ui";

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
    <div className="max-w-3xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/shopping/products"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-token" />
            Add New Product
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Catalogue a new product type and initial variant with barcode
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-6">
        <div>
          <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider mb-4">
            General Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product Title"
                required
                placeholder="e.g. Royal Oxford Button-Down Shirt"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <Select
              label="Category"
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            />

            <Input
              label="Brand Name"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />

            <Input
              label="Retail Selling Price (M.R.P. ₹)"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="2499.00"
              value={formData.selling_price}
              onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
            />

            <Input
              label="Textile Material"
              placeholder="e.g. 100% Giza Cotton"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            />

            <div className="sm:col-span-2">
              <Input
                label="Primary Image URL"
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-token">
          <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider mb-4">
            Initial Variant & Statutory Barcode
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="SKU Code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />

            <Input
              label="Size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            />

            <Input
              label="Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/shopping/products")}
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
            Save Product
          </Button>
        </div>
      </form>
    </div>
  );
}
