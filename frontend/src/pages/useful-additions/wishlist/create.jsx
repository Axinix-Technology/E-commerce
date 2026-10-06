import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Textarea } from "../../../components/ui";

export default function AddToWishlistPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    brand: "Axinix Tailors",
    selling_price: "",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Item title is required");
      return;
    }

    toast.success(`"${formData.name}" added to your saved wishlist!`);
    navigate("/useful-additions/wishlist");
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/useful-additions/wishlist"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            Add Custom Item to Wishlist
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Save bespoke apparel requests or future purchase goals
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Item Title"
          required
          placeholder="e.g. Royal Oxford Button-Down (Sky Blue)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="SKU or Reference"
            placeholder="HL-OXF-BLU-L"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="font-mono text-xs"
          />

          <Input
            label="Target Price (₹)"
            type="number"
            placeholder="2499.00"
            value={formData.selling_price}
            onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
          />
        </div>

        <Textarea
          label="Personal Notes"
          rows={3}
          placeholder="e.g. Buy before Diwali wedding; check for discount vouchers..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/useful-additions/wishlist")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Heart}
          >
            Save to Wishlist
          </Button>
        </div>
      </form>
    </div>
  );
}
