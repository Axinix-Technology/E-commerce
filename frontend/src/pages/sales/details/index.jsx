import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Printer,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  CreditCard,
  User,
  Package,
  Calendar,
  FileText
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

export default function SaleOrderDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const saleId = searchParams.get("id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    if (!saleId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await populateApi.read("sale", {
        filter: { id: saleId },
        populate: {
          customer: ["id", "name", "phone", "email", "address", "city"],
          items: ["id", "product_name", "sku", "quantity", "unit_price", "tax_rate", "discount_amount", "line_total"],
          transactions: ["id", "transaction_type", "amount", "payment_method", "reference_number", "transacted_at"],
        },
      });

      if (res?.data && res.data.length > 0) {
        setOrder(res.data[0]);
      } else {
        toast.error("Sale order not found");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [saleId]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
            Paid
          </span>
        );
      case "partially_paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">
            Partially Paid
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-purple-500/10 text-purple-400">
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400">
            Unpaid
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-text-muted">
        <ShoppingBag className="w-8 h-8 animate-bounce mx-auto mb-2 text-primary" />
        Loading sales order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-text-muted text-sm">Please select a valid sale order to view details.</p>
        <Link
          to="/sales/index"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  const itemsList = order.items || [];
  const transactionsList = order.transactions || [];
  const totalUnits = itemsList.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary tracking-tight">
                Order {order.sale_number}
              </h1>
              {getStatusBadge(order.status)}
              {getPaymentBadge(order.payment_status)}
            </div>
            <p className="text-xs text-text-muted">
              Sold on {order.sold_at ? new Date(order.sold_at).toLocaleString() : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/60 bg-surface-card hover:bg-surface-card/80 text-text-muted hover:text-text-primary text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <Link
            to={`/returns/create?sale_id=${order.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Initiate Return
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-card/60 border border-border/50 text-xs text-text-muted">
        <span>Line Items: <strong className="text-text-primary font-medium">{formatQty(itemsList.length)}</strong></span>
        <span>•</span>
        <span>Total Units: <strong className="text-text-primary font-medium">{formatQty(totalUnits)}</strong></span>
        <span>•</span>
        <span>Subtotal: <strong className="text-text-primary font-medium">{formatCurrency(order.subtotal)}</strong></span>
        <span>•</span>
        <span>Tax: <strong className="text-text-primary font-medium">{formatCurrency(order.tax_amount)}</strong></span>
        <span>•</span>
        <span>Grand Total: <strong className="text-emerald-400 font-semibold">{formatCurrency(order.total_amount)}</strong></span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Line Items & Transactions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Order Items Table Card */}
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <Package className="w-4 h-4 text-primary" />
              Purchased Items
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-text-muted font-medium">
                    <th className="pb-2">Item / SKU</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-center">GST %</th>
                    <th className="pb-2 text-right">Discount</th>
                    <th className="pb-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-text-primary">
                  {itemsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-text-muted">
                        No line items recorded for this order.
                      </td>
                    </tr>
                  ) : (
                    itemsList.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5">
                          <div className="font-medium text-text-primary">{item.product_name}</div>
                          <div className="text-[11px] font-mono text-text-muted">{item.sku}</div>
                        </td>
                        <td className="py-2.5 text-center font-medium">
                          {formatQty(item.quantity)}
                        </td>
                        <td className="py-2.5 text-right text-text-muted">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-2.5 text-center text-text-muted">
                          {Number(item.tax_rate) > 0 ? `${item.tax_rate}%` : "—"}
                        </td>
                        <td className="py-2.5 text-right text-text-muted">
                          {formatCurrency(item.discount_amount)}
                        </td>
                        <td className="py-2.5 text-right font-medium text-emerald-400">
                          {formatCurrency(item.line_total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Transactions Card */}
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-primary" />
              Settlement & Payment Vouchers
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-text-muted font-medium">
                    <th className="pb-2">Voucher # / Ref</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Transacted At</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-text-primary">
                  {transactionsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-text-muted">
                        No separate payment transactions recorded.
                      </td>
                    </tr>
                  ) : (
                    transactionsList.map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-2 font-mono text-text-muted">
                          {tx.reference_number || `TX-${tx.id}`}
                        </td>
                        <td className="py-2 capitalize font-medium">
                          <span
                            className={
                              tx.transaction_type === "refund"
                                ? "text-rose-400"
                                : "text-emerald-400"
                            }
                          >
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td className="py-2 capitalize text-text-muted">
                          {tx.payment_method?.replace("_", " ")}
                        </td>
                        <td className="py-2 text-text-muted">
                          {tx.transacted_at ? new Date(tx.transacted_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-2 text-right font-medium text-emerald-400">
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Invoice Summary */}
        <div className="space-y-5">
          {/* Customer Card */}
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <User className="w-4 h-4 text-primary" />
              Customer Snapshot
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-medium text-text-primary text-sm">
                {order.customer_name || order.customer?.name || "Walk-in Guest"}
              </div>
              {order.customer_phone && (
                <div className="text-text-muted">Phone: {order.customer_phone}</div>
              )}
              {order.customer_email && (
                <div className="text-text-muted">Email: {order.customer_email}</div>
              )}
              {(order.shipping_address || order.shipping_city) && (
                <div className="pt-2 border-t border-border/40 text-text-muted">
                  <div className="text-[11px] font-medium text-text-primary">Delivery Address:</div>
                  <div>{order.shipping_address}</div>
                  <div>{order.shipping_city} {order.shipping_pincode}</div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Summary Card */}
          <div className="p-4 rounded-2xl border border-border/60 bg-surface-card/60 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <FileText className="w-4 h-4 text-primary" />
              Order Calculation
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Tax (CGST + SGST):</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-text-muted">
                  <span>Discount:</span>
                  <span className="text-rose-400">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              {Number(order.shipping_fee) > 0 && (
                <div className="flex justify-between text-text-muted">
                  <span>Shipping Fee:</span>
                  <span>{formatCurrency(order.shipping_fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-text-primary pt-2 border-t border-border/40">
                <span>Total Amount:</span>
                <span className="text-emerald-400">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="pt-3 border-t border-border/40 text-[11px] text-text-muted">
                <span className="font-medium text-text-primary">Notes: </span>
                {order.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
