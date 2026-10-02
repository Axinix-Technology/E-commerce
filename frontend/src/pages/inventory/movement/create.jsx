import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRightLeft,
  Camera,
  Wrench,
  AlertTriangle,
  PackageCheck,
  Send,
  Boxes,
  Printer,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty } from "../../../utils/formatters";
import { Button, Input, Select, Badge } from "../../../components/ui";

const MOVEMENT_CONFIGS = [
  {
    type: "approval_outward",
    label: "Issue to Photoshoot / PR Memo",
    icon: Camera,
    color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    from: "Sellable On-Hand",
    to: "Approval Memo",
    desc: "Issue samples to influencers, photoshoots, or press loans under Returnable Gate Pass."
  },
  {
    type: "approval_return",
    label: "Return from Photoshoot Memo",
    icon: PackageCheck,
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    from: "Approval Memo",
    to: "Sellable On-Hand",
    desc: "Receive memo samples back into sellable inventory after shoot completion."
  },
  {
    type: "repair_outward",
    label: "Send to Alteration / Repair Workshop",
    icon: Wrench,
    color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    from: "Sellable / Quarantine",
    to: "Repair Workshop",
    desc: "Send defective, returned, or sizing alteration items to in-house or external workshop."
  },
  {
    type: "repair_return",
    label: "Restock Repaired / Altered Goods",
    icon: CheckCircle2,
    color: "text-teal-400 border-teal-500/20 bg-teal-500/10",
    from: "Repair Workshop",
    to: "Sellable On-Hand",
    desc: "Restock repaired garments and items back to active sellable stock."
  },
  {
    type: "return_quarantine",
    label: "Receive Customer Return into Quarantine",
    icon: AlertTriangle,
    color: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    from: "Customer Return",
    to: "Quarantine Hold",
    desc: "Hold customer returns for hygiene inspection and defect grading."
  },
  {
    type: "qc_restock",
    label: "QC Pass & Restock Return",
    icon: ShieldCheck,
    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    from: "Quarantine Hold",
    to: "Sellable On-Hand",
    desc: "Restock approved customer returns after passing quality inspection."
  },
  {
    type: "scrap_writeoff",
    label: "Scrap / Damaged Write-Off",
    icon: AlertTriangle,
    color: "text-rose-400 border-rose-500/20 bg-rose-500/10",
    from: "Damaged / Quarantine",
    to: "Scrap Write-Off",
    desc: "Write off destroyed or non-repairable stock from asset balance."
  },
];

