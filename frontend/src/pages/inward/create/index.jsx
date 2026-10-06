import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Truck,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Building2,
  Package,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Input, Select, Textarea } from "../../../components/ui";

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

        const venData = Array.isArray(venRes) ? venRes : venRes?.data || [];
        const varData = Array.isArray(varRes) ? varRes : varRes?.data || [];

        setVendors(venData);
        setVariants(varData);
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
      next[index] = {
        ...next[index],
        [field]: value,
      };

      const qty = Number(next[index].quantity) || 1;
      const taxable = Number(next[index].taxable_amount) || 0;
      const taxRate = Number(next[index].tax_rate) || 0;
      const singleTax = (taxable * taxRate) / 100;

      next[index].tax_amount = singleTax * qty;
      next[index].total_amount = (taxable + singleTax) * qty;

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
      toast.error("GRN must contain at least one consignment item");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalQty = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  const totalTaxable = items.reduce((sum, it) => sum + (Number(it.taxable_amount) || 0) * (Number(it.quantity) || 0), 0);
  const totalTax = items.reduce((sum, it) => sum + (Number(it.tax_amount) || 0), 0);
  const grandTotal = items.reduce((sum, it) => sum + (Number(it.total_amount) || 0), 0);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.vendor_id) {
      toast.error("Please select a vendor");
      return;
    }

    const validItems = items.filter((it) => it.variant_id);
    if (validItems.length === 0) {
      toast.error("Please select at least one valid product variant");
      return;
    }

    setSubmitting(true);
    try {
      const grnNumber = `GRN-${Date.now().toString().slice(-6)}`;

      const payload = {
        inward_number: grnNumber,
        vendor_id: formData.vendor_id,
        invoice_number: formData.invoice_number || `INV-${Date.now().toString().slice(-5)}`,
        invoice_date: formData.invoice_date,
        inward_status: formData.inward_status,
        total_quantity: totalQty,
        taxable_amount: totalTaxable,
        tax_amount: totalTax,
        total_amount: grandTotal,
        remarks: formData.remarks,
      };

      const res = await populateApi.create("purchase_inward", payload);
      const createdInward = res?.data || res;

      if (createdInward?.id) {
        for (const item of validItems) {
          await populateApi.create("purchase_inward_item", {
            inward_id: createdInward.id,
            variant_id: item.variant_id,
            quantity: Number(item.quantity) || 1,
            taxable_amount: Number(item.taxable_amount) || 0,
            tax_rate: Number(item.tax_rate) || 0,
            tax_amount: Number(item.tax_amount) || 0,
            total_amount: Number(item.total_amount) || 0,
          });
        }
      }

      toast.success(`Inward consignment ${grnNumber} generated successfully!`);
      navigate(`/inward/details?id=${createdInward?.id || ""}`);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to record inward receipt");
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
            to="/inward/purchase"
            className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-token" />
              New Purchase Inward (GRN)
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Receive vendor shipment, record purchase bill, and stock inward items
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
          Confirm & Inward
        </Button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total SKUs: <strong className="text-primary-token font-medium">{formatQty(items.length)}</strong></span>
        <span>•</span>
        <span>Total Pcs: <strong className="text-primary-token font-medium">{formatQty(totalQty)}</strong></span>
        <span>•</span>
        <span>Taxable Value: <strong className="text-primary-token font-medium">{formatCurrency(totalTaxable)}</strong></span>
        <span>•</span>
        <span>Total GST: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatCurrency(totalTax)}</strong></span>
        <span>•</span>
        <span>Consignment Total: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(grandTotal)}</strong></span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Vendor & Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Vendor & Invoice Metadata Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-brand-token" />
              Vendor Invoice Metadata
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Select
                label="Select Supplier / Vendor"
                required
                value={formData.vendor_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, vendor_id: e.target.value }))}
                placeholder="-- Select Vendor --"
                options={vendors.map((v) => ({
                  value: v.id,
                  label: `${v.name} (${v.vendor_code || "VN"})`,
                }))}
              />

              <Input
                label="Vendor Invoice #"
                required
                placeholder="e.g. INV-2026-99"
                value={formData.invoice_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoice_number: e.target.value }))}
              />

              <Input
                label="Invoice Date"
                type="date"
                required
                value={formData.invoice_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, invoice_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Line Items Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
                <Package className="w-4 h-4 text-brand-token" />
                Inward Consignment Items
              </div>
              <Button
                size="xs"
                variant="outline"
                icon={Plus}
                onClick={addItemRow}
              >
                Add SKU
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-token text-muted-token font-semibold uppercase text-[10px]">
                    <th className="pb-2 w-[35%]">Product SKU</th>
                    <th className="pb-2 w-[15%]">Qty</th>
                    <th className="pb-2 w-[20%]">Cost / Unit (₹)</th>
                    <th className="pb-2 w-[12%]">Tax %</th>
                    <th className="pb-2 w-[13%] text-right">Total</th>
                    <th className="pb-2 w-[5%] text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-token">
                  {items.map((item, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-2.5 pr-2">
                        <Select
                          size="xs"
                          value={item.variant_id}
                          onChange={(e) => handleVariantSelect(idx, e.target.value)}
                          placeholder="-- Choose Variant --"
                          options={variants.map((v) => ({
                            value: v.id,
                            label: `${v.product?.name || "SKU"} (${v.sku})`,
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
                          value={item.taxable_amount}
                          onChange={(e) => updateItem(idx, "taxable_amount", e.target.value)}
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
                        {formatCurrency(item.total_amount)}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Inward Summary */}
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
              <Truck className="w-4 h-4 text-brand-token" />
              Consignment Summary
            </div>

            <Select
              label="Inward Status"
              value={formData.inward_status}
              onChange={(e) => setFormData((prev) => ({ ...prev, inward_status: e.target.value }))}
              options={[
                { label: "Received & Inspected", value: "received" },
                { label: "Draft / Pending Verification", value: "draft" },
              ]}
            />

            <Textarea
              label="Gate Remarks / Delivery Note"
              placeholder="e.g. Transporter docket number, vehicle number..."
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
            />

            <div className="pt-3 border-t border-token space-y-2 text-xs">
              <div className="flex justify-between text-secondary-token">
                <span>Total Pieces</span>
                <span className="font-semibold text-primary-token">{formatQty(totalQty)}</span>
              </div>
              <div className="flex justify-between text-secondary-token">
                <span>Taxable Amount</span>
                <span className="font-mono">{formatCurrency(totalTaxable)}</span>
              </div>
              <div className="flex justify-between text-secondary-token">
                <span>Total GST</span>
                <span className="font-mono">{formatCurrency(totalTax)}</span>
              </div>
              <div className="pt-2 border-t border-token flex justify-between font-bold text-sm text-primary-token">
                <span>Grand Inward Total</span>
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
              Confirm Inward & Generate Barcodes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
