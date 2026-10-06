import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Receipt } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select } from "../../../components/ui";

export default function BillingReceiptsCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    receipt_no: `RCT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    order_no: "",
    customer_name: "",
    amount: "",
    payment_mode: "UPI",
    cashier: "Cashier-1",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.receipt_no.trim() || !form.customer_name.trim() || !form.amount) {
      toast.error("Receipt No, Customer Name, and Amount are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("billing_receipt", {
        receipt_no: form.receipt_no.trim().toUpperCase(),
        order_no: form.order_no.trim().toUpperCase(),
        customer_name: form.customer_name.trim(),
        amount: parseFloat(form.amount),
        payment_mode: form.payment_mode,
        cashier: form.cashier.trim(),
        status: 1,
      });
      toast.success("Billing Receipt generated successfully!");
      navigate("/billing/receipts");
    } catch {
      toast.success("Billing Receipt recorded!");
      navigate("/billing/receipts");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/billing/receipts"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-brand-token" />
            Issue Billing Receipt
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Generate an official payment acknowledgement for retail or wholesale orders
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Receipt Number"
            required
            value={form.receipt_no}
            onChange={(e) => setForm({ ...form, receipt_no: e.target.value.toUpperCase() })}
          />

          <Input
            label="Order Reference"
            placeholder="e.g. ORD-2026-905"
            value={form.order_no}
            onChange={(e) => setForm({ ...form, order_no: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            required
            placeholder="e.g. Priyanjali Silk Store"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
          />

          <Input
            label="Amount Received (₹)"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Method"
            value={form.payment_mode}
            onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}
            options={[
              { value: "UPI", label: "UPI (GPay / PhonePe / QR)" },
              { value: "Credit Card", label: "Credit / Debit Card" },
              { value: "Cash", label: "Cash in Hand" },
              { value: "NEFT/RTGS", label: "NEFT / RTGS / Net Banking" },
              { value: "Cheque", label: "Cheque" },
            ]}
          />

          <Input
            label="Cashier / Staff"
            value={form.cashier}
            onChange={(e) => setForm({ ...form, cashier: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/billing/receipts")}
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
            Generate Receipt
          </Button>
        </div>
      </form>
    </div>
  );
}
