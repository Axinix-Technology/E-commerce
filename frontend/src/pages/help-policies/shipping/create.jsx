import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Truck, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckPinCodePage() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setResult({
        pincode,
        hub: "West Zone Hub (Mumbai)",
        serviceable: true,
        estimated_hours: "24-48 Hours",
        courier: "BlueDart Express Air",
        cod_available: true,
      });
      toast.success(`PIN ${pincode} is serviceable with Express Air Delivery!`);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/help-policies/shipping"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>PIN Code Deliverability Lookup</span>
          </h1>
          <p className="text-xs text-gray-400">Verify logistics coverage and transit duration for your location</p>
        </div>
      </div>

      <form onSubmit={handleCheck} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">6-Digit PIN Code *</label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 400050, 110001, 560001"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono"
            />
            <button
              type="submit"
              disabled={checking}
              className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{checking ? "Checking..." : "Verify SLA"}</span>
            </button>
          </div>
        </div>

        {result && (
          <div className="p-4 rounded-xl bg-[rgba(0,210,210,0.08)] border border-[rgba(0,210,210,0.25)] space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>PIN {result.pincode} is 100% Serviceable!</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Transit SLA</span>
                <span className="text-white font-bold">{result.estimated_hours}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Courier Partner</span>
                <span className="text-white font-bold">{result.courier}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Cash on Delivery</span>
                <span className="text-emerald-400 font-bold">Supported</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Logistics Gateway</span>
                <span className="text-white font-bold">{result.hub}</span>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
