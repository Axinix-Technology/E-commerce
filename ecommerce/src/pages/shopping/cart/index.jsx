import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Plus,
  Minus,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Badge } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

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
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              Shopping Cart
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Review your selected apparel lines, apply promotional coupons, and proceed to checkout
            </p>
          </div>
        </div>

        <Link to="/shopping/cart/create">
          <Button variant="secondary" size="sm" icon={Plus}>
            Quick Add SKU
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Cart Items: <strong className="text-primary-token font-medium">{formatQty(cartItems.length)}</strong></span>
        <span>•</span>
        <span>Subtotal: <strong className="text-brand-token font-medium">{subtotal > 0 ? `₹${subtotal.toLocaleString("en-IN")}` : "—"}</strong></span>
        <span>•</span>
        <span>Standard Shipping: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Free PAN-India</strong></span>
      </div>

      {cartItems.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-surface-elevated/40 border border-token space-y-4">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-token" />
          <h3 className="text-sm font-bold text-primary-token">Your cart is currently empty</h3>
          <p className="text-xs text-muted-token max-w-sm mx-auto">
            Discover handcrafted garments, barcoded precision accessories, and artisan derby shoes in our catalogue.
          </p>
          <Link to="/shopping/products">
            <Button variant="primary" size="sm" icon={ArrowRight}>
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surface-elevated/40 border border-token flex items-center gap-4 group shadow-xs"
              >
                <img
                  src={
                    item.image_url ||
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400"
                  }
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover bg-surface border border-token shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-token uppercase">
                      {item.brand || "Axinix"}
                    </span>
                    <span className="text-muted-token text-[10px]">•</span>
                    <span className="text-[10px] font-mono text-muted-token">{item.sku}</span>
                  </div>
                  <h4 className="text-xs font-bold text-primary-token truncate mt-0.5">{item.name}</h4>
                  <div className="text-[11px] text-muted-token mt-0.5">
                    Size: <span className="text-secondary-token">{item.size || "Standard"}</span>
                    {item.color && (
                      <span className="ml-2">Color: <span className="text-secondary-token">{item.color}</span></span>
                    )}
                  </div>
                </div>

                <div className="flex items-center rounded-xl bg-surface border border-token p-0.5 shadow-xs">
                  <button
                    onClick={() => handleQtyChange(item.id, -1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-token hover:text-primary-token hover:bg-surface-elevated text-xs font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-bold text-primary-token">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(item.id, 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-token hover:text-primary-token hover:bg-surface-elevated text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="text-right shrink-0 min-w-20">
                  <div className="text-sm font-extrabold text-brand-token">
                    ₹{((Number(item.selling_price) || 0) * item.quantity).toLocaleString("en-IN")}
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 mt-1 ml-auto cursor-pointer"
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
            <form onSubmit={handleApplyCoupon} className="p-4 rounded-2xl bg-surface-elevated/40 border border-token space-y-3 shadow-xs">
              <label className="block text-xs font-semibold text-secondary-token flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-token" />
                <span>Promotional Voucher</span>
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. AXINIX10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="uppercase font-mono text-xs"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Apply
                </Button>
              </div>
            </form>

            {/* Bill Summary */}
            <div className="p-5 md:p-6 rounded-2xl bg-surface-elevated/40 border border-token space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-primary-token">Order Summary</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-token">
                  <span>Cart Subtotal</span>
                  <span className="text-primary-token font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-token">
                  <span>Statutory GST (18% Incl.)</span>
                  <span className="text-secondary-token">₹{estimatedTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-muted-token">
                  <span>Pan-India Logistics</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
                </div>

                <div className="pt-3 border-t border-token flex justify-between items-baseline">
                  <span className="text-sm font-bold text-primary-token">Final Total</span>
                  <span className="text-xl font-extrabold text-brand-token">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <Link to="/shopping/checkout" className="block pt-2">
                <Button variant="primary" size="md" className="w-full" icon={ArrowRight}>
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
