import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PackageCheck,
  Calendar,
  CreditCard,
  Truck,
  RotateCcw,
  Receipt,
  Eye,
  X,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Load from localStorage or baseline orders
    const lastOrder = JSON.parse(localStorage.getItem("last_confirmed_order") || "null");
    const sampleOrders = [
      {
        order_number: "SO-20260924-4192",
        placed_at: "2026-09-24T14:32:00Z",
        status: "Delivered",
        payment_status: "Paid",
        payment_method: "UPI",
        subtotal: 4850,
        total_amount: 4850,
        items: [
          { name: "Kashmir Pashmina Silk Jacquard Stole", sku: "PAS-STOLE-MRN-OS", quantity: 1, selling_price: 4850 },
        ],
      },
      {
        order_number: "SO-20260912-1084",
        placed_at: "2026-09-12T10:15:00Z",
        status: "Delivered",
        payment_status: "Paid",
        payment_method: "Credit Card",
        subtotal: 6999,
        total_amount: 6999,
        items: [
          { name: "Artisan Full-Grain Goodyear Derby", sku: "GY-DRB-BRN-42", quantity: 1, selling_price: 6999 },
        ],
      },
    ];

    if (lastOrder) {
      setOrders([lastOrder, ...sampleOrders]);
    } else {
      setOrders(sampleOrders);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Order History & Invoices</span>
          </h1>
          <p className="text-xs text-gray-400">
            Track status, inspect statutory GST invoices, and manage post-purchase returns
          </p>
        </div>

        <Link
          to="/customer-account/orders/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Request Return / RMA</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Total Orders: <strong className="text-white">{orders.length || "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Tax Invoices: <strong className="text-[var(--brand-primary)]">Downloadable PDF</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Dispatches: <strong className="text-emerald-400">Air Express</strong>
        </span>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((ord) => (
          <div
            key={ord.order_number}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
              <div>
                <span className="text-xs font-mono font-bold text-white">
                  {ord.order_number}
                </span>
                <span className="text-xs text-gray-500 ml-2 font-mono">
                  {new Date(ord.placed_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {ord.status || "Confirmed"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10">
                  {ord.payment_method?.toUpperCase() || "PAID"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {ord.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-gray-300">
                    {it.quantity} × <strong className="text-white">{it.name}</strong>
                    {it.sku && <span className="text-gray-500 font-mono ml-2">({it.sku})</span>}
                  </span>
                  <span className="font-mono text-white font-semibold">
                    ₹{((Number(it.selling_price) || 0) * it.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-white/[0.06] gap-3">
              <div>
                <span className="text-xs text-gray-500">Total Billed:</span>
                <span className="text-base font-extrabold text-[var(--brand-primary)] ml-2">
                  ₹{Number(ord.total_amount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrder(ord)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <Link
                  to={`/useful-additions/track-order?tracking=${ord.order_number}`}
                  className="px-3 py-1.5 rounded-xl bg-[rgba(0,210,210,0.1)] hover:bg-[var(--brand-primary)] text-[var(--brand-primary)] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Live Tracking</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-gray-900 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Order #{selectedOrder.order_number}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="divide-y divide-white/10">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <span className="text-gray-300">{it.quantity} × {it.name}</span>
                    <span className="font-mono text-white font-bold">
                      ₹{((Number(it.selling_price) || 0) * it.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                <span>Total Amount:</span>
                <span className="text-[var(--brand-primary)]">
                  ₹{Number(selectedOrder.total_amount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
