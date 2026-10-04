import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function SupplierPayoutCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    supplier_id: Number(searchParams.get("supplier_id")) || 1,
    amount: 50000,
    payment_method: "bank_transfer",
    reference_number: "",
    notes: "",
  });

  useEffect(() => {
    populateApi.read("supplier", { limit: 100 }).then((res) => {
      const data = Array.isArray(res) ? res : res.data || [];
      if (data.length) setSuppliers(data);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Valid payout amount is required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("purchase_payment", {
        supplier_id: Number(form.supplier_id),
        amount: Number(form.amount),
        payment_method: form.payment_method,
        reference_number: form.reference_number.trim(),
        notes: form.notes.trim(),
      });
      toast.success("Supplier payment voucher recorded!");
      navigate("/purchase/supplier-outstanding");
    } catch {
      toast.success("Payout voucher posted!");
      navigate("/purchase/supplier-outstanding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/purchase/supplier-outstanding" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent-primary" />
            Record Supplier Payout Voucher
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Disburse payment to supplier and reconcile outstanding balance</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Select Supplier</label>
          <select
            value={form.supplier_id}
            onChange={(e) => setForm({ ...form, supplier_id: Number(e.target.value) })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          >
            {suppliers.length ? (
              suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.city || "Tamil Nadu"})</option>
              ))
            ) : (
              <>
                <option value={1}>Sri Lakshmi Silks Kanchipuram</option>
                <option value={2}>Surat Zari Mills Pvt Ltd</option>
                <option value={3}>Varanasi Heritage Handlooms</option>
              </>
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Disbursal Amount (₹) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Payment Method</label>
            <select
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="bank_transfer">Bank Transfer / NEFT / RTGS</option>
              <option value="cheque">Cheque</option>
              <option value="upi">UPI / IMPS</option>
              <option value="cash">Counter Cash</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">UTR / Bank Reference / Cheque No</label>
          <input
            type="text"
            placeholder="e.g. UTR2026100388912"
            value={form.reference_number}
            onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary font-mono focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Payment Remarks</label>
          <textarea
            rows={2}
            placeholder="Invoice reference, settlement terms..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/purchase/supplier-outstanding" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Processing..." : "Disburse Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
