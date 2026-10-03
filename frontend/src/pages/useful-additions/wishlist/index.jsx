import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight, Plus, Layers } from "lucide-react";
import toast from "react-hot-toast";

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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            <span>Saved Wishlist</span>
          </h1>
          <p className="text-xs text-gray-400">
            Keep track of your favorite apparel pieces and transfer directly to your cart
          </p>
        </div>

        <Link
          to="/useful-additions/wishlist/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Add Custom Item</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Saved Items: <strong className="text-white">{wishlist.length || "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Inventory Alert: <strong className="text-emerald-400">All Items In Stock</strong>
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-4">
          <Heart className="w-12 h-12 mx-auto text-gray-500" />
          <h3 className="text-sm font-bold text-white">Your wishlist is empty</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Browse our catalogue to save handcrafted linen shirts, pashmina stoles, and derby footwear.
          </p>
          <Link
            to="/shopping/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold shadow-md"
          >
            <span>Explore Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden flex flex-col justify-between group hover:border-[rgba(0,210,210,0.3)] transition-all"
            >
              <div className="relative h-44 bg-gray-900 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-black/60 hover:bg-red-500/80 text-white backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase">
                    {item.brand}
                  </span>
                  <h3 className="text-xs font-bold text-white truncate mt-0.5">{item.name}</h3>
                  <span className="text-[10px] font-mono text-gray-400">{item.sku}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-sm font-extrabold text-white">
                    ₹{item.selling_price.toLocaleString("en-IN")}
                  </span>

                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
