import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  Printer,
  RotateCcw,
  CreditCard,
  User,
  Package,
  Calendar,
  FileText,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Table, Badge } from "../../../components/ui";

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

      const list = Array.isArray(res) ? res : res?.data || [];
      if (list.length > 0) {
        setOrder(list[0]);
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

  const renderStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge variant="emerald" dot>Completed</Badge>;
      case "cancelled":
        return <Badge variant="rose" dot>Cancelled</Badge>;
      default:
        return <Badge variant="amber" dot>Draft</Badge>;
    }
  };

  const renderPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge variant="emerald">Paid</Badge>;
      case "partially_paid":
        return <Badge variant="blue">Partial</Badge>;
      default:
        return <Badge variant="amber">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-token text-xs">
        Loading sales order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-muted-token text-xs">Order could not be found or loaded.</p>
        <Link to="/sales/index">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Sales
          </Button>
        </Link>
      </div>
    );
  }

  const items = order.items || [];
  const transactions = order.transactions || [];

  const itemColumns = [
    {
      key: "product_name",
      header: "Item & Description",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val || "Item"}</span>
          <span className="text-[10px] text-brand-token font-mono">{row.sku || "—"}</span>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      align: "center",
      render: (val) => <span className="font-semibold">{formatQty(val)}</span>,
    },
    {
      key: "unit_price",
      header: "Unit Price",
      align: "right",
      render: (val) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: "tax_rate",
      header: "Tax %",
      align: "center",
      render: (val) => <span>{val ? `${val}%` : "—"}</span>,
    },
    {
      key: "discount_amount",
      header: "Discount",
      align: "right",
      render: (val) => (
        <span className="font-mono text-emerald-700 dark:text-emerald-400">
          {Number(val) > 0 ? `-${formatCurrency(val)}` : "—"}
        </span>
      ),
    },
    {
      key: "line_total",
      header: "Line Total",
      align: "right",
      render: (val) => (
        <span className="font-bold text-primary-token font-mono">
          {formatCurrency(val)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/sales/index"
            className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary-token tracking-tight">
                {order.sale_number || `SO-${order.id}`}
              </h1>
              {renderStatusBadge(order.status)}
              {renderPaymentBadge(order.payment_status)}
            </div>
            <p className="text-xs text-muted-token mt-0.5">
              Issued on {order.sold_at ? new Date(order.sold_at).toLocaleString() : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Invoice
          </Button>
          <Link to={`/returns/create?sale_id=${order.id}`}>
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
            >
              Issue Return
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Order Number: <strong className="text-primary-token font-mono font-medium">{order.sale_number}</strong></span>
        <span>•</span>
        <span>Items: <strong className="text-primary-token font-medium">{formatQty(items.length)}</strong></span>
        <span>•</span>
        <span>Subtotal: <strong className="text-primary-token font-medium">{formatCurrency(order.subtotal)}</strong></span>
        <span>•</span>
        <span>Tax: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatCurrency(order.tax_amount)}</strong></span>
        <span>•</span>
        <span>Grand Total: <strong className="text-brand-token font-semibold">{formatCurrency(order.total_amount)}</strong></span>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Details */}
        <div className="p-4 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-2 text-xs">
          <div className="font-bold text-primary-token uppercase text-[10px] flex items-center gap-1.5 text-muted-token">
            <User className="w-3.5 h-3.5 text-brand-token" />
            Customer & Delivery Info
          </div>
          <p className="font-semibold text-sm text-primary-token">
            {order.customer?.name || order.customer_name || "Walk-in Guest"}
          </p>
          <p className="text-secondary-token">Phone: {order.customer?.phone || order.customer_phone || "—"}</p>
          <p className="text-secondary-token">Email: {order.customer?.email || order.customer_email || "—"}</p>
          <p className="text-secondary-token">
            Address: {order.shipping_address ? `${order.shipping_address}, ${order.shipping_city || ""}` : "Counter POS Pickup"}
          </p>
        </div>

        {/* Payment Summary */}
        <div className="p-4 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-2 text-xs">
          <div className="font-bold text-primary-token uppercase text-[10px] flex items-center gap-1.5 text-muted-token">
            <CreditCard className="w-3.5 h-3.5 text-brand-token" />
            Payment & Settlement Breakdown
          </div>
          <div className="flex justify-between text-secondary-token">
            <span>Payment Method</span>
            <span className="capitalize font-semibold text-primary-token">{order.payment_method || "Cash"}</span>
          </div>
          <div className="flex justify-between text-secondary-token">
            <span>Subtotal</span>
            <span className="font-mono">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-secondary-token">
            <span>GST Tax</span>
            <span className="font-mono">{formatCurrency(order.tax_amount)}</span>
          </div>
          <div className="flex justify-between text-secondary-token">
            <span>Discount</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400">-{formatCurrency(order.discount_amount)}</span>
          </div>
          <div className="pt-2 border-t border-token flex justify-between font-bold text-sm text-primary-token">
            <span>Net Payable</span>
            <span className="font-mono text-base text-brand-token">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-1.5">
          <Package className="w-4 h-4 text-brand-token" />
          Ordered Products ({formatQty(items.length)})
        </h2>
        <Table
          columns={itemColumns}
          data={items}
          emptyMessage="No line items recorded for this order."
        />
      </div>

      {/* Transactions Table if any */}
      {transactions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-brand-token" />
            Transaction Receipts ({formatQty(transactions.length)})
          </h2>
          <div className="p-3 rounded-2xl border border-token bg-surface-elevated/40 glass-panel">
            <div className="divide-y divide-token text-xs">
              {transactions.map((t, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-primary-token">{t.reference_number || `TX-${t.id}`}</span>
                    <span className="text-[10px] text-muted-token">
                      {t.transacted_at ? new Date(t.transacted_at).toLocaleString() : "—"} • {t.payment_method}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
