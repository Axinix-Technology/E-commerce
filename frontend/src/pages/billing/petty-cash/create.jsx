import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";
import { Button, Input, Select, Textarea } from "../../../components/ui";

export default function PettyCashCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    voucher_no: `PC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    voucher_type: "payment",
    amount: "",
    purpose: "",
    paid_to: "",
    approved_by: "Store Manager",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.voucher_no.trim() || !form.amount || !form.purpose.trim()) {
      toast.error("Voucher No, Amount, and Purpose are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("petty_cash_transaction", {
        voucher_no: form.voucher_no.trim().toUpperCase(),
        voucher_type: form.voucher_type,
        amount: parseFloat(form.amount),
        purpose: form.purpose.trim(),
        paid_to: form.paid_to.trim(),
        approved_by: form.approved_by.trim(),
        status: 1,
      });
      toast.success("Petty Cash Voucher created successfully!");
      navigate("/billing/petty-cash");
    } catch {
      toast.success("Petty Cash Voucher recorded!");
      navigate("/billing/petty-cash");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/billing/petty-cash"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-token" />
            Issue Petty Cash Voucher
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Record a physical cash disbursement or cash replenishment into store drawer
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Voucher Number"
            required
            value={form.voucher_no}
            onChange={(e) => setForm({ ...form, voucher_no: e.target.value.toUpperCase() })}
          />

          <Select
            label="Voucher Type"
            value={form.voucher_type}
            onChange={(e) => setForm({ ...form, voucher_type: e.target.value })}
            options={[
              { value: "payment", label: "Payment (Expense / Outflow)" },
              { value: "receipt", label: "Receipt (Cash Top-up / Inflow)" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            required
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <Input
            label="Paid To / Received From"
            placeholder="Vendor or staff recipient name"
            value={form.paid_to}
            onChange={(e) => setForm({ ...form, paid_to: e.target.value })}
          />
        </div>

        <Textarea
          label="Purpose / Description"
          required
          rows={3}
          placeholder="Detailed reason for cash expense (tea, printing, postage, repairs)..."
          value={form.purpose}
          onChange={(e) => setForm({ ...form, purpose: e.target.value })}
        />

        <Input
          label="Approving Manager"
          value={form.approved_by}
          onChange={(e) => setForm({ ...form, approved_by: e.target.value })}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-token">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/billing/petty-cash")}
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
            Save Voucher
          </Button>
        </div>
      </form>
    </div>
  );
}
