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
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button, Badge, FilterBar, Select } from "../../../components/ui";
import { formatQty, formatCurrency } from "../../../utils/formatters";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.order_number || "").toLowerCase().includes(search.toLowerCase()) ||
      o.items?.some((it) => (it.name || "").toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary-token flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-brand-token" />
            <span>Order History & Invoices</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Track status, inspect statutory GST invoices, and manage post-purchase returns
          </p>
        </div>

        <Link to="/customer-account/orders/create" className="self-start sm:self-auto">
          <Button variant="outline" size="sm" icon={RotateCcw}>
            Request Return / RMA
          </Button>
        </Link>
      </div>

      {/* Minimalist Metrics Bar (UI Rule 2 & UI Rule 1) */}
      <div className="glass-panel py-2 px-3.5 rounded-xl border border-token text-xs font-mono flex flex-wrap items-center gap-2.5 sm:gap-3 text-secondary-token">
        <span>
          Total Orders: <strong className="text-primary-token font-medium">{formatQty(filteredOrders.length)}</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Tax Invoices: <strong className="text-brand-token font-medium">Downloadable PDF</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Dispatches: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Air Express</strong>
        </span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by order # or item name..."
        onReset={handleResetFilters}
        filters={
          <Select
            size="xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Order Statuses" },
              { value: "Delivered", label: "Delivered" },
              { value: "Confirmed", label: "Confirmed" },
              { value: "Processing", label: "Processing" },
            ]}
          />
        }
      />

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface-elevated/40 border border-token text-muted-token text-xs">
            No orders found matching the filter criteria.
          </div>
        ) : (
          filteredOrders.map((ord) => (
          <div
            key={ord.order_number}
            className="card-surface p-4 sm:p-5 rounded-2xl border border-token hover:border-brand-token/30 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-token">
              <div>
                <span className="text-xs font-mono font-bold text-primary-token">
                  {ord.order_number}
                </span>
                <span className="text-xs text-muted-token ml-2 font-mono">
                  {new Date(ord.placed_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="emerald" size="xs">
                  {ord.status || "Confirmed"}
                </Badge>
                <Badge variant="neutral" size="xs">
                  {ord.payment_method?.toUpperCase() || "PAID"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              {ord.items?.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-secondary-token">
                    {formatQty(it.quantity)} × <strong className="text-primary-token">{it.name}</strong>
                    {it.sku && <span className="text-muted-token font-mono ml-2">({it.sku})</span>}
                  </span>
                  <span className="font-mono text-primary-token font-semibold">
                    {formatCurrency((Number(it.selling_price) || 0) * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-token gap-3">
              <div>
                <span className="text-xs text-muted-token">Total Billed:</span>
                <span className="text-base font-extrabold text-brand-token ml-2">
                  {formatCurrency(ord.total_amount)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  icon={Eye}
                  onClick={() => setSelectedOrder(ord)}
                >
                  View Details
                </Button>
                <Link to={`/useful-additions/track-order?tracking=${ord.order_number}`}>
                  <Button
                    variant="secondary"
                    size="xs"
                    icon={Truck}
                  >
                    Live Tracking
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )))}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl card-surface border border-token p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-token">
              <h3 className="text-sm font-bold text-primary-token">Order #{selectedOrder.order_number}</h3>
              <Button
                variant="ghost"
                size="xs"
                icon={X}
                onClick={() => setSelectedOrder(null)}
              />
            </div>

            <div className="space-y-3 text-xs">
              <div className="divide-y divide-token">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between">
                    <span className="text-secondary-token">{formatQty(it.quantity)} × {it.name}</span>
                    <span className="font-mono text-primary-token font-bold">
                      {formatCurrency((Number(it.selling_price) || 0) * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-token flex justify-between text-sm font-bold text-primary-token">
                <span>Total Amount:</span>
                <span className="text-brand-token">
                  {formatCurrency(selectedOrder.total_amount)}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setSelectedOrder(null)}
              className="mt-2"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
