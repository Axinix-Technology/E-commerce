import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  RotateCcw,
  ArrowLeft,
  Save,
  Package,
  User,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Input, Select, Textarea, Checkbox, Badge } from "../../../components/ui";

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
        const list = Array.isArray(res) ? res : res?.data || [];
        setSalesList(list);
        if (prefillSaleId) {
          const found = list.find((s) => String(s.id) === String(prefillSaleId));
          if (found) selectSale(found);
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

  const updateLine = (index, field, value) => {
    setReturnLines((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };

      if (field === "return_quantity") {
        const qty = Math.max(1, Math.min(Number(value) || 1, next[index].sold_quantity));
        next[index].return_quantity = qty;
        next[index].refund_amount = qty * next[index].unit_price;
      }

      return next;
    });
  };

  const selectedLines = returnLines.filter((l) => l.selected);
  const totalRefund = selectedLines.reduce((sum, l) => sum + (Number(l.refund_amount) || 0), 0);
  const totalReturnUnits = selectedLines.reduce((sum, l) => sum + (Number(l.return_quantity) || 0), 0);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!selectedSaleId) {
      toast.error("Please select a valid sale order");
      return;
    }

    if (selectedLines.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    setSubmitting(true);
    try {
      const rmaNumber = `RMA-${Date.now().toString().slice(-6)}`;
      const now = new Date().toISOString();

      const payload = {
        return_number: rmaNumber,
        sale_id: selectedSaleId,
        customer_id: selectedSale?.customer_id || null,
        status,
        reason,
        total_refund_amount: totalRefund,
        notes,
        requested_at: now,
      };

      const res = await populateApi.create("sales_return", payload);
      const createdReturn = res?.data || res;

      if (createdReturn?.id) {
        for (const line of selectedLines) {
          await populateApi.create("sales_return_item", {
            return_id: createdReturn.id,
            sale_item_id: line.sale_item_id,
            quantity: line.return_quantity,
            refund_amount: line.refund_amount,
            condition: "good",
            restocked: line.restockable,
          });
        }
      }

      toast.success(`Return request ${rmaNumber} created successfully!`);
      navigate("/returns/index");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to record return request");
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
            to="/returns/index"
            className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-brand-token" />
              Issue Return & RMA
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Initiate customer product returns, item inspection, and refund processing
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
          Submit RMA
        </Button>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Selected Order: <strong className="text-primary-token font-mono font-medium">{selectedSale ? selectedSale.sale_number : "—"}</strong></span>
        <span>•</span>
        <span>Return Units: <strong className="text-primary-token font-medium">{formatQty(totalReturnUnits)}</strong></span>
        <span>•</span>
        <span>Calculated Refund: <strong className="text-rose-700 dark:text-rose-400 font-semibold">{formatCurrency(totalRefund)}</strong></span>
        <span>•</span>
        <span>RMA Status: <strong className="text-brand-token capitalize font-medium">{status}</strong></span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Sale & Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sale Picker */}
          <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4 text-brand-token" />
              Select Sale Order
            </div>

            <Select
              label="Associated Invoice"
              value={selectedSaleId}
              onChange={handleSaleSelectChange}
              placeholder="-- Select a Sale Order to Return Items --"
              options={salesList.map((s) => ({
                value: s.id,
                label: `${s.sale_number} - ${s.customer?.name || s.customer_name || "Guest"} (₹${s.total_amount || 0})`,
              }))}
            />

            {selectedSale && (
              <div className="p-3 rounded-xl bg-surface-elevated border border-token grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-token text-[10px] block">Customer</span>
                  <span className="font-semibold text-primary-token">{selectedSale.customer?.name || selectedSale.customer_name || "Walk-in Guest"}</span>
                </div>
                <div>
                  <span className="text-muted-token text-[10px] block">Phone</span>
                  <span className="font-semibold text-primary-token">{selectedSale.customer?.phone || selectedSale.customer_phone || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-token text-[10px] block">Order Amount</span>
                  <span className="font-semibold font-mono text-primary-token">{formatCurrency(selectedSale.total_amount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Return Line Items */}
          {selectedSale && (
            <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
                  <Package className="w-4 h-4 text-brand-token" />
                  Select Items for RMA
                </div>
                <span className="text-xs text-muted-token">
                  {selectedLines.length} of {returnLines.length} items selected
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-token text-muted-token font-semibold uppercase text-[10px]">
                      <th className="pb-2 w-[8%] text-center">Return</th>
                      <th className="pb-2 w-[40%]">Item & SKU</th>
                      <th className="pb-2 w-[12%] text-center">Sold Qty</th>
                      <th className="pb-2 w-[15%]">Return Qty</th>
                      <th className="pb-2 w-[15%] text-right">Refund (₹)</th>
                      <th className="pb-2 w-[10%] text-center">Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-token">
                    {returnLines.map((line, idx) => (
                      <tr key={idx} className={line.selected ? "bg-surface-elevated/30" : "opacity-60"}>
                        <td className="py-2.5 text-center">
                          <Checkbox
                            checked={line.selected}
                            onChange={(e) => updateLine(idx, "selected", e.target.checked)}
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <span className="font-semibold text-primary-token block">{line.product_name}</span>
                          <span className="text-[10px] text-brand-token font-mono">{line.sku}</span>
                        </td>
                        <td className="py-2.5 text-center font-semibold">
                          {formatQty(line.sold_quantity)}
                        </td>
                        <td className="py-2.5 pr-2">
                          <Input
                            size="xs"
                            type="number"
                            min="1"
                            max={line.sold_quantity}
                            value={line.return_quantity}
                            disabled={!line.selected}
                            onChange={(e) => updateLine(idx, "return_quantity", e.target.value)}
                          />
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-rose-700 dark:text-rose-400">
                          {formatCurrency(line.refund_amount)}
                        </td>
                        <td className="py-2.5 text-center">
                          <Checkbox
                            checked={line.restockable}
                            disabled={!line.selected}
                            onChange={(e) => updateLine(idx, "restockable", e.target.checked)}
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

        {/* Right Column: Reason & Summary */}
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
              <RotateCcw className="w-4 h-4 text-brand-token" />
              RMA Details
            </div>

            <Select
              label="Return Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={[
                { label: "Defective or damaged in transit", value: "Defective or damaged in transit" },
                { label: "Wrong size or fit issue", value: "Wrong size or fit issue" },
                { label: "Customer changed mind", value: "Customer changed mind" },
                { label: "Incorrect item delivered", value: "Incorrect item delivered" },
                { label: "Quality unsatisfactory", value: "Quality unsatisfactory" },
              ]}
            />

            <Select
              label="Initial Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { label: "Requested / Pending Review", value: "requested" },
                { label: "Approved Immediately", value: "approved" },
                { label: "Completed & Refunded", value: "completed" },
              ]}
            />

            <Textarea
              label="Inspector / Customer Notes"
              placeholder="State any observations or defects found..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="pt-3 border-t border-token space-y-2 text-xs">
              <div className="flex justify-between text-secondary-token">
                <span>Selected Items</span>
                <span className="font-semibold text-primary-token">{formatQty(selectedLines.length)}</span>
              </div>
              <div className="flex justify-between text-secondary-token">
                <span>Total Return Units</span>
                <span className="font-semibold text-primary-token">{formatQty(totalReturnUnits)}</span>
              </div>
              <div className="pt-2 border-t border-token flex justify-between font-bold text-sm text-primary-token">
                <span>Total Refund Amount</span>
                <span className="font-mono text-base text-rose-700 dark:text-rose-400">{formatCurrency(totalRefund)}</span>
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
              Submit Return Authorization
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
