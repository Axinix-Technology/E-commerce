import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  RotateCcw,
  ArrowLeft,
  Save,
  Search,
  Package,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  User,
  ShoppingBag
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

export default function CreateReturnRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillSaleId = searchParams.get("sale_id");
  const editReturnId = searchParams.get("id");

  const [salesList, setSalesList] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedSaleId, setSelectedSaleId] = useState(prefillSaleId || "");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Return Form State
  const [reason, setReason] = useState("Defective or damaged in transit");
  const [status, setStatus] = useState("requested");
  const [notes, setNotes] = useState("");

  // Items to return (selected from sale items)
  const [returnLines, setReturnLines] = useState([]);

  useEffect(() => {
    // Load recent completed sales for selection
    const loadRecentSales = async () => {
      try {
        const res = await populateApi.read("sale", {
          limit: 50,
          populate: {
            items: ["id", "product_name", "sku", "quantity", "unit_price", "line_total"],
            customer: ["id", "name", "phone"],
          },
          sort: ["-sold_at"],
        });
        if (res?.data) {
          setSalesList(res.data);
          if (prefillSaleId) {
            const found = res.data.find((s) => String(s.id) === String(prefillSaleId));
            if (found) selectSale(found);
          }
        }
      } catch (err) {
        console.error("Failed loading sales for returns", err);
      }
    };

    loadRecentSales();
  }, [prefillSaleId]);

  const selectSale = (sale) => {
    setSelectedSale(sale);
    setSelectedSaleId(sale.id);

    // Populate returnLines from sale items
    const lines = (sale.items || []).map((it) => ({
      sale_item_id: it.id,
      product_name: it.product_name,
      sku: it.sku,
      sold_quantity: it.quantity,
      return_quantity: 1,
      unit_price: Number(it.unit_price) || 0,
      refund_amount: Number(it.unit_price) || 0,
      restockable: true,
      selected: true,
    }));
    setReturnLines(lines);
  };

  const handleSaleSelectChange = (e) => {
    const saleId = e.target.value;
    setSelectedSaleId(saleId);
    const sale = salesList.find((s) => String(s.id) === String(saleId));
    if (sale) {
      selectSale(sale);
    } else {
      setSelectedSale(null);
      setReturnLines([]);
    }
  };

  const toggleLineSelect = (index) => {
    setReturnLines((prev) => {
      const next = [...prev];
      next[index].selected = !next[index].selected;
      return next;
    });
  };

  const updateLineQty = (index, qty) => {
    setReturnLines((prev) => {
      const next = [...prev];
      const maxQty = next[index].sold_quantity;
      const validQty = Math.max(1, Math.min(Number(qty) || 1, maxQty));
      next[index].return_quantity = validQty;
      next[index].refund_amount = validQty * next[index].unit_price;
      return next;
    });
  };

  const toggleRestockable = (index) => {
    setReturnLines((prev) => {
      const next = [...prev];
      next[index].restockable = !next[index].restockable;
      return next;
    });
  };

  // Compute total refund
  const totalRefund = returnLines
    .filter((l) => l.selected)
    .reduce((sum, l) => sum + (Number(l.refund_amount) || 0), 0);

  const selectedCount = returnLines.filter((l) => l.selected).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSaleId) {
      toast.error("Please select a valid sale order");
      return;
    }

    const itemsToReturn = returnLines.filter((l) => l.selected);
    if (itemsToReturn.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    setSubmitting(true);
    try {
      const returnNumber = `RET-${Date.now().toString().slice(-6)}`;

      // 1. Create SalesReturn header
      const returnPayload = {
        return_number: returnNumber,
        sale_id: selectedSaleId,
        customer_id: selectedSale?.customer?.id || null,
        status,
        reason,
        total_refund_amount: totalRefund,
        notes: notes || "",
      };

      const res = await populateApi.create("sales_return", returnPayload);
      const createdReturn = res?.data || res;

      // 2. Create SalesReturnItem lines
      if (createdReturn?.id) {
        for (const item of itemsToReturn) {
          await populateApi.create("sales_return_item", {
            sales_return_id: createdReturn.id,
            sale_item_id: item.sale_item_id,
            quantity: item.return_quantity,
            refund_amount: item.refund_amount,
            restockable: item.restockable,
            notes: item.restockable ? "Eligible for restock" : "Damaged / Write-off",
          });
        }
      }

      toast.success(`Return request ${returnNumber} submitted successfully!`);
      navigate("/returns/index");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to submit return request");
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
            to="/returns/index"
            className="p-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Initiate Return (RMA)</h1>
            <p className="text-xs text-text-muted">Create a return request against an original customer sale order</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {submitting ? "Submitting..." : "Submit Return Request"}
        </button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Selected Sale: <strong className="text-primary font-medium">{selectedSale?.sale_number || "—"}</strong></span>
        <span>•</span>
        <span>Items to Return: <strong className="text-text-primary font-medium">{formatQty(selectedCount)}</strong></span>
        <span>•</span>
        <span>Original Total: <strong className="text-text-primary font-medium">{formatCurrency(selectedSale?.total_amount)}</strong></span>
        <span>•</span>
        <span>Estimated Refund: <strong className="text-rose-400 font-semibold">{formatCurrency(totalRefund)}</strong></span>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Select Sale & Pick Items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Sale Picker Card */}
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4 text-primary" />
              Reference Sale Order
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-muted mb-1">
                Select Completed Sale Order
              </label>
              <select
                value={selectedSaleId}
                onChange={handleSaleSelectChange}
                className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary/50"
              >
                <option value="">-- Choose Sale Order --</option>
                {salesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.sale_number} - {s.customer_name || "Guest"} (₹{s.total_amount}) -{" "}
                    {s.sold_at ? new Date(s.sold_at).toLocaleDateString() : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Selector Card */}
          {selectedSale && (
            <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
                  <Package className="w-4 h-4 text-primary" />
                  Select Items for Return
                </div>
                <span className="text-[11px] text-text-muted">
                  Check items and specify quantity
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-text-muted font-medium">
                      <th className="pb-2 w-[8%] text-center">Return?</th>
                      <th className="pb-2 w-[40%]">Item / SKU</th>
                      <th className="pb-2 text-center w-[12%]">Sold</th>
                      <th className="pb-2 text-center w-[15%]">Return Qty</th>
                      <th className="pb-2 text-right w-[15%]">Refund Amount</th>
                      <th className="pb-2 text-center w-[10%]">Restock?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-text-primary">
                    {returnLines.map((line, idx) => (
                      <tr key={idx} className={line.selected ? "bg-white/[0.02]" : "opacity-50"}>
                        <td className="py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={line.selected}
                            onChange={() => toggleLineSelect(idx)}
                            className="rounded accent-primary"
                          />
                        </td>
                        <td className="py-2.5">
                          <div className="font-medium">{line.product_name}</div>
                          <div className="text-[11px] font-mono text-text-muted">{line.sku}</div>
                        </td>
                        <td className="py-2.5 text-center text-text-muted">
                          {formatQty(line.sold_quantity)}
                        </td>
                        <td className="py-2.5 text-center">
                          <input
                            type="number"
                            min="1"
                            max={line.sold_quantity}
                            value={line.return_quantity}
                            onChange={(e) => updateLineQty(idx, e.target.value)}
                            disabled={!line.selected}
                            className="w-16 px-2 py-1 bg-surface-card border border-border/60 rounded text-center text-xs focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 text-right font-medium text-rose-400">
                          {line.selected ? formatCurrency(line.refund_amount) : "—"}
                        </td>
                        <td className="py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={line.restockable}
                            onChange={() => toggleRestockable(idx)}
                            disabled={!line.selected}
                            title="Eligible for shelf restock"
                            className="rounded accent-emerald-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Return Details & Status */}
        <div className="space-y-5">
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <RotateCcw className="w-4 h-4 text-primary" />
              Return Specifications
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Return Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
                >
                  <option value="Defective or damaged in transit">Defective or damaged in transit</option>
                  <option value="Incorrect size or variant shipped">Incorrect size or variant shipped</option>
                  <option value="Customer changed mind / dissatisfied">Customer changed mind / dissatisfied</option>
                  <option value="Product not as described on storefront">Product not as described on storefront</option>
                  <option value="Counter exchange / size swap">Counter exchange / size swap</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
                >
                  <option value="requested">Requested (Under Review)</option>
                  <option value="approved">Approved (Issue RMA)</option>
                  <option value="received">Received (At Counter / Warehouse)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1">
                  Internal Staff Notes
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reasoning, customer notes, condition on return..."
                  className="w-full px-3 py-2 bg-surface-card border border-border/60 rounded-xl text-xs text-text-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Refund Total Summary */}
            <div className="pt-3 border-t border-border/60 space-y-2 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Selected Items:</span>
                <span>{formatQty(selectedCount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border/40">
                <span>Estimated Refund:</span>
                <span className="text-rose-400">{formatCurrency(totalRefund)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || selectedCount === 0}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? "Processing RMA..." : "Confirm & Create Return"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
