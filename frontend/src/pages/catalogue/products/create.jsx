import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Save,
  Tag
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea } from "../../../components/ui";

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
            className="p-2 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated/80 border border-token text-muted-token hover:text-primary-token transition-colors"
            title="Back to Products"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-token mb-0.5">
              <span>Catalogue Master</span>
              <span>/</span>
              <Link to="/catalogue/products" className="hover:text-primary-token">
                Products
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
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/catalogue/products")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
            onClick={handleSubmit}
          >
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Product Information */}
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-token" />
              General Information
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Define the core taxonomy, retail selling price (MRP), and merchandising identity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              required
              placeholder="e.g. Classic Oxford Shoes, Organic Cotton T-Shirt"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />

            <Input
              label="URL Slug / Key"
              required
              placeholder="classic-oxford-shoes"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Category"
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              options={[
                { value: "", label: "— Select Category —" },
                ...categories.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                })),
              ]}
            />

            <Input
              label="Brand / Label"
              placeholder="e.g. Nike, Raymond, Loigmax"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />

            <Input
              label="Selling Price / M.R.P. (₹)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.selling_price}
              onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
            />
          </div>

          <Textarea
            label="Description"
            rows={3}
            placeholder="Marketing highlights, product overview, and merchandising copy..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Specifications & Attributes */}
        <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-token" />
              Specifications & Style Attributes
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Merchandise demographics, fabric composition, and care instructions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Material Composition"
              placeholder="e.g. 100% Genuine Leather, Pure Cotton"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            />

            <Input
              label="Gender Label"
              placeholder="e.g. Men, Women, Unisex, Boys"
              value={formData.gender_label}
              onChange={(e) => setFormData({ ...formData, gender_label: e.target.value })}
            />

            <Input
              label="Age Group"
              placeholder="e.g. Adult, Teens, Kids, Infant"
              value={formData.age_group}
              onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Care Instructions"
              placeholder="e.g. Machine wash cold, dry clean only"
              value={formData.care_instructions}
              onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value, 10) })}
              options={[
                { value: 1, label: "Active (Available for Catalogue)" },
                { value: 0, label: "Inactive (Archived)" },
              ]}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/catalogue/products")}
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
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
