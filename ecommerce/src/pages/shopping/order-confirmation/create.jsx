import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input } from "../../../components/ui";

export default function CreateReorderPage() {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReorder = (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("Please enter previous Order Number");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Items from order ${orderNumber} cloned to active cart!`);
      navigate("/shopping/cart");
    }, 600);
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/shopping/order-confirmation"
          className="p-2 rounded-xl border border-token bg-surface-elevated/40 hover:bg-surface-elevated/80 text-muted-token hover:text-primary-token transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-brand-token" />
            One-Click Reorder
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Clone items from a previous order into your active shopping cart session
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleReorder} className="p-5 md:p-6 rounded-2xl border border-token bg-surface-elevated/40 backdrop-blur-sm space-y-4">
        <Input
          label="Previous Order Reference"
          required
          placeholder="e.g. SO-20261003-8491"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="font-mono uppercase text-xs"
        />

        <div className="pt-3 border-t border-token flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => navigate("/shopping/order-confirmation")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="sm"
            icon={RotateCcw}
            loading={submitting}
          >
            Clone to Cart & Reorder
          </Button>
        </div>
      </form>
    </div>
  );
}
