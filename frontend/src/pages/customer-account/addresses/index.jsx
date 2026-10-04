import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Building2,
  Home
} from "lucide-react";
import toast from "react-hot-toast";

export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: "Home",
      is_default: true,
      recipient_name: "Alex Mercer",
      phone: "+91 9876543210",
      address_line: "Flat 402, Highline Residency, Bandra West",
      city: "Mumbai",
      state_name: "Maharashtra",
      pincode: "400050",
    },
    {
      id: 2,
      title: "Commercial Office",
      is_default: false,
      recipient_name: "Mercer Retail Ltd",
      phone: "+91 9876543210",
      address_line: "Floor 4, Peninsula Business Park, Lower Parel",
      city: "Mumbai",
      state_name: "Maharashtra",
      pincode: "400013",
    },
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "UPI VPA", provider: "Google Pay", identifier: "alex@okhdfcbank", is_default: true },
    { id: 2, type: "HDFC Business Card", provider: "Mastercard", identifier: "•••• •••• •••• 4242", is_default: false },
  ]);

  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed successfully");
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, is_default: a.id === id }))
    );
    toast.success("Default delivery destination updated");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Saved Addresses & Payment Methods</span>
          </h1>
          <p className="text-xs text-gray-400">
            Configure delivery destinations with statutory Place of Supply tax determination
          </p>
        </div>

        <Link
          to="/customer-account/addresses/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </Link>
      </div>

      {/* Minimalist Metrics Bar */}
      <div className="py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-300 flex items-center gap-3">
        <span>
          Active Addresses: <strong className="text-white">{addresses.length || "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Payment Instruments: <strong className="text-white">{paymentMethods.length || "—"}</strong>
        </span>
        <span className="text-gray-600">•</span>
        <span>
          Security: <strong className="text-emerald-400">256-Bit Encrypted</strong>
        </span>
      </div>

      {/* Saved Addresses Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Delivery Addresses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                a.is_default
                  ? "bg-[rgba(0,210,210,0.05)] border-[var(--brand-primary)] shadow-xs"
                  : "bg-white/[0.03] border-white/[0.08] hover:border-white/20"
              }`}
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {a.title === "Home" ? (
                      <Home className="w-4 h-4 text-[var(--brand-primary)]" />
                    ) : (
                      <Building2 className="w-4 h-4 text-[var(--brand-primary)]" />
                    )}
                    <span className="font-bold text-white">{a.title}</span>
                  </div>

                  {a.is_default && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(0,210,210,0.15)] text-[var(--brand-primary)] border border-[rgba(0,210,210,0.3)]">
                      Default
                    </span>
                  )}
                </div>

                <p className="font-semibold text-gray-200">{a.recipient_name}</p>
                <p className="text-gray-300">{a.address_line}</p>
                <p className="text-gray-400">
                  {a.city}, {a.state_name} - {a.pincode}
                </p>
                <p className="font-mono text-gray-400">Ph: {a.phone}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
                {!a.is_default ? (
                  <button
                    onClick={() => handleSetDefaultAddress(a.id)}
                    className="text-[var(--brand-primary)] hover:underline font-semibold cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Primary Destination</span>
                  </span>
                )}

                <button
                  onClick={() => handleDeleteAddress(a.id)}
                  className="text-gray-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                  title="Delete Address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Payment Methods */}
      <div className="space-y-4 pt-4 border-t border-white/[0.08]">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Saved Payment Methods
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-[var(--brand-primary)]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{pm.provider}</h4>
                  <p className="text-[11px] font-mono text-gray-400">{pm.identifier}</p>
                </div>
              </div>

              {pm.is_default && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10">
                  Default
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
