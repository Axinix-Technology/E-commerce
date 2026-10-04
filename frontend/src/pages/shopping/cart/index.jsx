import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Plus,
  RefreshCw,
  Minus
} from "lucide-react";
import toast from "react-hot-toast";

export default function ShoppingCartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("customer_cart") || "[]");
    setCartItems(stored);
  }, []);

  const updateCart = (newItems) => {
    setCartItems(newItems);
    localStorage.setItem("customer_cart", JSON.stringify(newItems));
  };

  const handleQtyChange = (id, delta) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);
    updateCart(updated);
  };

  const handleRemove = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    updateCart(updated);
    toast.success("Item removed from cart");
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "AXINIX10") {
      setAppliedCoupon({ code, discountPercent: 10, maxDiscount: 500 });
      toast.success("Coupon 'AXINIX10' applied! 10% discount added.");
    } else if (code === "WELCOME15") {
      setAppliedCoupon({ code, discountPercent: 15, maxDiscount: 750 });
      toast.success("Coupon 'WELCOME15' applied! 15% discount added.");
    } else {
      toast.error("Invalid coupon code. Try AXINIX10 or WELCOME15");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.selling_price) || 0) * item.quantity,
    0
  );

  let discount = 0;
  if (appliedCoupon) {
    discount = Math.min(
      (subtotal * appliedCoupon.discountPercent) / 100,
      appliedCoupon.maxDiscount
    );
  }

  // Inclusive GST calculation (approx 18%)
  const taxableValue = subtotal > 0 ? (subtotal - discount) / 1.18 : 0;
  const estimatedTax = subtotal > 0 ? (subtotal - discount) - taxableValue : 0;
  const totalAmount = Math.max(0, subtotal - discount);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Shopping Cart</span>
          </h1>
          <p className="text-xs text-gray-400">
            Review your selected apparel lines, apply promotional coupons, and proceed to checkout
          </p>
        </div>

        <Link
          to="/shopping/cart/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Quick Add SKU</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar (Rule 2) */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Cart Items: <strong className="text-white">{cartItems.length || "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Subtotal: <strong className="text-[var(--brand-primary)]">{subtotal > 0 ? `₹${subtotal.toLocaleString("en-IN")}` : "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Standard Shipping: <strong className="text-emerald-400">Free PAN-India</strong>
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-4">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-500" />
          <h3 className="text-sm font-bold text-white">Your cart is currently empty</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Discover handcrafted garments, barcoded precision accessories, and artisan derby shoes in our catalogue.
          </p>
          <Link
            to="/shopping/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold shadow-md"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items Table */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-4 group"
              >
                <img
                  src={
                    item.image_url ||
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400"
                  }
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-gray-900 border border-white/10 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase">
                      {item.brand || "Axinix"}
                    </span>
                    <span className="text-gray-500 text-[10px]">•</span>
                    <span className="text-[10px] font-mono text-gray-400">{item.sku}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5">{item.name}</h4>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Size: <span className="text-gray-200">{item.size || "Standard"}</span>
                    {item.color && (
                      <span className="ml-2">Color: <span className="text-gray-200">{item.color}</span></span>
                    )}
                  </div>
                </div>

                <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-0.5">
                  <button
                    onClick={() => handleQtyChange(item.id, -1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-bold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(item.id, 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 text-xs font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-right shrink-0 min-w-20">
                  <div className="text-sm font-extrabold text-white">
                    ₹{((Number(item.selling_price) || 0) * item.quantity).toLocaleString("en-IN")}
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-[11px] text-red-400 hover:underline flex items-center gap-1 mt-1 ml-auto cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Coupon Card */}
          <div className="space-y-4">
            {/* Coupon Code Engine */}
            <form onSubmit={handleApplyCoupon} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
              <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>Promotional Voucher</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. AXINIX10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white uppercase placeholder-gray-500 focus:outline-none focus:border-[var(--brand-primary)] font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>

            {/* Bill Summary */}
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
              <h3 className="text-sm font-bold text-white">Order Summary</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Cart Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-400">
                  <span>Statutory GST (18% Incl.)</span>
                  <span>₹{estimatedTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Pan-India Logistics</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Final Total</span>
                  <span className="text-xl font-extrabold text-[var(--brand-primary)]">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <Link
                to="/shopping/checkout"
                className="w-full py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
