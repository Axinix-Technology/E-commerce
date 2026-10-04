import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Search,
  User,
  CreditCard,
  Percent,
  CheckCircle2,
  Package
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

// Rule 1: Zero values rendered as em-dash
const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

const formatCurrency = (val) => {
  const num = Number(val);
  return !num || num === 0
    ? "—"
    : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function CreateSaleOrderPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    payment_method: "cash",
    payment_status: "paid",
    shipping_address: "",
    shipping_city: "",
    shipping_fee: 0,
    notes: "",
  });

  // Line items state
  const [items, setItems] = useState([
    {
      variant_id: "",
      product_name: "",
      sku: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 18,
      discount_amount: 0,
    },
  ]);

  useEffect(() => {
    // Load customers and available product variants
    const loadPrerequisites = async () => {
      setLoading(true);
      try {
        const [custRes, varRes] = await Promise.all([
          populateApi.read("customer_master", { limit: 100, sort: ["name"] }),
          populateApi.read("product_variant", {
            limit: 100,
            populate: { product: ["id", "name"] },
            sort: ["sku"],
          }),
        ]);

        if (custRes?.data) setCustomers(custRes.data);
        if (varRes?.data) setVariants(varRes.data);
      } catch (err) {
        console.error("Failed loading lookup data", err);
      } finally {
        setLoading(false);
      }
    };

    loadPrerequisites();
  }, []);

  const handleCustomerChange = (customerId) => {
    if (!customerId) {
      setFormData((prev) => ({
        ...prev,
        customer_id: "",
        customer_name: "",
        customer_phone: "",
        customer_email: "",
      }));
      return;
    }

    const selected = customers.find((c) => String(c.id) === String(customerId));
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        customer_id: selected.id,
        customer_name: selected.name,
        customer_phone: selected.phone || "",
        customer_email: selected.email || "",
        shipping_address: selected.address || "",
        shipping_city: selected.city || "",
      }));
    }
  };

  const handleVariantSelect = (index, variantId) => {
    const selected = variants.find((v) => String(v.id) === String(variantId));
    setItems((prev) => {
      const next = [...prev];
      if (selected) {
        next[index] = {
          ...next[index],
          variant_id: selected.id,
          sku: selected.sku,
          product_name: selected.product?.name || selected.sku,
          unit_price: Number(selected.selling_price || selected.cost_price || 0),
        };
      } else {
        next[index].variant_id = "";
      }
      return next;
    });
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        variant_id: "",
        product_name: "",
        sku: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: 18,
        discount_amount: 0,
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) {
      toast.error("An order must have at least one line item");
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let totalUnits = 0;

    items.forEach((item) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const price = Number(item.unit_price) || 0;
      const taxRate = Number(item.tax_rate) || 0;
      const disc = Number(item.discount_amount) || 0;

      const lineNet = price * qty - disc;
      const lineTax = (lineNet * taxRate) / 100;

      subtotal += price * qty;
      totalTax += lineTax;
      totalDiscount += disc;
      totalUnits += qty;
    });

    const shipping = Number(formData.shipping_fee) || 0;
    const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax + shipping);

    return {
      subtotal,
      totalTax,
      totalDiscount,
      shipping,
      grandTotal,
      totalUnits,
    };
  };

  const { subtotal, totalTax, totalDiscount, grandTotal, totalUnits } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = items.filter((it) => it.variant_id);
    if (validItems.length === 0) {
      toast.error("Please select at least one valid product variant");
      return;
    }

    setSubmitting(true);
    try {
      const saleNumber = `SO-${Date.now().toString().slice(-6)}`;
      const now = new Date().toISOString();

      // 1. Create Sale header
      const salePayload = {
        sale_number: saleNumber,
        status: "completed",
        payment_status: formData.payment_status,
        customer_id: formData.customer_id || null,
        customer_name: formData.customer_name || "Walk-in Guest",
        customer_phone: formData.customer_phone || "",
        customer_email: formData.customer_email || "",
        shipping_address: formData.shipping_address || "",
        shipping_city: formData.shipping_city || "",
        shipping_fee: formData.shipping_fee || 0,
        payment_method: formData.payment_method,
        order_status: "delivered",
        sold_at: now,
        subtotal,
        tax_amount: totalTax,
        discount_amount: totalDiscount,
        total_amount: grandTotal,
        notes: formData.notes || "",
      };

      const saleRes = await populateApi.create("sale", salePayload);
      const createdSale = saleRes?.data || saleRes;

      // 2. Create Sale Items
      if (createdSale?.id) {
        for (const item of validItems) {
          const qty = Number(item.quantity) || 1;
          const price = Number(item.unit_price) || 0;
          const tax = Number(item.tax_rate) || 0;
          const disc = Number(item.discount_amount) || 0;
          const lineTotal = price * qty - disc + ((price * qty - disc) * tax) / 100;

          await populateApi.create("sale_item", {
            sale_id: createdSale.id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            sku: item.sku,
            quantity: qty,
            unit_price: price,
            tax_rate: tax,
            discount_amount: disc,
            line_total: lineTotal,
          });
        }

        // 3. Create payment record if paid
        if (formData.payment_status === "paid") {
          await populateApi.create("sale_payment", {
            sale_id: createdSale.id,
            customer_id: formData.customer_id || null,
            transaction_type: "payment",
            amount: grandTotal,
            payment_method: formData.payment_method,
            reference_number: `PAY-${Date.now().toString().slice(-6)}`,
            transacted_at: now,
            notes: "Immediate counter POS settlement",
          });
        }
      }

      toast.success(`Sale order ${saleNumber} created successfully!`);
      navigate(`/sales/details?id=${createdSale?.id || ""}`);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to create sales order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/sales/index"
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">New Sale Order (POS)</h1>
            <p className="text-xs text-text-muted">Instant point-of-sale checkout and invoice generation</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Processing..." : "Complete Order"}
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Cart Items: <strong className="text-text-primary font-medium">{formatQty(items.length)}</strong></span>
        <span>•</span>
        <span>Total Units: <strong className="text-text-primary font-medium">{formatQty(totalUnits)}</strong></span>
        <span>•</span>
        <span>Subtotal: <strong className="text-text-primary font-medium">{formatCurrency(subtotal)}</strong></span>
        <span>•</span>
        <span>GST Tax: <strong className="text-emerald-400 font-medium">{formatCurrency(totalTax)}</strong></span>
        <span>•</span>
        <span>Payable Total: <strong className="text-emerald-400 font-semibold">{formatCurrency(grandTotal)}</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Customer & Items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Selection Card */}
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <User className="w-4 h-4 text-primary" />
              Customer Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Select Existing Customer
                </label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary/50"
                >
                  <option value="">-- Walk-in / Guest Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || c.email || "No phone"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Customer Phone
                </label>
                <input
                  type="text"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customer_phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, customer_email: e.target.value }))}
                  placeholder="customer@domain.com"
                  className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Line Items Table Card */}
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
                <Package className="w-4 h-4 text-primary" />
                Order Line Items
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-text-muted font-medium">
                    <th className="pb-2 w-[35%]">Product Variant</th>
                    <th className="pb-2 w-[15%]">Qty</th>
                    <th className="pb-2 w-[20%]">Price (₹)</th>
                    <th className="pb-2 w-[15%]">Tax %</th>
                    <th className="pb-2 w-[15%] text-right">Line Total</th>
                    <th className="pb-2 w-[5%] text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {items.map((item, idx) => {
                    const itemQty = Number(item.quantity) || 1;
                    const itemPrice = Number(item.unit_price) || 0;
                    const itemTax = Number(item.tax_rate) || 0;
                    const itemDisc = Number(item.discount_amount) || 0;
                    const lineNet = itemPrice * itemQty - itemDisc;
                    const lineVal = lineNet + (lineNet * itemTax) / 100;

                    return (
                      <tr key={idx} className="group">
                        <td className="py-2.5 pr-2">
                          <select
                            value={item.variant_id}
                            onChange={(e) => handleVariantSelect(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-surface-card border border-border/60 rounded-lg text-xs text-text-primary focus:outline-none focus:border-primary/50"
                          >
                            <option value="">-- Choose Variant --</option>
                            {variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.sku} - {v.product?.name || "Product"} (₹{v.selling_price || v.cost_price || 0})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 pr-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                            className="w-full px-2 py-1.5 bg-surface-card border border-border/60 rounded-lg text-xs text-text-primary focus:outline-none text-center"
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(idx, "unit_price", e.target.value)}
                            className="w-full px-2 py-1.5 bg-surface-card border border-border/60 rounded-lg text-xs text-text-primary focus:outline-none text-right"
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <select
                            value={item.tax_rate}
                            onChange={(e) => updateItem(idx, "tax_rate", e.target.value)}
                            className="w-full px-2 py-1.5 bg-surface-card border border-border/60 rounded-lg text-xs text-text-primary focus:outline-none text-center"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>
                        <td className="py-2.5 pr-2 text-right font-medium text-emerald-400">
                          {formatCurrency(lineVal)}
                        </td>
                        <td className="py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="p-1 rounded text-text-muted hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary & Payment */}
        <div className="space-y-5">
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-primary" />
              Settlement & Payment
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["cash", "upi", "card", "bank_transfer"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, payment_method: m }))}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border capitalize transition-all ${
                        formData.payment_method === m
                          ? "bg-primary/20 border-primary text-primary font-semibold"
                          : "bg-surface-card border-border/60 text-text-muted hover:text-text-primary"
                      }`}
                    >
                      {m.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Payment Status
                </label>
                <select
                  value={formData.payment_status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, payment_status: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
                >
                  <option value="paid">Paid (Collected in Full)</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="unpaid">Unpaid / Credit Memo</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Shipping / Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.shipping_fee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shipping_fee: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Order Notes
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Counter notes, delivery instructions..."
                  className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Bill Breakdown */}
            <div className="pt-3 border-t border-border/60 space-y-2 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal ({formatQty(totalUnits)} units):</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Tax (GST):</span>
                <span>{formatCurrency(totalTax)}</span>
              </div>
              {Number(formData.shipping_fee) > 0 && (
                <div className="flex justify-between text-text-muted">
                  <span>Shipping Fee:</span>
                  <span>{formatCurrency(formData.shipping_fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border/40">
                <span>Grand Total:</span>
                <span className="text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? "Finalizing Sale..." : "Confirm & Complete Sale"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
