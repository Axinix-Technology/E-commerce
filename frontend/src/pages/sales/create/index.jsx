import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  User,
  CreditCard,
  Package,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Input, Select } from "../../../components/ui";

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

        const custData = Array.isArray(custRes) ? custRes : custRes?.data || [];
        const varData = Array.isArray(varRes) ? varRes : varRes?.data || [];

        setCustomers(custData);
        setVariants(varData);
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
      toast.error("An order must contain at least one product row");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let totalUnits = 0;

    items.forEach((it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unit_price) || 0;
      const taxRate = Number(it.tax_rate) || 0;
      const disc = Number(it.discount_amount) || 0;

      const baseAmount = price * qty;
      const taxable = Math.max(0, baseAmount - disc);
      const tax = (taxable * taxRate) / 100;

      subtotal += baseAmount;
      totalDiscount += disc;
      totalTax += tax;
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
    if (e) e.preventDefault();

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
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/sales/index"
            className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-token" />
              New Sale Order (POS)
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Instant point-of-sale checkout and invoice generation
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Save}
          loading={submitting}
          onClick={handleSubmit}
        >
          Complete Order
        </Button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Cart Items: <strong className="text-primary-token font-medium">{formatQty(items.length)}</strong></span>
        <span>•</span>
        <span>Total Units: <strong className="text-primary-token font-medium">{formatQty(totalUnits)}</strong></span>
        <span>•</span>
        <span>Subtotal: <strong className="text-primary-token font-medium">{formatCurrency(subtotal)}</strong></span>
        <span>•</span>
        <span>GST Tax: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatCurrency(totalTax)}</strong></span>
        <span>•</span>
        <span>Payable Total: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(grandTotal)}</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Customer & Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Selection Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
              <User className="w-4 h-4 text-brand-token" />
              Customer Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Select Existing Customer"
                value={formData.customer_id}
                onChange={(e) => handleCustomerChange(e.target.value)}
                placeholder="-- Walk-in / Guest Customer --"
                options={customers.map((c) => ({
                  value: c.id,
                  label: `${c.name} (${c.phone || c.email || "No phone"})`,
                }))}
              />

              <Input
                label="Customer Name"
                placeholder="e.g. John Doe"
                fieldType="name"
                value={formData.customer_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, customer_name: e.target.value }))}
              />

              <Input
                label="Customer Phone"
                placeholder="+91 98765 43210"
                fieldType="phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, customer_phone: e.target.value }))}
              />

              <Input
                label="Customer Email"
                placeholder="customer@domain.com"
                fieldType="email"
                value={formData.customer_email}
                onChange={(e) => setFormData((prev) => ({ ...prev, customer_email: e.target.value }))}
              />
            </div>
          </div>

          {/* Line Items Table Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
                <Package className="w-4 h-4 text-brand-token" />
                Order Line Items
              </div>
              <Button
                size="xs"
                variant="outline"
                icon={Plus}
                onClick={addItemRow}
              >
                Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-token text-muted-token font-semibold uppercase text-[10px]">
                    <th className="pb-2 w-[35%]">Product Variant</th>
                    <th className="pb-2 w-[15%]">Qty</th>
                    <th className="pb-2 w-[20%]">Price (₹)</th>
                    <th className="pb-2 w-[12%]">Tax %</th>
                    <th className="pb-2 w-[13%] text-right">Line Total</th>
                    <th className="pb-2 w-[5%] text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-token">
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
                          <Select
                            size="xs"
                            value={item.variant_id}
                            onChange={(e) => handleVariantSelect(idx, e.target.value)}
                            placeholder="-- Choose Variant --"
                            options={variants.map((v) => ({
                              value: v.id,
                              label: `${v.product?.name || "Product"} (${v.sku}) - ₹${v.selling_price || v.cost_price || 0}`,
                            }))}
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <Input
                            size="xs"
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <Input
                            size="xs"
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(idx, "unit_price", e.target.value)}
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <Select
                            size="xs"
                            value={item.tax_rate}
                            onChange={(e) => updateItem(idx, "tax_rate", e.target.value)}
                            options={[
                              { label: "0%", value: 0 },
                              { label: "5%", value: 5 },
                              { label: "12%", value: 12 },
                              { label: "18%", value: 18 },
                              { label: "28%", value: 28 },
                            ]}
                          />
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-primary-token">
                          {formatCurrency(lineVal)}
                        </td>
                        <td className="py-2.5 pl-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="p-1 text-muted-token hover:text-rose-500 rounded-lg hover:bg-surface transition-colors cursor-pointer"
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

        {/* Right Column: Payment & Order Summary */}
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-brand-token" />
              Settlement & Payment
            </div>

            <Select
              label="Payment Method"
              value={formData.payment_method}
              onChange={(e) => setFormData((prev) => ({ ...prev, payment_method: e.target.value }))}
              options={[
                { label: "Cash on Counter", value: "cash" },
                { label: "UPI / QR Code", value: "upi" },
                { label: "Debit / Credit Card", value: "card" },
                { label: "Net Banking / Transfer", value: "bank_transfer" },
              ]}
            />

            <Select
              label="Payment Status"
              value={formData.payment_status}
              onChange={(e) => setFormData((prev) => ({ ...prev, payment_status: e.target.value }))}
              options={[
                { label: "Paid in Full", value: "paid" },
                { label: "Pending Payment", value: "pending" },
              ]}
            />

            <Input
              label="Shipping / Delivery Fee (₹)"
              type="number"
              min="0"
              value={formData.shipping_fee}
              onChange={(e) => setFormData((prev) => ({ ...prev, shipping_fee: e.target.value }))}
            />

            <Input
              label="Shipping Address"
              placeholder="Door / street address..."
              value={formData.shipping_address}
              onChange={(e) => setFormData((prev) => ({ ...prev, shipping_address: e.target.value }))}
            />

            <div className="pt-3 border-t border-token space-y-2 text-xs">
              <div className="flex justify-between text-secondary-token">
                <span>Subtotal Items</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-secondary-token">
                <span>Discount Total</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">-{formatCurrency(totalDiscount)}</span>
              </div>
              <div className="flex justify-between text-secondary-token">
                <span>GST Tax</span>
                <span className="font-mono">{formatCurrency(totalTax)}</span>
              </div>
              <div className="flex justify-between text-secondary-token">
                <span>Delivery Fee</span>
                <span className="font-mono">{formatCurrency(formData.shipping_fee)}</span>
              </div>
              <div className="pt-2 border-t border-token flex justify-between font-bold text-sm text-primary-token">
                <span>Total Amount</span>
                <span className="font-mono text-base text-brand-token">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              fullWidth
              icon={Save}
              loading={submitting}
              onClick={handleSubmit}
            >
              Confirm & Print Invoice
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
