import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Printer,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Package,
  Calendar,
  Truck
} from "lucide-react";

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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Success Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#07241d] to-[#0c1820] border border-emerald-500/30 text-center space-y-3 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Payment Confirmed & Order Placed</h1>
        <p className="text-xs text-gray-300 max-w-md mx-auto">
          Thank you for choosing Axinix. Your statutory GST Tax Invoice and tracking AWB have been generated.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300 font-bold">
          <span>Order No:</span>
          <span>{order.order_number}</span>
        </div>
      </div>

      {/* Printable Statutory Invoice Receipt */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6" id="printable-receipt">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-white/[0.08] gap-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tax Invoice & Delivery Receipt</h2>
            <p className="text-xs text-gray-400 mt-0.5">Place of Supply: Inter-State GST Applicable</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <Link
              to={`/useful-additions/track-order?tracking=${order.order_number}`}
              className="px-3 py-1.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Dispatch</span>
            </Link>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
              Delivery Destination
            </span>
            <p className="font-bold text-white">{order.customer?.name}</p>
            <p className="text-gray-300">{order.customer?.shipping_address}</p>
            <p className="text-gray-400">{order.customer?.city} - {order.customer?.pincode}</p>
            <p className="text-gray-400 font-mono">Ph: {order.customer?.phone}</p>
          </div>

          <div>
            <span className="text-gray-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
              Billing & Transaction Details
            </span>
            <p className="text-gray-300">Payment: <strong className="text-white uppercase">{order.payment_method}</strong></p>
            <p className="text-gray-300">Status: <strong className="text-emerald-400">Captured / Cleared</strong></p>
            <p className="text-gray-300">Carrier: <strong className="text-white">BlueDart Express Air</strong></p>
          </div>
        </div>

        {/* Item Breakdown Table */}
        <div className="space-y-2">
          <span className="text-gray-500 block font-semibold uppercase tracking-wider text-[10px]">
            Line Items ({order.items?.length || 0})
          </span>
          <div className="divide-y divide-white/[0.06]">
            {order.items?.map((it, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-white">{it.name}</h4>
                  <span className="text-gray-400 font-mono text-[10px]">
                    SKU: {it.sku} • Qty: {it.quantity}
                  </span>
                </div>
                <span className="font-mono text-white font-bold">
                  ₹{((Number(it.selling_price) || 0) * it.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="pt-4 border-t border-white/[0.08] flex justify-between items-baseline">
          <span className="text-xs text-gray-400">Total Charged (Incl. GST)</span>
          <span className="text-xl font-extrabold text-[var(--brand-primary)]">
            ₹{order.total_amount?.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link
          to="/shopping/products"
          className="inline-flex items-center gap-2 text-xs text-[var(--brand-primary)] hover:underline font-semibold"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
