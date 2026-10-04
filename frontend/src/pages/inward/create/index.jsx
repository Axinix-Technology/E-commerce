import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Building2,
  Calendar,
  Package,
  QrCode,
  DollarSign
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

export default function CreateInwardPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vendor_id: "",
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    inward_status: "received",
    remarks: "",
  });

  // Line Items
  const [items, setItems] = useState([
    {
      variant_id: "",
      product_name: "",
      sku: "",
      quantity: 1,
      taxable_amount: 0,
      tax_rate: 18,
      tax_amount: 0,
      total_amount: 0,
    },
  ]);

  useEffect(() => {
    const loadLookups = async () => {
      setLoading(true);
      try {
        const [venRes, varRes] = await Promise.all([
          populateApi.read("vendor_master", { limit: 100, sort: ["name"] }),
          populateApi.read("product_variant", {
            limit: 100,
            populate: { product: ["id", "name"] },
            sort: ["sku"],
          }),
        ]);

        if (venRes?.data) setVendors(venRes.data);
        if (varRes?.data) setVariants(varRes.data);
      } catch (err) {
        console.error("Failed loading lookups", err);
      } finally {
        setLoading(false);
      }
    };

    loadLookups();
  }, []);

  const handleVariantSelect = (index, variantId) => {
    const selected = variants.find((v) => String(v.id) === String(variantId));
    setItems((prev) => {
      const next = [...prev];
      if (selected) {
        const cost = Number(selected.cost_price || 0);
        const taxRate = Number(next[index].tax_rate) || 18;
        const tax = (cost * taxRate) / 100;
        next[index] = {
          ...next[index],
          variant_id: selected.id,
          sku: selected.sku,
          product_name: selected.product?.name || selected.sku,
          taxable_amount: cost,
          tax_amount: tax,
          total_amount: cost + tax,
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
      next[index] = { ...next[index], [field]: value };

      const qty = Number(next[index].quantity) || 1;
      const unitCost = Number(next[index].taxable_amount) || 0;
      const taxRate = Number(next[index].tax_rate) || 0;

      const lineTaxable = unitCost * qty;
      const lineTax = (lineTaxable * taxRate) / 100;

      next[index].tax_amount = lineTax;
      next[index].total_amount = lineTaxable + lineTax;

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
        taxable_amount: 0,
        tax_rate: 18,
        tax_amount: 0,
        total_amount: 0,
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length <= 1) {
      toast.error("Inward must have at least one line item");
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Totals
  const calculateTotals = () => {
    let taxable = 0;
    let tax = 0;
    let total = 0;
    let units = 0;

    items.forEach((item) => {
      const q = Number(item.quantity) || 0;
      const uCost = Number(item.taxable_amount) || 0;
      const tRate = Number(item.tax_rate) || 0;

      const lineNet = uCost * q;
      const lineTax = (lineNet * tRate) / 100;

      taxable += lineNet;
      tax += lineTax;
      total += lineNet + lineTax;
      units += q;
    });

    return { taxable, tax, total, units };
  };

  const { taxable, tax, total, units } = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vendor_id) {
      toast.error("Please select a vendor");
      return;
    }

    if (!formData.invoice_number.trim()) {
      toast.error("Please provide supplier invoice number");
      return;
    }

    const validItems = items.filter((it) => it.variant_id);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid product variant");
      return;
    }

    setSubmitting(true);
    try {
      const inwardNumber = `GRN-${Date.now().toString().slice(-6)}`;

      // 1. Create PurchaseInward header
      const inwardPayload = {
        inward_number: inwardNumber,
        vendor_id: formData.vendor_id,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        total_taxable_amount: taxable,
        total_tax_amount: tax,
        total_amount: total,
        inward_status: formData.inward_status,
        remarks: formData.remarks || "",
        status: 1,
      };

      const res = await populateApi.create("purchase_inward", inwardPayload);
      const createdInward = res?.data || res;

      // 2. Create Inward Items
      if (createdInward?.id) {
        for (const item of validItems) {
          const qty = Number(item.quantity) || 1;
          const uCost = Number(item.taxable_amount) || 0;
          const tRate = Number(item.tax_rate) || 0;
          const lineTax = (uCost * qty * tRate) / 100;
          const lineTotal = uCost * qty + lineTax;

          await populateApi.create("inward_item", {
            purchase_inward_id: createdInward.id,
            variant_id: item.variant_id,
            quantity: qty,
            taxable_amount: uCost * qty,
            tax_rate: tRate,
            tax_amount: lineTax,
            total_amount: lineTotal,
            status: 1,
          });
        }
      }

      toast.success(`Purchase inward ${inwardNumber} recorded successfully!`);
      navigate(`/inward/details?id=${createdInward?.id || ""}`);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to save purchase inward");
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
            to="/inward/purchase"
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Record Goods Receipt (GRN)</h1>
            <p className="text-xs text-text-muted">Inward stock receiving against supplier commercial invoice</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Saving GRN..." : "Confirm & Stock Inward"}
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Line Items: <strong className="text-text-primary font-medium">{formatQty(items.length)}</strong></span>
        <span>•</span>
        <span>Total Units: <strong className="text-text-primary font-medium">{formatQty(units)}</strong></span>
        <span>•</span>
        <span>Taxable Net: <strong className="text-text-primary font-medium">{formatCurrency(taxable)}</strong></span>
        <span>•</span>
        <span>GST Input: <strong className="text-emerald-400 font-medium">{formatCurrency(tax)}</strong></span>
        <span>•</span>
        <span>Gross Inward Value: <strong className="text-emerald-400 font-semibold">{formatCurrency(total)}</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Vendor & Invoice Details Card */}
        <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-primary" />
            Vendor & Supplier Invoice Header
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Vendor / Supplier *
              </label>
              <select
                required
                value={formData.vendor_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, vendor_id: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary/50"
              >
                <option value="">-- Choose Vendor --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.vendor_code || v.phone || "No Code"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Supplier Bill / Invoice # *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. INV-99081"
                value={formData.invoice_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoice_number: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={formData.invoice_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoice_date: e.target.value }))}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Inward Items Table Card */}
        <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <Package className="w-4 h-4 text-primary" />
              Inward Line Items
            </div>
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product Line
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-text-muted font-medium">
                  <th className="pb-2 w-[40%]">Product Variant</th>
                  <th className="pb-2 w-[12%] text-center">Inward Qty</th>
                  <th className="pb-2 w-[15%] text-right">Cost Price (₹)</th>
                  <th className="pb-2 w-[12%] text-center">GST %</th>
                  <th className="pb-2 w-[15%] text-right">Total (Inc. Tax)</th>
                  <th className="pb-2 w-[6%] text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-text-primary">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 pr-2">
                      <select
                        value={item.variant_id}
                        onChange={(e) => handleVariantSelect(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-surface-card border border-border/60 rounded-lg text-xs text-text-primary focus:outline-none"
                      >
                        <option value="">-- Choose Variant to Inward --</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.sku} - {v.product?.name || "Product"} (Cost: ₹{v.cost_price || 0})
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
                        className="w-full px-2 py-1.5 bg-surface-card border border-border/60 rounded-lg text-xs text-center text-text-primary focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 pr-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.taxable_amount}
                        onChange={(e) => updateItem(idx, "taxable_amount", e.target.value)}
                        className="w-full px-2 py-1.5 bg-surface-card border border-border/60 rounded-lg text-xs text-right text-text-primary focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 pr-2">
                      <select
                        value={item.tax_rate}
                        onChange={(e) => updateItem(idx, "tax_rate", e.target.value)}
                        className="w-full px-2 py-1.5 bg-surface-card border border-border/60 rounded-lg text-xs text-center text-text-primary focus:outline-none"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td className="py-2.5 pr-2 text-right font-medium text-emerald-400">
                      {formatCurrency(item.total_amount)}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Remarks */}
        <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-2">
          <label className="block text-[11px] font-medium text-text-muted">
            Warehouse Remarks & Delivery Notes
          </label>
          <textarea
            rows="2"
            value={formData.remarks}
            onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
            placeholder="Vehicle number, gate entry log, transporter..."
            className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
          />
        </div>
      </form>
    </div>
  );
}
