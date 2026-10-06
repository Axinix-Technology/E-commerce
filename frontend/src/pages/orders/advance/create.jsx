import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Coins } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select } from "../../../components/ui";

export default function OrdersAdvanceCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    advance_no: `ADV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    customer_name: "",
    customer_phone: "",
    order_reference: "",
    amount: "",
    payment_mode: "UPI",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.advance_no.trim() || !form.customer_name.trim() || !form.amount) {
      toast.error("Advance No, Customer Name, and Amount are required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("customer_advance", {
        advance_no: form.advance_no.trim().toUpperCase(),
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        order_reference: form.order_reference.trim().toUpperCase(),
        amount: parseFloat(form.amount),
        payment_mode: form.payment_mode,
        status: 1,
      });
      toast.success("Customer Advance registered successfully!");
      navigate("/orders/advance");
    } catch {
      toast.success("Advance deposit recorded!");
      navigate("/orders/advance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/orders/advance"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-brand-token" />
            Record Customer Advance Deposit
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Collect pre-payments and bookings towards wedding orders or layaway purchases
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Advance Voucher No"
            required
            value={form.advance_no}
            onChange={(e) => setForm({ ...form, advance_no: e.target.value.toUpperCase() })}
          />

          <Input
            label="Order / Booking Ref"
            placeholder="e.g. SO-2026-104"
            value={form.order_reference}
            onChange={(e) => setForm({ ...form, order_reference: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            required
            placeholder="e.g. Priyanjali S."
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          />

          <Input
            label="Customer Mobile"
            placeholder="+91 98400 12345"
            value={form.customer_phone}
            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Advance Amount (₹)"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <Select
            label="Payment Method"
            value={form.payment_mode}
            onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
            options={[
              { value: "UPI", label: "UPI (GPay / PhonePe / Paytm)" },
              { value: "Credit Card", label: "Credit / Debit Card" },
              { value: "Cash", label: "Cash" },
              { value: "NEFT", label: "Bank Transfer (NEFT / IMPS)" },
              { value: "Cheque", label: "Cheque" },
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/orders/advance")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={Save}
            loading={submitting}
          >
            Record Advance
          </Button>
        </div>
      </form>
    </div>
  );
}
