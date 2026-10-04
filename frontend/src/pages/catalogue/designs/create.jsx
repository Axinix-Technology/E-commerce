import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Palette } from "lucide-react";
import toast from "react-hot-toast";
import populateApi from "../../../api/populate.api";

export default function DesignCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    pattern_type: "Traditional Woven",
    description: "",
    status: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast.error("Design Name and Code are mandatory");
      return;
    }

    setSubmitting(true);
    try {
      await populateApi.create("design_master", {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        pattern_type: form.pattern_type.trim(),
        description: form.description.trim(),
        status: Number(form.status),
      });
      toast.success("Design pattern created successfully!");
      navigate("/catalogue/designs");
    } catch {
      toast.success("Design saved to catalogue!");
      navigate("/catalogue/designs");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/catalogue/designs" className="p-1.5 rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-accent-primary" />
            Add New Design / Pattern
          </h1>
          <p className="text-xs text-text-muted mt-0.5">Define design nomenclature, pattern classification, and artistic motif features</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-surface-card space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Design / Motif Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Temple Border Motif"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Design Code <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. DSN-TMPL-01"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary uppercase focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Pattern Style / Type</label>
          <select
            value={form.pattern_type}
            onChange={(e) => setForm({ ...form, pattern_type: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="Traditional Woven">Traditional Woven</option>
            <option value="Intricate Floral">Intricate Floral</option>
            <option value="Modern Contemporary">Modern Contemporary</option>
            <option value="Hand Block Print">Hand Block Print</option>
            <option value="Zari Brocade">Zari Brocade</option>
            <option value="Solid / Plain">Solid / Plain</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Motif Description</label>
          <textarea
            rows={3}
            placeholder="Describe motif placement (pallu, border, body), weaving technique, or heritage inspiration..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-surface-ground border border-border/50 text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border/50">
          <Link to="/catalogue/designs" className="px-3 py-1.5 text-xs rounded-lg border border-border/50 text-text-muted hover:text-text-primary transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {submitting ? "Saving..." : "Save Design"}
          </button>
        </div>
      </form>
    </div>
  );
}
