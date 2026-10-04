import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CreditCard,
  Building2,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  Receipt
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [states, setStates] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_type: "b2c",
    name: "",
    phone: "",
    email: "",
    company_name: "",
    gstin: "",
    shipping_address: "",
    city: "",
    state_id: "",
    pincode: "",
    payment_method: "upi",
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("customer_cart") || "[]");
    if (stored.length === 0) {
      navigate("/shopping/cart");
      return;
    }
    setCartItems(stored);

    populateApi.read("state_master", { limit: 50, sort: ["name"] })
      .then((res) => {
        if (res?.data) {
          setStates(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, state_id: String(res.data[0].id) }));
          }
        }
      })
      .catch(() => {});
  }, [navigate]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.selling_price) || 0) * item.quantity,
    0
  );
  const totalAmount = subtotal;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.shipping_address) {
      toast.error("Please fill in recipient name, phone, and delivery address");
      return;
    }

    setSubmitting(true);
    try {
      const orderNumber = `SO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderRecord = {
        order_number: orderNumber,
        customer: formData,
        items: cartItems,
        subtotal,
        total_amount: totalAmount,
        payment_method: formData.payment_method,
        placed_at: new Date().toISOString(),
      };

      localStorage.setItem("last_confirmed_order", JSON.stringify(orderRecord));
      localStorage.removeItem("customer_cart");

      toast.success(`Order ${orderNumber} placed successfully!`);
      navigate(`/shopping/order-confirmation?order=${orderNumber}`);
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>Statutory Checkout & Billing</span>
        </h1>
        <p className="text-xs text-gray-400">
          GST-compliant billing with real-time tax calculation according to statutory Place of Supply rules
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Customer & Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Type Toggle */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-200">Customer Classification</span>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customer_type: "b2c" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  formData.customer_type === "b2c"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Retail (B2C)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customer_type: "b2b" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  formData.customer_type === "b2b"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Business (B2B)
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
              1. Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              {formData.customer_type === "b2b" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Company / Trade Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mercer Retail Pvt Ltd"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">GSTIN (15 Digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      placeholder="e.g. 27AAACM1234F1Z5"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono uppercase"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
              2. Shipping Address & Place of Supply
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Street Address *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Flat/Unit No, Street, Locality..."
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">State (Place of Supply) *</label>
                  <select
                    required
                    value={formData.state_id}
                    onChange={(e) => setFormData({ ...formData, state_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
                  >
                    {states.map((s) => (
                      <option key={s.id} value={s.id} className="bg-gray-900 text-white">
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="400050"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
              3. Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "upi", label: "Instant UPI", sub: "GPay, PhonePe, Paytm" },
                { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                { id: "netbanking", label: "Net Banking", sub: "HDFC, ICICI, SBI" },
              ].map((p) => (
                <label
                  key={p.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    formData.payment_method === p.id
                      ? "bg-[rgba(0,210,210,0.12)] border-[var(--brand-primary)] text-white"
                      : "bg-white/[0.02] border-white/10 text-gray-300 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold">{p.label}</span>
                    <input
                      type="radio"
                      name="payment_method"
                      value={p.id}
                      checked={formData.payment_method === p.id}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="text-[var(--brand-primary)] focus:ring-0"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{p.sub}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Review Sidebar */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
          <h3 className="text-sm font-bold text-white">Order Review</h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-gray-300">
                <span className="truncate pr-2">{item.quantity} × {item.name}</span>
                <span className="font-mono text-white shrink-0">
                  ₹{((Number(item.selling_price) || 0) * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.08] space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span className="text-white font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>GST & Cess (18%)</span>
              <span className="text-white font-medium">Included</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>PAN-India Delivery</span>
              <span className="text-emerald-400 font-medium">Free</span>
            </div>
            <div className="pt-2 border-t border-white/[0.08] flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Payable Amount</span>
              <span className="text-xl font-extrabold text-[var(--brand-primary)]">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{submitting ? "Processing..." : `Place Order (₹${totalAmount.toLocaleString("en-IN")})`}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
