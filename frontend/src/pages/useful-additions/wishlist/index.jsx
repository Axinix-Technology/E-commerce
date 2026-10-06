import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Badge } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([
    {
      id: 1,
      name: "Chronograph Stainless Chronometer 42mm",
      brand: "Axinix Horology",
      sku: "CHRN-42-SLV-OS",
      selling_price: 12499,
      image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      in_stock: true,
    },
    {
      id: 2,
      name: "Artisan Full-Grain Goodyear Derby",
      brand: "Axinix Cordwainers",
      sku: "GY-DRB-BRN-42",
      selling_price: 6999,
      image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800",
      in_stock: true,
    },
  ]);

  const handleRemove = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from wishlist");
  };

  const handleMoveToCart = (item) => {
    const existing = JSON.parse(localStorage.getItem("customer_cart") || "[]");
    existing.push({
      id: Date.now(),
      product_id: item.id,
      name: item.name,
      brand: item.brand,
      sku: item.sku,
      selling_price: item.selling_price,
      quantity: 1,
      image_url: item.image_url,
    });
    localStorage.setItem("customer_cart", JSON.stringify(existing));
    handleRemove(item.id);
    toast.success(`Moved "${item.name}" to shopping cart!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-rose-500">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              Saved Wishlist
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Keep track of your favorite apparel pieces and transfer directly to your cart
            </p>
          </div>
        </div>

        <Link to="/useful-additions/wishlist/create">
          <Button variant="secondary" size="sm" icon={Plus}>
            Add Custom Item
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Saved Items: <strong className="text-primary-token font-medium">{formatQty(wishlist.length)}</strong></span>
        <span>•</span>
        <span>Inventory Alert: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">All Items In Stock</strong></span>
        <span>•</span>
        <span>Sync Status: <strong className="text-brand-token font-medium">Synced Across Devices</strong></span>
      </div>

      {wishlist.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-surface-elevated/40 border border-token space-y-4">
          <Heart className="w-12 h-12 mx-auto text-muted-token" />
          <h3 className="text-sm font-bold text-primary-token">Your wishlist is empty</h3>
          <p className="text-xs text-muted-token max-w-sm mx-auto">
            Browse our catalogue to save handcrafted linen shirts, pashmina stoles, and derby footwear.
          </p>
          <Link to="/shopping/products">
            <Button variant="primary" size="sm" icon={ArrowRight}>
              Explore Catalogue
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-surface-elevated/40 border border-token overflow-hidden flex flex-col justify-between group hover:border-brand-token/40 transition-all shadow-xs"
            >
              <div className="relative h-44 bg-surface-elevated/80 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-surface/80 hover:bg-rose-500 text-primary-token hover:text-white backdrop-blur-md border border-token transition-colors cursor-pointer shadow-xs"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-brand-token uppercase">
                    {item.brand}
                  </span>
                  <h3 className="text-xs font-bold text-primary-token truncate mt-0.5">{item.name}</h3>
                  <span className="text-[10px] font-mono text-muted-token">{item.sku}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-token">
                  <span className="text-sm font-extrabold text-brand-token">
                    {item.selling_price && Number(item.selling_price) > 0
                      ? `₹${Number(item.selling_price).toLocaleString("en-IN")}`
                      : "—"}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={ShoppingBag}
                    onClick={() => handleMoveToCart(item)}
                  >
                    Move to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
