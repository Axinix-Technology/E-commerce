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
} from "lucide-react";
import { Button, Input, Badge } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

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
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">
              Live Order Tracking
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Real-time logistics scans and milestone stepper via BlueDart Express & Delhivery Air
            </p>
          </div>
        </div>

        <Link to={`/useful-additions/track-order/create?tracking=${encodeURIComponent(inputCode)}`}>
          <Button variant="secondary" size="sm" icon={BellRing}>
            Subscribe to Alerts
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Tracking Target: <strong className="text-primary-token font-mono font-medium">{activeTracking?.order_number || "—"}</strong></span>
        <span>•</span>
        <span>Carrier Partner: <strong className="text-brand-token font-medium">{activeTracking?.carrier || "—"}</strong></span>
        <span>•</span>
        <span>Live State: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{activeTracking?.current_status || "—"}</strong></span>
      </div>

      {/* Tracking Search Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Enter Sale Order Number (e.g. SO-20261003-8491) or Carrier AWB..."
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          className="font-mono text-xs flex-1"
        />
        <Button type="submit" variant="primary" size="md" icon={Search}>
          Track Now
        </Button>
      </form>

      {activeTracking && (
        <div className="space-y-4">
          {/* Tracking Summary Card */}
          <div className="p-5 md:p-6 rounded-2xl bg-surface-elevated/40 border border-token space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-brand-token uppercase tracking-wider block">
                  Carrier Air Consignment
                </span>
                <h3 className="text-sm font-mono font-bold text-primary-token mt-0.5">
                  AWB: {activeTracking.awb_number}
                </h3>
                <p className="text-xs text-muted-token mt-1">
                  Destination: <strong className="text-secondary-token">{activeTracking.destination}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Expected Delivery
                </span>
                <span className="text-sm font-bold text-primary-token mt-0.5 block">
                  {activeTracking.estimated_delivery}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Milestone Timeline */}
          <div className="p-5 md:p-6 rounded-2xl bg-surface-elevated/40 border border-token space-y-6 shadow-xs">
            <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider">
              Transit Milestones
            </h3>

            <div className="space-y-6 pl-2">
              {activeTracking.milestones.map((m, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Vertical connector line */}
                  {idx < activeTracking.milestones.length - 1 && (
                    <div
                      className={`absolute left-2.5 top-6 bottom-0 w-0.5 -mb-6 ${
                        m.done ? "bg-emerald-500/40" : "bg-token"
                      }`}
                    />
                  )}

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      m.done
                        ? "bg-emerald-500 text-white shadow-xs"
                        : "bg-surface-elevated border border-token text-muted-token"
                    }`}
                  >
                    {m.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-token" />
                    )}
                  </div>

                  <div className="flex-1 -mt-0.5 space-y-0.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className={`font-bold ${m.done ? "text-primary-token" : "text-muted-token"}`}>
                        {m.title}
                      </h4>
                      <span className="text-[11px] font-mono text-muted-token">{m.time}</span>
                    </div>
                    <p className="text-[11px] text-secondary-token">{m.location}</p>
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
