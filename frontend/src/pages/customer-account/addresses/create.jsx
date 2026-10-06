import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Save, Building2, Home } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import Checkbox from "../../../components/ui/Checkbox";
import Button from "../../../components/ui/Button";

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

  const stateOptions = states.map((s) => ({
    value: String(s.id),
    label: `${s.code ? s.code + " - " : ""}${s.name}`,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/customer-account/addresses">
          <Button variant="outline" size="sm" icon={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-token" />
            <span>Add Delivery Address</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">Save new shipping destination for faster checkout</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-5">
        <div className="space-y-4">
          <div className="flex gap-2 sm:gap-3">
            {["Home", "Commercial Office", "Warehouse"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData({ ...formData, title: t })}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  formData.title === t
                    ? "bg-brand-token/15 border-brand-token text-primary-token"
                    : "bg-surface-elevated/40 border-token text-muted-token hover:text-primary-token"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Recipient Name"
              required
              placeholder="e.g. Alex Mercer"
              value={formData.recipient_name}
              onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
            />

            <Input
              label="Mobile Phone"
              type="tel"
              required
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Textarea
            label="Flat / Building / Street Address"
            rows={2}
            required
            placeholder="Flat 402, Highline Residency..."
            value={formData.address_line}
            onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              required
              placeholder="Mumbai"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <Select
              label="State"
              required
              options={stateOptions}
              value={formData.state_id}
              onChange={(e) => setFormData({ ...formData, state_id: e.target.value })}
            />

            <Input
              label="PIN Code"
              required
              maxLength={6}
              placeholder="400050"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>

          <div className="pt-2 border-t border-token">
            <Checkbox
              id="is-default-address"
              label="Set as my primary delivery address"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-token flex items-center justify-end gap-3">
          <Link to="/customer-account/addresses">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={submitting}
            icon={Save}
          >
            {submitting ? "Saving..." : "Save Address"}
          </Button>
        </div>
      </form>
    </div>
  );
}