export default function CreateStockMovementPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductStock, setSelectedProductStock] = useState(null);
  const [selectedMovementType, setSelectedMovementType] = useState("approval_outward");
  const [quantity, setQuantity] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [issueTypes, setIssueTypes] = useState([]);
  const [selectedIssueTypeId, setSelectedIssueTypeId] = useState("");

  // Gate pass challan preview
  const [issuedChallan, setIssuedChallan] = useState(null);

  useEffect(() => {
    populateApi.read("product_type", { limit: 200, sort: ["name"] }).then((res) => {
      if (res?.data) {
        setProducts(res.data);
        if (res.data.length > 0) {
          setSelectedProductId(res.data[0].id.toString());
        }
      }
    });

    populateApi.read("stock_issue_type", { limit: 50, sort: ["name"] }).then((res) => {
      if (res?.data && res.data.length > 0) {
        setIssueTypes(res.data);
        setSelectedIssueTypeId(res.data[0].id.toString());
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;
    populateApi
      .read("inventory_stock", { filter: { product_id: selectedProductId } })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setSelectedProductStock(res.data[0]);
        } else {
          setSelectedProductStock(null);
        }
      });
  }, [selectedProductId]);

  const activeMovementConfig =
    MOVEMENT_CONFIGS.find((m) => m.type === selectedMovementType) || MOVEMENT_CONFIGS[0];

  const handleSubmitMovement = async (e) => {
    e.preventDefault();

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid positive quantity.");
      return;
    }

    if (!recipient.trim()) {
      toast.error("Please specify recipient / reason reference.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        product_id: parseInt(selectedProductId, 10),
        movement_type: selectedMovementType,
        quantity: qty,
        issue_type_id: selectedIssueTypeId ? parseInt(selectedIssueTypeId, 10) : undefined,
        remarks: `${recipient.trim()}${remarks.trim() ? " | " + remarks.trim() : ""}`
      };

      const res = await populateApi.create("stock_ledger", payload);

      if (res?.success || res?.data) {
        toast.success(`Stock movement completed: ${qty} units processed!`);

        const prod = products.find((p) => p.id.toString() === selectedProductId);
        setIssuedChallan({
          movementId: res.data?.id || `MVT-${Date.now().toString().slice(-6)}`,
          movementType: activeMovementConfig.label,
          productName: prod?.name || `Product #${selectedProductId}`,
          quantity: qty,
          recipient: recipient.trim(),
          remarks: remarks.trim(),
          date: new Date().toLocaleString("en-IN"),
          fromBucket: activeMovementConfig.from,
          toBucket: activeMovementConfig.to,
        });

        if (selectedProductId) {
          populateApi
            .read("inventory_stock", { filter: { product_id: selectedProductId } })
            .then((r) => {
              if (r?.data?.length > 0) setSelectedProductStock(r.data[0]);
            });
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to process stock movement");
    } finally {
      setSubmitting(false);
    }
  };

  const productOptions = products.map((p) => ({
    value: p.id.toString(),
    label: p.name
  }));

  const issueTypeOptions = issueTypes.map((it) => ({
    value: it.id.toString(),
    label: `${it.name} — (${it.deduct_from_available_stock ? "Deducts Available Stock" : "Keeps in Available Stock"})`
  }));

  const selectedIssueType = issueTypes.find((t) => t.id.toString() === selectedIssueTypeId);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/inventory/movement"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-token hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Stock Movements
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.25)] text-brand-token shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-primary-token">
                  Execute Stock Movement
                </h1>
                <Badge variant="brand" size="xs">
                  Bucket Operations
                </Badge>
              </div>
              <p className="text-xs text-secondary-token">
                Transfer inventory across operational buckets: Photoshoot PR Memos, Alteration Workshops, Return Quarantine, and Scrap.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form & Live Stock Buckets */}
      {!issuedChallan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmitMovement} className="glass-panel p-6 rounded-2xl border border-token space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary-token border-b border-token pb-3">
                1. Select Movement Operation
              </h2>

              {/* Movement Operation Type Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MOVEMENT_CONFIGS.map((cfg) => {
                  const Icon = cfg.icon;
                  const isSelected = selectedMovementType === cfg.type;
                  return (
                    <button
                      key={cfg.type}
                      type="button"
                      onClick={() => setSelectedMovementType(cfg.type)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[var(--brand-secondary)] bg-[rgba(0,210,210,0.08)] shadow-sm"
                          : "border-token bg-surface-elevated/40 hover:bg-surface-elevated"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${cfg.color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-primary-token truncate">{cfg.label}</div>
                        <div className="text-[10px] text-muted-token font-mono">
                          {cfg.from} → {cfg.to}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Description Banner */}
              <div className="p-3 rounded-xl bg-surface-elevated/60 border border-token text-xs text-secondary-token flex items-center gap-2">
                <span className="font-semibold text-primary-token">Policy:</span>
                <span>{activeMovementConfig.desc}</span>
              </div>

              <h2 className="text-sm font-bold uppercase tracking-wider text-primary-token border-b border-token pb-3 pt-2">
                2. Product & Quantity
              </h2>

              {/* Stock Issue Policy Type Configuration */}
              {(selectedMovementType === "approval_outward" || selectedMovementType === "approval_return") && (
                <div className="p-4 rounded-xl bg-surface-elevated/70 border border-token space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-primary-token">
                      Stock Issue Policy Type
                    </label>
                    {selectedIssueType && (
                      <Badge
                        variant={selectedIssueType.deduct_from_available_stock ? "rose" : "emerald"}
                        size="xs"
                      >
                        {selectedIssueType.deduct_from_available_stock
                          ? "Deducts From Available Stock"
                          : "Keeps In Available Stock"}
                      </Badge>
                    )}
                  </div>
                  <Select
                    size="md"
                    options={issueTypeOptions}
                    value={selectedIssueTypeId}
                    onChange={(e) => setSelectedIssueTypeId(e.target.value)}
                    helperText={selectedIssueType?.description}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Select
                    label="Select Product"
                    required
                    size="md"
                    options={productOptions}
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Quantity (Units)"
                    required
                    size="md"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              {/* Recipient & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Recipient / Workshop Name"
                  required
                  size="md"
                  placeholder="e.g., Vogue Stylist Priya / Workshop Unit 2"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />

                <Input
                  label="Gate Pass / Reason Remarks"
                  size="md"
                  placeholder="e.g., Returnable memo 7 days / Alteration"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                fullWidth
                loading={submitting}
                icon={Send}
                className="mt-4"
              >
                Confirm Movement ({quantity} Units)
              </Button>
            </form>
          </div>

          {/* Live Product Stock Status Card */}
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-token space-y-4">
              <div className="flex items-center gap-2 border-b border-token pb-3">
                <Boxes className="w-4 h-4 text-brand-token" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary-token">
                  Live Product Stock Buckets
                </h3>
              </div>

              {selectedProductStock ? (
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                    <span className="font-semibold text-emerald-400">Sellable On-Hand (ATP):</span>
                    <span className="font-mono font-bold text-base text-emerald-400">
                      {formatQty(selectedProductStock.sellable_stock)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface-elevated border border-token flex justify-between items-center">
                    <span className="text-secondary-token">Total On-Hand:</span>
                    <span className="font-mono font-bold text-primary-token">
                      {formatQty(selectedProductStock.quantity_on_hand)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex justify-between items-center">
                    <span className="text-amber-400 font-medium">In Approval Memo:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {formatQty(selectedProductStock.approval_stock)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex justify-between items-center">
                    <span className="text-blue-400 font-medium">Return Quarantine:</span>
                    <span className="font-mono font-bold text-blue-400">
                      {formatQty(selectedProductStock.quarantine_stock)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex justify-between items-center">
                    <span className="text-cyan-400 font-medium">In Repair Workshop:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {formatQty(selectedProductStock.repair_stock)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex justify-between items-center">
                    <span className="text-rose-400 font-medium">Damaged / Scrap:</span>
                    <span className="font-mono font-bold text-rose-400">
                      {formatQty(selectedProductStock.damaged_stock)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-token">
                  No active stock record found for this product.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Printable Delivery Gate Pass / Approval Memo Challan */
        <div className="glass-panel p-6 rounded-2xl border-2 border-[var(--brand-secondary)]/50 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-token pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-base font-bold text-primary-token">
                  Gate Pass Generated: #{issuedChallan.movementId}
                </h2>
                <p className="text-xs text-secondary-token">Movement ledger updated successfully.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Gate Pass
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/inventory/movement")}
              >
                View in Movement Ledger
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white text-black font-sans text-xs space-y-4 border border-slate-300">
            <div className="flex justify-between items-start border-b border-black/20 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black tracking-tight">AXINIX COMMERCE LTD.</h3>
                <p className="text-[11px] text-gray-700">Central Warehouse & Fulfillment Hub</p>
                <p className="text-[10px] text-gray-600">GSTIN: 33AAAAA0000A1Z5</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 rounded bg-black text-white font-bold text-[10px] uppercase">
                  Returnable Delivery Gate Pass
                </span>
                <p className="text-[11px] font-mono mt-1 text-black font-bold">Doc No: {issuedChallan.movementId}</p>
                <p className="text-[10px] text-gray-600">Date: {issuedChallan.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-black/20 pb-3">
              <div>
                <span className="font-bold text-gray-700 block">Issued To (Recipient):</span>
                <span className="font-semibold text-black">{issuedChallan.recipient}</span>
                {issuedChallan.remarks && (
                  <p className="text-[11px] text-gray-600 mt-1">Ref / Reason: {issuedChallan.remarks}</p>
                )}
              </div>
              <div>
                <span className="font-bold text-gray-700 block">Movement Type:</span>
                <span className="font-semibold text-black">{issuedChallan.movementType}</span>
                <p className="text-[11px] text-gray-600 mt-1">Route: {issuedChallan.fromBucket} → {issuedChallan.toBucket}</p>
              </div>
            </div>

            <table className="w-full border border-black/20 text-left text-xs">
              <thead className="bg-gray-100 border-b border-black/20 text-gray-800 font-bold">
                <tr>
                  <th className="p-2">Item Description</th>
                  <th className="p-2 text-center">Quantity</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 font-medium">{issuedChallan.productName}</td>
                  <td className="p-2 text-center font-bold font-mono">{issuedChallan.quantity} Units</td>
                  <td className="p-2 text-center">Issued Under Returnable Memo</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between pt-8 text-[11px] text-gray-700">
              <div className="border-t border-black/40 pt-1 w-44 text-center">
                Authorized Store Incharge
              </div>
              <div className="border-t border-black/40 pt-1 w-44 text-center">
                Recipient / Courier Signature
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
