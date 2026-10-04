import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Calendar,
  AlertCircle,
  BellRing,
  ArrowRight
} from "lucide-react";

export default function TrackOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const trackingParam = searchParams.get("tracking") || "";

  const [inputCode, setInputCode] = useState(trackingParam);
  const [activeTracking, setActiveTracking] = useState(null);

  useEffect(() => {
    if (trackingParam) {
      handleSearchTracking(trackingParam);
    } else {
      // Default sample tracking
      handleSearchTracking("SO-20261003-8491");
    }
  }, [trackingParam]);

  const handleSearchTracking = (code) => {
    if (!code.trim()) return;

    setActiveTracking({
      order_number: code.trim(),
      carrier: "BlueDart Express Air",
      awb_number: `BLUEDART-${Math.floor(10000000 + Math.random() * 90000000)}`,
      current_status: "In Transit",
      estimated_delivery: "Tomorrow, Oct 4 by 6:00 PM IST",
      destination: "Bandra West, Mumbai - 400050",
      milestones: [
        { title: "Order Confirmed & Payment Captured", location: "Coimbatore Fulfillment Hub", time: "Oct 3, 10:15 AM", done: true },
        { title: "Packed & Serialized GS1 Barcode Affixed", location: "Coimbatore Warehouse Bay 4", time: "Oct 3, 01:30 PM", done: true },
        { title: "Dispatched & In Transit via Air Cargo", location: "Coimbatore Airport (CJB) -> Mumbai (BOM)", time: "Oct 3, 05:45 PM", done: true },
        { title: "Out for Doorstep Delivery", location: "Mumbai Hub to Destination", time: "Pending", done: false },
        { title: "Delivered & Verified", location: "Recipient Destination", time: "Pending", done: false },
      ],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ tracking: inputCode });
    handleSearchTracking(inputCode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Live Order Tracking</span>
          </h1>
          <p className="text-xs text-gray-400">
            Real-time logistics scans and milestone stepper via BlueDart Express & Delhivery Air
          </p>
        </div>

        <Link
          to={`/useful-additions/track-order/create?tracking=${encodeURIComponent(inputCode)}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
        >
          <BellRing className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Subscribe to Alerts</span>
        </Link>
      </div>

      {/* Tracking Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Enter Sale Order Number (e.g. SO-20261003-8491) or Carrier AWB..."
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          className="w-full pl-11 pr-28 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[var(--brand-primary)] font-mono"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
        <button
          type="submit"
          className="absolute right-2 top-2 px-4 py-1.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          Track Now
        </button>
      </form>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Tracking Target: <strong className="text-white">{activeTracking?.order_number || "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Carrier Partner: <strong className="text-[var(--brand-primary)]">{activeTracking?.carrier || "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Live State: <strong className="text-emerald-400">{activeTracking?.current_status || "—"}</strong>
        </span>
      </div>

      {activeTracking && (
        <div className="space-y-6">
          {/* Tracking Summary Card */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider block">
                  Carrier Air Consignment
                </span>
                <h3 className="text-sm font-mono font-bold text-white mt-0.5">
                  AWB: {activeTracking.awb_number}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Destination: <strong className="text-gray-200">{activeTracking.destination}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Expected Delivery
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {activeTracking.estimated_delivery}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Milestone Timeline */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-6">
            <h3 className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
              Transit Milestones
            </h3>

            <div className="space-y-6 pl-2">
              {activeTracking.milestones.map((m, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Vertical connector line */}
                  {idx < activeTracking.milestones.length - 1 && (
                    <div
                      className={`absolute left-2.5 top-6 bottom-0 w-0.5 -mb-6 ${
                        m.done ? "bg-emerald-500/40" : "bg-white/10"
                      }`}
                    />
                  )}

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      m.done
                        ? "bg-emerald-500 text-black shadow-xs shadow-emerald-500/50"
                        : "bg-white/10 text-gray-500"
                    }`}
                  >
                    {m.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                    )}
                  </div>

                  <div className="flex-1 -mt-0.5 space-y-0.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className={`font-bold ${m.done ? "text-white" : "text-gray-400"}`}>
                        {m.title}
                      </h4>
                      <span className="text-[11px] font-mono text-gray-500">{m.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{m.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
