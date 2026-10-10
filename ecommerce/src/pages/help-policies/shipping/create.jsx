import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Truck, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

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
        <Link to="/help-policies/shipping">
          <Button variant="outline" size="sm" icon={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token flex items-center gap-2">
            <Search className="w-5 h-5 text-brand-token" />
            <span>PIN Code Deliverability Lookup</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">Verify logistics coverage and transit duration for your location</p>
        </div>
      </div>

      <form onSubmit={handleCheck} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-5">
        <div>
          <label className="block text-xs font-semibold text-secondary-token mb-1.5">6-Digit PIN Code *</label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1">
              <Input
                required
                maxLength={6}
                placeholder="e.g. 400050, 110001, 560001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="font-mono text-center sm:text-left"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              loading={checking}
              icon={Search}
              className="sm:self-start py-2.5"
            >
              {checking ? "Checking..." : "Verify SLA"}
            </Button>
          </div>
        </div>

        {result && (
          <div className="p-4 sm:p-5 rounded-xl bg-brand-token/5 border border-brand-token/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>PIN {result.pincode} is 100% Serviceable!</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-surface-elevated/40 border border-token">
                <span className="text-muted-token block text-[10px] uppercase font-mono">Transit SLA</span>
                <span className="text-primary-token font-bold">{result.estimated_hours}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-elevated/40 border border-token">
                <span className="text-muted-token block text-[10px] uppercase font-mono">Courier Partner</span>
                <span className="text-primary-token font-bold">{result.courier}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-elevated/40 border border-token">
                <span className="text-muted-token block text-[10px] uppercase font-mono">Cash on Delivery</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Supported</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-elevated/40 border border-token">
                <span className="text-muted-token block text-[10px] uppercase font-mono">Logistics Gateway</span>
                <span className="text-primary-token font-bold">{result.hub}</span>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
