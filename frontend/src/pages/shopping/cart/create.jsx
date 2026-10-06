import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input } from "../../../components/ui";

export default function QuickAddToCartPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    brand: "Axinix Tailors",
    size: "Standard",
    color: "Standard",
    selling_price: "",
    quantity: 1,
    image_url: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.selling_price) {
      toast.error("Item name and price are required");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("customer_cart") || "[]");
    existing.push({
      id: Date.now(),
      product_id: null,
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      sku: formData.sku.trim() || `CUSTOM-${Date.now().toString().slice(-6)}`,
      size: formData.size.trim(),
      color: formData.color.trim(),
      selling_price: parseFloat(formData.selling_price),
      quantity: parseInt(formData.quantity) || 1,
      image_url:
        formData.image_url.trim() ||
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400",
    });

    localStorage.setItem("customer_cart", JSON.stringify(existing));
    toast.success(`Custom line "${formData.name}" added to cart!`);
    navigate("/shopping/cart");
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/shopping/cart"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-token" />
            Quick Add Custom Line to Cart
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Directly insert a custom tailored line item or wholesale sample into the active cart session
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Item Title"
          required
          placeholder="e.g. Custom Monogram Linen Tunic"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="SKU / Item Code"
            placeholder="CUST-001"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />

          <Input
            label="Price per unit (₹)"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="1999.00"
            value={formData.selling_price}
            onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
          />

          <Input
            label="Size Specification"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
          />

          <Input
            label="Initial Quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/shopping/cart")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={ShoppingBag}
          >
            Add to Cart
          </Button>
        </div>
      </form>
    </div>
  );
}
