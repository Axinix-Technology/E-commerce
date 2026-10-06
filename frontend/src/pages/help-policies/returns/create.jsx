import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import Checkbox from "../../../components/ui/Checkbox";
import Button from "../../../components/ui/Button";

export default function InitiateReversePickupPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    order_number: "",
    reason: "Size Issue / Exchange",
    pickup_address: "",
    contact_phone: "",
    confirm_intact_tags: true,
  });

  const reasonOptions = [
    { value: "Size Issue / Exchange", label: "Size Issue / Exchange" },
    { value: "Fabric / Drape Difference", label: "Fabric / Drape Difference" },
    { value: "Defective Garment", label: "Defective Garment" },
    { value: "Incorrect Item Dispatched", label: "Incorrect Item Dispatched" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.order_number || !formData.pickup_address || !formData.contact_phone) {
      toast.error("Please fill in Order Number, pickup address, and phone");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const rmaId = `RMA-${Date.now().toString().slice(-6)}`;
      toast.success(`Reverse pickup ${rmaId} registered! BlueDart will pick up within 24h.`);
      navigate("/help-policies/returns");
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/help-policies/returns">
          <Button variant="outline" size="sm" icon={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand-token" />
            <span>Schedule Reverse Doorstep Pickup</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">Initiate complimentary courier collection for eligible items</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Order Number"
              required
              placeholder="e.g. SO-20261003-8491"
              value={formData.order_number}
              onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
              className="font-mono uppercase"
            />

            <Input
              label="Contact Phone"
              type="tel"
              required
              placeholder="+91 9876543210"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            />
          </div>

          <Select
            label="Primary Reason"
            required
            options={reasonOptions}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />

          <Textarea
            label="Doorstep Pickup Address"
            rows={2}
            required
            placeholder="Flat 402, Highline Residency, Bandra West, Mumbai - 400050"
            value={formData.pickup_address}
            onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
          />

          <div className="pt-2 border-t border-token">
            <Checkbox
              id="confirm-tags"
              label="I confirm the items are in original condition with barcoded tags attached"
              checked={formData.confirm_intact_tags}
              onChange={(e) => setFormData({ ...formData, confirm_intact_tags: e.target.checked })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-token flex items-center justify-end gap-3">
          <Link to="/help-policies/returns">
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
            {submitting ? "Booking..." : "Confirm Pickup Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
}
