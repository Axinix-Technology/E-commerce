import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Save, Building2, Home } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function CreateAddressPage() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "Home",
    recipient_name: "",
    phone: "",
    address_line: "",
    city: "",
    state_id: "",
    pincode: "",
    is_default: false,
  });

  useEffect(() => {
    populateApi.read("state_master", { limit: 50, sort: ["name"] })
      .then((res) => {
        if (res?.data) {
          setStates(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, state_id: String(res.data[0].id) }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.recipient_name || !formData.phone || !formData.address_line) {
      toast.error("Please fill in recipient name, phone, and street address");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("New delivery address added successfully!");
      navigate("/customer-account/addresses");
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/customer-account/addresses"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Add Delivery Address</span>
          </h1>
          <p className="text-xs text-gray-400">Save new shipping destination for faster checkout</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div className="space-y-4">
          <div className="flex gap-3">
            {["Home", "Commercial Office", "Warehouse"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, title: t })}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  formData.title === t
                    ? "bg-[rgba(0,210,210,0.15)] border-[var(--brand-primary)] text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Recipient Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Mercer"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Flat / Building / Street Address *</label>
            <textarea
              rows={2}
              required
              placeholder="Flat 402, Highline Residency..."
              value={formData.address_line}
              onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">City *</label>
              <input
                type="text"
                required
                placeholder="Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">State *</label>
              <select
                required
                value={formData.state_id}
                onChange={(e) => setFormData({ ...formData, state_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              >
                {states.map((s) => (
                  <option key={s.id} value={s.id} className="bg-gray-900 text-white">
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">PIN Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="400050"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-300 pt-2 border-t border-white/[0.08]">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 rounded text-[var(--brand-primary)] focus:ring-0"
            />
            <span>Set as my primary delivery address</span>
          </label>
        </div>

        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
          <Link
            to="/customer-account/addresses"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : "Save Address"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
