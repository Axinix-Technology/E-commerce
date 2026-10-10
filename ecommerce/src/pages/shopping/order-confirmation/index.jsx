import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Package,
  Truck,
} from "lucide-react";
import { Button, Badge } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const orderNumberParam = searchParams.get("order");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("last_confirmed_order") || "null");
    if (stored) {
      setOrder(stored);
    } else {
      // Fallback display
      setOrder({
        order_number: orderNumberParam || "SO-20261003-8491",
        placed_at: new Date().toISOString(),
        customer: {
          name: "Alex Mercer",
          phone: "+91 9876543210",
          shipping_address: "Flat 402, Highline Residency, Bandra West, Mumbai",
          city: "Mumbai",
          pincode: "400050",
        },
        items: [
          { name: "Heritage Linen Oxford Button-Down", sku: "HL-OXF-WHT-M", quantity: 1, selling_price: 2499 },
        ],
        subtotal: 2499,
        total_amount: 2499,
        payment_method: "upi",
      });
    }
  }, [orderNumberParam]);

  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-12">
      {/* Success Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-surface-elevated/40 border border-token text-center space-y-3 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-primary-token">Payment Confirmed & Order Placed</h1>
        <p className="text-xs text-muted-token max-w-md mx-auto">
          Thank you for choosing Axinix. Your statutory GST Tax Invoice and tracking AWB have been generated.
        </p>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
          <span>Order No:</span>
          <span>{order.order_number}</span>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Order Number: <strong className="text-primary-token font-mono font-medium">{order.order_number}</strong></span>
        <span>•</span>
        <span>Total Paid: <strong className="text-brand-token font-medium">{order.total_amount > 0 ? `₹${Number(order.total_amount).toLocaleString("en-IN")}` : "—"}</strong></span>
        <span>•</span>
        <span>Payment Method: <strong className="text-primary-token uppercase font-medium">{order.payment_method}</strong></span>
        <span>•</span>
        <span>Status: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Captured / Cleared</strong></span>
      </div>

      {/* Printable Statutory Invoice Receipt */}
      <div className="p-5 md:p-6 rounded-2xl bg-surface-elevated/40 border border-token space-y-6 shadow-xs" id="printable-receipt">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-token gap-4">
          <div>
            <h2 className="text-sm font-bold text-primary-token uppercase tracking-wider">Tax Invoice & Delivery Receipt</h2>
            <p className="text-xs text-muted-token mt-0.5">Place of Supply: Inter-State GST Applicable</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Invoice
            </Button>
            <Link to={`/useful-additions/track-order?tracking=${order.order_number}`}>
              <Button variant="primary" size="sm" icon={Truck}>
                Track Dispatch
              </Button>
            </Link>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-token block mb-1 font-semibold uppercase tracking-wider text-[10px]">
              Delivery Destination
            </span>
            <p className="font-bold text-primary-token">{order.customer?.name}</p>
            <p className="text-secondary-token">{order.customer?.shipping_address}</p>
            <p className="text-muted-token">{order.customer?.city} - {order.customer?.pincode}</p>
            <p className="text-muted-token font-mono">Ph: {order.customer?.phone}</p>
          </div>

          <div>
            <span className="text-muted-token block mb-1 font-semibold uppercase tracking-wider text-[10px]">
              Billing & Transaction Details
            </span>
            <p className="text-secondary-token">Payment: <strong className="text-primary-token uppercase">{order.payment_method}</strong></p>
            <p className="text-secondary-token">Status: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Captured / Cleared</strong></p>
            <p className="text-secondary-token">Carrier: <strong className="text-primary-token">BlueDart Express Air</strong></p>
          </div>
        </div>

        {/* Item Breakdown Table */}
        <div className="space-y-2">
          <span className="text-muted-token block font-semibold uppercase tracking-wider text-[10px]">
            Line Items ({formatQty(order.items?.length)})
          </span>
          <div className="divide-y divide-token">
            {order.items?.map((it, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-primary-token">{it.name}</h4>
                  <span className="text-muted-token font-mono text-[10px]">
                    SKU: {it.sku} • Qty: {it.quantity}
                  </span>
                </div>
                <span className="font-mono text-primary-token font-bold">
                  ₹{((Number(it.selling_price) || 0) * it.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="pt-4 border-t border-token flex justify-between items-baseline">
          <span className="text-xs text-muted-token">Total Charged (Incl. GST)</span>
          <span className="text-xl font-extrabold text-brand-token">
            ₹{order.total_amount ? Number(order.total_amount).toLocaleString("en-IN") : "—"}
          </span>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link to="/shopping/products">
          <Button variant="secondary" size="sm" icon={ShoppingBag}>
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
