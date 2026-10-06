import React, { useState } from "react";
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
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { formatQty } from "../../../utils/formatters";

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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary-token flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-token" />
            <span>Saved Addresses & Payment Methods</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Configure delivery destinations with statutory Place of Supply tax determination
          </p>
        </div>

        <Link to="/customer-account/addresses/create" className="self-start sm:self-auto">
          <Button variant="secondary" size="sm" icon={Plus}>
            Add New Address
          </Button>
        </Link>
      </div>

      {/* Minimalist Metrics Bar (UI Rule 2 & UI Rule 1) */}
      <div className="glass-panel py-2 px-3.5 rounded-xl border border-token text-xs font-mono flex flex-wrap items-center gap-2.5 sm:gap-3 text-secondary-token">
        <span>
          Active Addresses: <strong className="text-primary-token font-medium">{formatQty(addresses.length)}</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Payment Instruments: <strong className="text-primary-token font-medium">{formatQty(paymentMethods.length)}</strong>
        </span>
        <span className="text-muted-token">•</span>
        <span>
          Security: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">256-Bit Encrypted</strong>
        </span>
      </div>

      {/* Saved Addresses Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider">
          Delivery Addresses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                a.is_default
                  ? "bg-brand-token/5 border-brand-token/40 shadow-xs"
                  : "card-surface border-token hover:border-brand-token/30"
              }`}
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {a.title === "Home" ? (
                      <Home className="w-4 h-4 text-brand-token" />
                    ) : (
                      <Building2 className="w-4 h-4 text-brand-token" />
                    )}
                    <span className="font-bold text-primary-token">{a.title}</span>
                  </div>

                  {a.is_default && (
                    <Badge variant="brand" size="xs">
                      Default
                    </Badge>
                  )}
                </div>

                <p className="font-semibold text-primary-token">{a.recipient_name}</p>
                <p className="text-secondary-token">{a.address_line}</p>
                <p className="text-muted-token">
                  {a.city}, {a.state_name} - {a.pincode}
                </p>
                <p className="font-mono text-muted-token">Ph: {a.phone}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-token text-xs">
                {!a.is_default ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleSetDefaultAddress(a.id)}
                    className="text-brand-token"
                  >
                    Set as Default
                  </Button>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Primary Destination</span>
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleDeleteAddress(a.id)}
                  className="text-muted-token hover:text-rose-600 dark:hover:text-rose-400 p-1"
                  title="Delete Address"
                  icon={Trash2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Payment Methods */}
      <div className="space-y-4 pt-4 border-t border-token">
        <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider">
          Saved Payment Methods
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="card-surface p-4 rounded-2xl border border-token flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-surface-elevated text-brand-token border border-token">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary-token">{pm.provider}</h4>
                  <p className="text-[11px] font-mono text-muted-token">{pm.identifier}</p>
                </div>
              </div>

              {pm.is_default && (
                <Badge variant="neutral" size="xs">
                  Default
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
