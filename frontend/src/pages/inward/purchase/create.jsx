import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  PackageCheck,
  Save,
  Plus,
  Trash2,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Barcode
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function CreatePurchaseInwardPage() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [headerData, setHeaderData] = useState({
    vendor_id: "",
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  const [items, setItems] = useState([
    {
      product_id: "",
      quantity: 1,
      unit_cost: "",
      tax_rate: 5,
    },
  ]);

  useEffect(() => {
    // 1. Fetch active vendors
    populateApi
      .read("vendor_master", { limit: 100, filter: { status: 1 }, sort: ["name"] })
      .then((res) => {
        if (res?.data) {
          setVendors(res.data);
          if (res.data.length > 0 && !headerData.vendor_id) {
            setHeaderData((prev) => ({ ...prev, vendor_id: String(res.data[0].id) }));
          }
        }
      })
      .catch(() => {});

    // 2. Fetch products
    populateApi
      .read("product_type", { limit: 200, filter: { status: 1 }, sort: ["name"] })
      .then((res) => {
        if (res?.data) {
          setProducts(res.data);
          if (res.data.length > 0 && !items[0].product_id) {
            setItems([{ ...items[0], product_id: String(res.data[0].id) }]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleAddItem = () => {
    const defaultProdId = products.length > 0 ? String(products[0].id) : "";
    setItems([
      ...items,
      {
        product_id: defaultProdId,
        quantity: 1,
        unit_cost: "",
        tax_rate: 5,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      toast.error("Inward shipment must contain at least one item.");
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Live Totals Calculation
  const calculateTotals = () => {
    let taxable = 0;
    let tax = 0;
    let totalUnits = 0;

    items.forEach((item) => {
      const qty = parseInt(item.quantity, 10) || 0;
      const cost = parseFloat(item.unit_cost) || 0;
      const rate = parseFloat(item.tax_rate) || 0;

      const lineTaxable = qty * cost;
      const lineTax = (lineTaxable * rate) / 100;

      taxable += lineTaxable;
      tax += lineTax;
      totalUnits += qty;
    });

    return {
      taxable,
      tax,
      grandTotal: taxable + tax,
      totalUnits,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!headerData.vendor_id || !headerData.invoice_number.trim()) {
      toast.error("Vendor and Supplier Invoice Number are required.");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.product_id) {
        toast.error(`Line item #${i + 1}: Please select a product.`);
        return;
      }
      if (!item.quantity || parseInt(item.quantity, 10) <= 0) {
        toast.error(`Line item #${i + 1}: Quantity must be greater than zero.`);
        return;
      }
      if (item.unit_cost === "" || parseFloat(item.unit_cost) < 0) {
        toast.error(`Line item #${i + 1}: Please specify a valid purchase cost price.`);
        return;
      }
    }

    setSubmitting(true);
    const payload = {
      vendor_id: parseInt(headerData.vendor_id, 10),
      invoice_number: headerData.invoice_number.trim(),
      invoice_date: headerData.invoice_date,
      remarks: headerData.remarks.trim() || null,
      items: items.map((itm) => ({
        product_id: parseInt(itm.product_id, 10),
        quantity: parseInt(itm.quantity, 10),
        unit_cost: parseFloat(itm.unit_cost),
        tax_rate: parseFloat(itm.tax_rate || 0),
      })),
    };

    try {
      const res = await populateApi.create("purchase_inward", payload);
      toast.success(res?.message || "Inward shipment processed and stock added successfully!");
      navigate("/inward/purchase");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || err?.message || "Failed to process inward shipment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar with Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-token">
        <div className="flex items-center gap-3">
          <Link
            to="/inward/purchase"
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface border border-token text-secondary-token hover:text-primary-token transition-colors"
            title="Back to Purchase Inwards"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-token mb-0.5">
              <span>Inward Management</span>
              <span>/</span>
              <Link to="/inward/purchase" className="hover:text-primary-token">
                Purchase Inward (GRN)
              </Link>
              <span>/</span>
              <span className="text-brand-token font-medium">New Receipt</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              Goods Receipt & Barcode Inward Entry
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/inward/purchase"
            className="px-4 py-2 rounded-xl border border-token hover:bg-surface-elevated text-secondary-token text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Processing..." : "Receive & Generate Barcodes"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier & Invoice Header */}
        <div className="glass-panel p-6 rounded-2xl border border-token space-y-5 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-token" />
              Supplier & Invoice Details
            </h2>
            <p className="text-xs text-muted-token mt-0.5">
              Official supplier document credentials and arrival timestamp.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Vendor / Supplier <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={headerData.vendor_id}
                onChange={(e) => setHeaderData({ ...headerData, vendor_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
              >
                <option value="">— Select Vendor —</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.gstin ? `[GST: ${v.gstin}]` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Supplier Bill / Invoice No <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <FileText className="w-3.5 h-3.5 text-muted-token absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-2026-9812"
                  value={headerData.invoice_number}
                  onChange={(e) => setHeaderData({ ...headerData, invoice_number: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-secondary-token mb-1.5">
                Invoice Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-muted-token absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={headerData.invoice_date}
                  onChange={(e) => setHeaderData({ ...headerData, invoice_date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-elevated border border-token text-primary-token text-xs focus:outline-none focus:border-[var(--brand-secondary)]"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-secondary-token mb-1.5">Remarks / Consignment Notes</label>
              <input
                type="text"
                placeholder="e.g. Received 2 boxes via BlueDart AWB# 12345678, inspected seal OK"
                value={headerData.remarks}
                onChange={(e) => setHeaderData({ ...headerData, remarks: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-elevated border border-token text-primary-token text-xs focus:outline-none focus:border-[var(--brand-secondary)]"
              />
            </div>
          </div>
        </div>

        {/* Inward Line Items Table */}
        <div className="glass-panel p-6 rounded-2xl border border-token space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-brand-token" />
                Inward Product Items & Cost Pricing
              </h2>
              <p className="text-xs text-muted-token mt-0.5">
                Item quantities, purchase landing cost, and applicable GST rate.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface border border-token text-brand-token text-xs font-semibold cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated/60 text-secondary-token uppercase tracking-wider font-semibold border-b border-token">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Product Definition</th>
                  <th className="py-2.5 px-3 w-28">Quantity</th>
                  <th className="py-2.5 px-3 w-36">Purchase Cost (₹)</th>
                  <th className="py-2.5 px-3 w-28">GST Rate (%)</th>
                  <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                  <th className="py-2.5 px-3 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-token text-primary-token">
                {items.map((item, idx) => {
                  const qty = parseInt(item.quantity, 10) || 0;
                  const cost = parseFloat(item.unit_cost) || 0;
                  const rate = parseFloat(item.tax_rate) || 0;
                  const lineTotal = qty * cost + (qty * cost * rate) / 100;

                  return (
                    <tr key={idx} className="hover:bg-surface-elevated/30">
                      <td className="py-3 px-3 font-mono text-muted-token">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <select
                          required
                          value={item.product_id}
                          onChange={(e) => handleItemChange(idx, "product_id", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-token text-primary-token text-xs focus:outline-none focus:border-[var(--brand-secondary)]"
                        >
                          <option value="">— Select Product —</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.brand ? `(${p.brand})` : ""}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-token font-mono text-xs focus:outline-none focus:border-[var(--brand-secondary)]"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="relative">
                          <span className="text-[10px] text-muted-token absolute left-2.5 top-1/2 -translate-y-1/2 font-mono">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            placeholder="0.00"
                            value={item.unit_cost}
                            onChange={(e) => handleItemChange(idx, "unit_cost", e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 rounded-xl bg-surface-elevated border border-token font-mono text-xs focus:outline-none focus:border-[var(--brand-secondary)]"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={item.tax_rate}
                          onChange={(e) => handleItemChange(idx, "tax_rate", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-surface-elevated border border-token text-xs focus:outline-none focus:border-[var(--brand-secondary)] font-mono"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-400">
                        ₹{lineTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-token hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove item"
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

        {/* Inward Totals & Barcode Generation Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-token space-y-3">
            <h3 className="text-sm font-bold text-primary-token flex items-center gap-2">
              <Barcode className="w-4 h-4 text-brand-token" />
              Automated Physical Barcode Sticker Tagging
            </h3>
            <p className="text-xs text-secondary-token leading-relaxed">
              Upon clicking <strong className="text-primary-token">Receive & Generate Barcodes</strong>, the system assigns a unique batch lot (<code className="font-mono text-brand-token">LOT-YYYYMMDD-XXXX</code>) and generates <strong className="text-emerald-400">{totals.totalUnits}</strong> individual item barcode stickers (<code className="font-mono text-brand-token">ITM-LOT...</code>) ready for immediate warehouse printing and attachment.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-token space-y-3">
            <h3 className="text-sm font-bold text-primary-token pb-2 border-b border-token">
              Shipment Summary
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-secondary-token">
                <span>Total Items:</span>
                <span className="font-mono font-semibold text-primary-token">{items.length}</span>
              </div>
              <div className="flex justify-between text-secondary-token">
                <span>Total Physical Units:</span>
                <span className="font-mono font-bold text-brand-token">{totals.totalUnits}</span>
              </div>
              <div className="flex justify-between text-secondary-token">
                <span>Taxable Amount:</span>
                <span className="font-mono text-primary-token">₹{totals.taxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary-token">
                <span>GST Tax:</span>
                <span className="font-mono text-primary-token">₹{totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-token text-primary-token">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-400">₹{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/inward/purchase"
            className="px-5 py-2 rounded-xl border border-token text-secondary-token hover:bg-surface-elevated text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Processing Inward..." : "Receive & Generate Barcodes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
