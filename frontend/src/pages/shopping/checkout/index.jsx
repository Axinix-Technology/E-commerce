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
  Receipt,
  Plus,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Select, Textarea } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

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
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              Statutory Checkout & Billing
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              GST-compliant billing with real-time tax calculation according to statutory Place of Supply rules
            </p>
          </div>
        </div>

        <Link to="/shopping/checkout/create">
          <Button variant="secondary" size="sm" icon={Plus}>
            New Address
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Cart Items: <strong className="text-primary-token font-medium">{formatQty(cartItems.length)}</strong></span>
        <span>•</span>
        <span>Payable: <strong className="text-brand-token font-medium">{totalAmount > 0 ? `₹${totalAmount.toLocaleString("en-IN")}` : "—"}</strong></span>
        <span>•</span>
        <span>Tax Compliance: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">18% GST Scoped</strong></span>
        <span>•</span>
        <span>Dispatch: <strong className="text-primary-token font-medium">Free Air Cargo</strong></span>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Customer & Shipping Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Type Toggle */}
          <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-token flex items-center justify-between shadow-xs">
            <span className="text-xs font-semibold text-secondary-token">Customer Classification</span>
            <div className="flex bg-surface-elevated/80 p-1 rounded-xl border border-token">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customer_type: "b2c" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  formData.customer_type === "b2c"
                    ? "bg-brand-token text-white shadow-xs"
                    : "text-muted-token hover:text-primary-token"
                }`}
              >
                Retail (B2C)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customer_type: "b2b" })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  formData.customer_type === "b2b"
                    ? "bg-brand-token text-white shadow-xs"
                    : "text-muted-token hover:text-primary-token"
                }`}
              >
                Business (B2B)
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-5 md:p-6 rounded-2xl bg-surface-elevated/40 border border-token space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider">
              1. Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Alex Mercer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <Input
                label="Mobile Phone"
                type="tel"
                required
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {formData.customer_type === "b2b" && (
                <>
                  <Input
                    label="Company / Trade Name"
                    required
                    placeholder="e.g. Mercer Retail Pvt Ltd"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />

                  <Input
                    label="GSTIN (15 Digits)"
                    required
                    maxLength={15}
                    placeholder="e.g. 27AAACM1234F1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="font-mono uppercase"
                  />
                </>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-5 md:p-6 rounded-2xl bg-surface-elevated/40 border border-token space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider">
              2. Shipping Address & Place of Supply
            </h3>

            <div className="space-y-4">
              <Textarea
                label="Street Address"
                rows={2}
                required
                placeholder="Flat/Unit No, Street, Locality..."
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  required
                  placeholder="e.g. Mumbai"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />

                <Select
                  label="State (Place of Supply)"
                  required
                  value={formData.state_id}
                  onChange={(e) => setFormData({ ...formData, state_id: e.target.value })}
                  options={states.map((s) => ({ value: String(s.id), label: `${s.code} - ${s.name}` }))}
                />

                <Input
                  label="PIN Code"
                  required
                  maxLength={6}
                  placeholder="400050"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-5 md:p-6 rounded-2xl bg-surface-elevated/40 border border-token space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider">
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
                      ? "bg-brand-token/10 border-brand-token text-primary-token"
                      : "bg-surface-elevated/40 border-token text-secondary-token hover:border-token"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary-token">{p.label}</span>
                    <input
                      type="radio"
                      name="payment_method"
                      value={p.id}
                      checked={formData.payment_method === p.id}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="text-brand-token focus:ring-0"
                    />
                  </div>
                  <span className="text-[10px] text-muted-token">{p.sub}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Review Sidebar */}
        <div className="p-5 md:p-6 rounded-2xl bg-surface-elevated/40 border border-token space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-primary-token">Order Review</h3>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-secondary-token">
                <span className="truncate pr-2">{item.quantity} × {item.name}</span>
                <span className="font-mono text-primary-token shrink-0">
                  ₹{((Number(item.selling_price) || 0) * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-token space-y-2 text-xs">
            <div className="flex justify-between text-muted-token">
              <span>Subtotal</span>
              <span className="text-primary-token font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-muted-token">
              <span>GST & Cess (18%)</span>
              <span className="text-primary-token font-medium">Included</span>
            </div>
            <div className="flex justify-between text-muted-token">
              <span>PAN-India Delivery</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
            </div>
            <div className="pt-2 border-t border-token flex justify-between items-baseline">
              <span className="text-sm font-bold text-primary-token">Payable Amount</span>
              <span className="text-xl font-extrabold text-brand-token">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="md"
            className="w-full"
            icon={Lock}
            loading={submitting}
          >
            Place Order ({totalAmount > 0 ? `₹${totalAmount.toLocaleString("en-IN")}` : "—"})
          </Button>
        </div>
      </form>
    </div>
  );
}
