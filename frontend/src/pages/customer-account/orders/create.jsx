import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import Checkbox from "../../../components/ui/Checkbox";
import Button from "../../../components/ui/Button";

export default function CreateReturnRequestPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    order_number: "",
    sku: "",
    reason: "Size Issue / Exchange Needed",
    pickup_address: "Flat 402, Highline Residency, Bandra West, Mumbai",
    restockable: true,
    comments: "",
  });

  const reasonOptions = [
    { value: "Size Issue / Exchange Needed", label: "Size Issue / Exchange Needed" },
    { value: "Fabric / Drape Difference", label: "Fabric / Drape Difference" },
    { value: "Defective / Transit Damage", label: "Defective / Transit Damage" },
    { value: "Changed Mind", label: "Changed Mind" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.order_number.trim()) {
      toast.error("Order number is required");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const rmaCode = `RMA-${Date.now().toString().slice(-6)}`;
      toast.success(`Return request ${rmaCode} created! Courier pickup scheduled.`);
      navigate("/customer-account/orders");
    }, 600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/customer-account/orders">
          <Button variant="outline" size="sm" icon={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand-token" />
            <span>Initiate Return / Exchange Request</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Submit a return request under our 7-day inspection window
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Sale Order Number"
              required
              placeholder="e.g. SO-20261003-8491"
              value={formData.order_number}
              onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
              className="font-mono uppercase"
            />

            <Input
              label="Item SKU (Optional)"
              placeholder="e.g. HL-OXF-WHT-M"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="font-mono"
            />
          </div>

          <Select
            label="Reason for Return"
            required
            options={reasonOptions}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />

          <Textarea
            label="Doorstep Pickup Address"
            rows={2}
            value={formData.pickup_address}
            onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
          />

          <Textarea
            label="Inspection Notes / Remarks"
            rows={3}
            placeholder="Describe condition of item, intact tags, original packaging..."
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          />

          <div className="pt-2 border-t border-token">
            <Checkbox
              id="confirm-restockable"
              label="I confirm barcode tags and original packaging are intact"
              checked={formData.restockable}
              onChange={(e) => setFormData({ ...formData, restockable: e.target.checked })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-token flex items-center justify-end gap-3">
          <Link to="/customer-account/orders">
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
            {submitting ? "Submitting..." : "Schedule Pickup & RMA"}
          </Button>
        </div>
      </form>
    </div>
  );
}
