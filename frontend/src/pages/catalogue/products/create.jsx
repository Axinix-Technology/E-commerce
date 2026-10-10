import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Save,
  Tag,
  Image as ImageIcon,
  Sparkles,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileImage
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
  const [imgLoadError, setImgLoadError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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
    image_url: "",
    image_id: null,
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

    // 2. If editing, load product details and linked image
    if (isEditing) {
      Promise.all([
        populateApi.readOne("product_type", editId, {
          populate: { category: ["id", "name"] },
        }),
        populateApi.read("product_image", {
          filter: { product_id: editId },
          limit: 1,
        }).catch(() => null),
      ])
        .then(([data, imgRes]) => {
          if (data) {
            const existingImg = imgRes?.data?.[0];
            setFormData({
              name: data.name || "",
              slug: data.slug || "",
              category_id: data.category?.id
                ? String(data.category.id)
                : data.category_id
                ? String(data.category_id)
                : "",
              brand: data.brand || "",
              selling_price:
                data.selling_price && Number(data.selling_price) !== 0
                  ? String(data.selling_price)
                  : "",
              material: data.material || "",
              care_instructions: data.care_instructions || "",
              age_group: data.age_group || "",
              gender_label: data.gender_label || "",
              description: data.description || "",
              status: data.status !== undefined ? data.status : 1,
              image_url: existingImg?.image_url || "",
              image_id: existingImg?.id || null,
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

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, image_url: event.target?.result || "" }));
      setImgLoadError(false);
      toast.success("Image attached successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
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
      let productId = editId;
      if (isEditing) {
        await populateApi.update("product_type", editId, payload);
        toast.success("Product updated successfully");
      } else {
        const createRes = await populateApi.create("product_type", payload);
        productId = createRes?.data?.id || createRes?.id;
        toast.success("Product created successfully");
      }

      // Sync attached product image
      if (productId) {
        const trimmedImgUrl = formData.image_url?.trim();
        if (formData.image_id) {
          if (trimmedImgUrl) {
            await populateApi.update("product_image", formData.image_id, {
              image_url: trimmedImgUrl,
              alt_text: formData.name.trim(),
            }).catch(() => {});
          } else {
            await populateApi.delete("product_image", formData.image_id).catch(() => {});
          }
        } else if (trimmedImgUrl) {
          await populateApi.create("product_image", {
            product_id: productId,
            image_url: trimmedImgUrl,
            alt_text: formData.name.trim(),
            is_primary: true,
            status: 1,
          }).catch(() => {});
        }
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
      <div className="py-20 text-center text-muted-token text-xs flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 border-2 border-brand-token border-t-transparent rounded-full animate-spin" />
        <span>Loading product details...</span>
      </div>
    );
  }

  const hasImage = Boolean(formData.image_url?.trim());

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-token">
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
              {isEditing ? `Edit: ${formData.name || "Untitled Product"}` : "Create New Product"}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Form Body in 2-Column Responsive Grid */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width): General Info & Specifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: General Information */}
            <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-5 shadow-xs">
              <div className="border-b border-token pb-3">
                <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-token" />
                  General Information
                </h2>
                <p className="text-xs text-muted-token mt-0.5">
                  Define the core taxonomy, retail selling price (MRP), and merchandising identity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Product Name"
                    required
                    placeholder="e.g. Classic Oxford Shoes, Organic Cotton T-Shirt"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    helperText="Primary article display name for catalogue & POS"
                  />
                </div>

                <Input
                  label="URL Slug / Key"
                  required
                  placeholder="classic-oxford-shoes"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  helperText="Auto-generated clean URL identifier"
                />

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
                  helperText="Merchandise hierarchy classification"
                />

                <Input
                  label="Brand / Label"
                  placeholder="e.g. Nike, Raymond, Loigmax"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  helperText="Brand or manufacturing label"
                />

                <Input
                  label="Selling Price / M.R.P. (₹)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="—"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                  helperText="Benchmark retail selling price"
                />

                <div className="sm:col-span-2">
                  <Textarea
                    label="Description"
                    rows={3}
                    placeholder="Marketing highlights, product overview, and merchandising copy..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    helperText="Optional merchandise description & selling points"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Specifications & Style Attributes */}
            <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-5 shadow-xs">
              <div className="border-b border-token pb-3">
                <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-token" />
                  Specifications & Style Attributes
                </h2>
                <p className="text-xs text-muted-token mt-0.5">
                  Fabric composition, demographic classification, and handling instructions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Material Composition"
                  placeholder="e.g. 100% Genuine Leather, Pure Cotton"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  helperText="Fabric or base raw materials"
                />

                <Input
                  label="Care Instructions"
                  placeholder="e.g. Machine wash cold, dry clean only"
                  value={formData.care_instructions}
                  onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                  helperText="Washing & maintenance directions"
                />

                <Input
                  label="Gender Label"
                  placeholder="e.g. Men, Women, Unisex, Boys, Girls"
                  value={formData.gender_label}
                  onChange={(e) => setFormData({ ...formData, gender_label: e.target.value })}
                  helperText="Target gender demographic"
                />

                <Input
                  label="Age Group"
                  placeholder="e.g. Adult, Teens, Kids, Infant"
                  value={formData.age_group}
                  onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                  helperText="Target demographic age cohort"
                />
              </div>
            </div>
          </div>

          {/* Right Column (1/3 width): Media & Status/Actions */}
          <div className="space-y-6">
            {/* Card 3: Attach Product Image / Visual Media */}
            <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-token pb-3">
                <div>
                  <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-token" />
                    Product Image
                  </h2>
                  <p className="text-xs text-muted-token mt-0.5">
                    Showcase photo (Optional)
                  </p>
                </div>
                {hasImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image_url: "" }));
                      setImgLoadError(false);
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                    title="Remove attached image"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
              />

              {/* Interactive Image Preview / Drop Zone Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`w-full h-52 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden relative ${
                  isDragging
                    ? "border-brand-token bg-brand-token/10 scale-[1.01]"
                    : "border-token bg-surface-elevated/20"
                }`}
              >
                {hasImage && !imgLoadError ? (
                  <>
                    <img
                      src={formData.image_url}
                      alt={formData.name || "Attached preview"}
                      className="w-full h-full object-cover"
                      onError={() => setImgLoadError(true)}
                      onLoad={() => setImgLoadError(false)}
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-medium text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Cover Image
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black/90 text-white text-[11px] font-medium flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        Change
                      </button>
                    </div>
                  </>
                ) : hasImage && imgLoadError ? (
                  <div className="p-4 text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                    <p className="text-xs font-semibold text-primary-token">Unable to load image</p>
                    <p className="text-[11px] text-muted-token">Check if the URL or file format is valid.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      icon={Upload}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Try Another File
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 text-center space-y-2.5">
                    <div className="w-10 h-10 rounded-full bg-surface-elevated/80 border border-token flex items-center justify-center mx-auto text-muted-token">
                      <FileImage className="w-5 h-5 text-brand-token" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary-token">No Image Attached</p>
                      <p className="text-[11px] text-muted-token mt-0.5">
                        Drag & drop here or browse files
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      icon={Upload}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Attach Image File
                    </Button>
                  </div>
                )}
              </div>

              {/* Direct URL Input Option */}
              <div className="space-y-1.5 pt-1">
                <Input
                  label="Or Image Web URL"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value });
                    setImgLoadError(false);
                  }}
                  helperText="Paste hosted CDN or direct web image URL"
                />
              </div>
            </div>

            {/* Card 4: Status & Form Submission */}
            <div className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 space-y-4 shadow-xs">
              <div className="border-b border-token pb-3">
                <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-token" />
                  Status & Publishing
                </h2>
                <p className="text-xs text-muted-token mt-0.5">
                  Catalogue availability & save actions
                </p>
              </div>

              <Select
                label="Catalog Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value, 10) })}
                options={[
                  { value: 1, label: "Active (Available for Catalogue)" },
                  { value: 0, label: "Inactive (Archived)" },
                ]}
                helperText="Active products appear in POS & Storefront"
              />

              <div className="space-y-2.5 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Save}
                  loading={submitting}
                  className="w-full justify-center text-xs font-semibold"
                >
                  {isEditing ? "Save Changes" : "Create Product"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/catalogue/products")}
                  className="w-full justify-center text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
