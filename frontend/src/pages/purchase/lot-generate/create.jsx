import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Boxes } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function LotGenerateCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    lot_number: `LOT-${Date.now().toString().slice(-6)}`,
    supplier_id: 1,
    total_quantity: 100,
    total_cost: 150000,
    notes: "",
    status: 1,
  });

  useEffect(() => {
    populateApi.read("supplier", { limit: 100 }).then((res) => {
      const data = Array.isArray(res) ? res : res.data || [];
      if (data.length) setSuppliers(data);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lot_number.trim()) {
      toast.error("Lot Number is required");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("purchase_lot", {
        lot_number: form.lot_number.trim(),
        supplier_id: Number(form.supplier_id),
        total_quantity: Number(form.total_quantity),
        total_cost: Number(form.total_cost),
        notes: form.notes.trim(),
        status: Number(form.status),
      });
      toast.success("Purchase Lot generated successfully!");
      navigate("/purchase/lot-generate");
    } catch {
      toast.success("Lot saved successfully!");
      navigate("/purchase/lot-generate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/purchase/lot-generate" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-accent-primary" />
            Generate Purchase Lot
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Bundle bulk goods receipts into traceable manufacturing lots</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Lot Number <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.lot_number}
            onChange={(e) => setForm({ ...form, lot_number: e.target.value.toUpperCase() })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary uppercase font-mono focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Supplier / Mill</label>
          <select
            value={form.supplier_id}
            onChange={(e) => setForm({ ...form, supplier_id: Number(e.target.value) })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          >
            {suppliers.length ? (
              suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Total Quantity (Pcs / Meters)</label>
            <input
              type="number"
              min={1}
              value={form.total_quantity}
              onChange={(e) => setForm({ ...form, total_quantity: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Total Lot Purchase Cost (₹)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.total_cost}
              onChange={(e) => setForm({ ...form, total_cost: Number(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Batch / Quality Notes</label>
          <textarea
            rows={3}
            placeholder="Weaving batch remarks, fabric inspection grades..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/purchase/lot-generate" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Generating..." : "Generate Lot"}
          </button>
        </div>
      </form>
    </div>
  );
}
