import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Truck,
  ArrowLeft,
  Printer,
  Building2,
  PackageCheck,
  Package,
  QrCode,
  FileText,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Table, Badge } from "../../../components/ui";

export default function InwardDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inwardId = searchParams.get("id");

  const [inward, setInward] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInwardDetails = async () => {
    if (!inwardId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await populateApi.read("purchase_inward", {
        filter: { id: inwardId },
        populate: {
          vendor: ["id", "name", "vendor_code", "phone", "email", "gstin"],
          items: ["id", "quantity", "taxable_amount", "tax_rate", "tax_amount", "total_amount", "variant"],
        },
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      if (list.length > 0) {
        setInward(list[0]);
      } else {
        toast.error("Inward record not found");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load inward details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInwardDetails();
  }, [inwardId]);

  if (loading) {
    return (
      <div className="py-16 text-center text-muted-token text-xs">
        Loading inward consignment details...
      </div>
    );
  }

  if (!inward) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-muted-token text-xs">Please select a valid GRN to inspect.</p>
        <Link to="/inward/purchase">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Inward List
          </Button>
        </Link>
      </div>
    );
  }

  const itemsList = inward.items || [];
  const totalUnits = itemsList.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

  const itemColumns = [
    {
      key: "variant",
      header: "Product / Variant",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">
            {val?.product?.name || val?.sku || `SKU #${row.id}`}
          </span>
          <span className="text-[10px] text-brand-token font-mono">{val?.sku || "—"}</span>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      align: "center",
      render: (val) => <span className="font-semibold">{formatQty(val)}</span>,
    },
    {
      key: "taxable_amount",
      header: "Cost / Unit",
      align: "right",
      render: (val) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: "tax_rate",
      header: "Tax Rate",
      align: "center",
      render: (val) => <span>{val ? `${val}%` : "—"}</span>,
    },
    {
      key: "tax_amount",
      header: "GST Tax",
      align: "right",
      render: (val) => (
        <span className="font-mono text-emerald-700 dark:text-emerald-400">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "total_amount",
      header: "Line Total",
      align: "right",
      render: (val) => (
        <span className="font-bold text-primary-token font-mono">
          {formatCurrency(val)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/inward/purchase"
            className="p-1.5 rounded-lg border border-token text-muted-token hover:text-primary-token transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-primary-token tracking-tight">
                {inward.inward_number || `GRN-${inward.id}`}
              </h1>
              <Badge variant="emerald" dot>
                {inward.inward_status ? inward.inward_status.toUpperCase() : "RECEIVED"}
              </Badge>
            </div>
            <p className="text-xs text-muted-token mt-0.5">
              Inwarded on {inward.inward_date || (inward.created_at ? new Date(inward.created_at).toLocaleDateString() : "—")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print GRN Slip
          </Button>
          <Link to="/inventory/tagging">
            <Button
              variant="secondary"
              size="sm"
              icon={QrCode}
            >
              Print Barcode Labels
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Invoice #: <strong className="text-primary-token font-mono font-medium">{inward.invoice_number || "—"}</strong></span>
        <span>•</span>
        <span>Total Pieces: <strong className="text-primary-token font-medium">{formatQty(totalUnits)}</strong></span>
        <span>•</span>
        <span>Taxable Sum: <strong className="text-primary-token font-medium">{formatCurrency(inward.taxable_amount)}</strong></span>
        <span>•</span>
        <span>Total GST: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatCurrency(inward.tax_amount)}</strong></span>
        <span>•</span>
        <span>Consignment Value: <strong className="text-brand-token font-semibold">{formatCurrency(inward.total_amount)}</strong></span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supplier / Vendor Info */}
        <div className="p-4 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-2 text-xs">
          <div className="font-bold text-primary-token uppercase text-[10px] flex items-center gap-1.5 text-muted-token">
            <Building2 className="w-3.5 h-3.5 text-brand-token" />
            Supplier & Bill Details
          </div>
          <p className="font-semibold text-sm text-primary-token">{inward.vendor?.name || "Standard Vendor"}</p>
          <p className="text-secondary-token">Code: <span className="font-mono text-brand-token font-semibold">{inward.vendor?.vendor_code || "—"}</span></p>
          <p className="text-secondary-token">GSTIN: <span className="font-mono">{inward.vendor?.gstin || "—"}</span></p>
          <p className="text-secondary-token">Phone: {inward.vendor?.phone || "—"}</p>
        </div>

        {/* Financial & Dispatch Details */}
        <div className="p-4 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-2 text-xs">
          <div className="font-bold text-primary-token uppercase text-[10px] flex items-center gap-1.5 text-muted-token">
            <FileText className="w-3.5 h-3.5 text-brand-token" />
            Consignment Financials
          </div>
          <div className="flex justify-between text-secondary-token">
            <span>Supplier Bill #</span>
            <span className="font-mono font-semibold text-primary-token">{inward.invoice_number || "—"}</span>
          </div>
          <div className="flex justify-between text-secondary-token">
            <span>Taxable Amount</span>
            <span className="font-mono">{formatCurrency(inward.taxable_amount)}</span>
          </div>
          <div className="flex justify-between text-secondary-token">
            <span>GST Tax</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400">{formatCurrency(inward.tax_amount)}</span>
          </div>
          <div className="pt-2 border-t border-token flex justify-between font-bold text-sm text-primary-token">
            <span>Total Bill Value</span>
            <span className="font-mono text-base text-brand-token">{formatCurrency(inward.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-1.5">
          <Package className="w-4 h-4 text-brand-token" />
          Received Consignment SKUs ({formatQty(itemsList.length)})
        </h2>
        <Table
          columns={itemColumns}
          data={itemsList}
          emptyMessage="No inward line items recorded."
        />
      </div>
    </div>
  );
}
