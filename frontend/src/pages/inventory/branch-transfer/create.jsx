import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Network,
  Truck,
  Boxes,
  Send,
  Printer,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty } from "../../../utils/formatters";
import { Button, Input, Select, Badge } from "../../../components/ui";

const BRANCH_LOCATIONS = [
  { value: "WH-CENTRAL", label: "Central Fulfillment Hub (HQ) — Chennai, TN" },
  { value: "BR-MUMBAI", label: "Mumbai Regional Warehouse — Bhiwandi, MH" },
  { value: "BR-DELHI", label: "North Distribution Center — Gurugram, HR" },
  { value: "BR-BLR", label: "South Regional Hub — Bengaluru, KA" },
  { value: "STORE-EXPRESS", label: "Retail Flagship Experience Store — T. Nagar, Chennai" },
];

export default function CreateBranchTransferPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productStock, setProductStock] = useState(null);
  const [sourceBranch, setSourceBranch] = useState("WH-CENTRAL");
  const [destBranch, setDestBranch] = useState("BR-MUMBAI");
  const [quantity, setQuantity] = useState(1);
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // DC Challan preview after dispatch
  const [challan, setChallan] = useState(null);

  useEffect(() => {
    populateApi.read("product_type", { limit: 200, sort: ["name"] }).then((res) => {
      if (res?.data) {
        setProducts(res.data);
        if (res.data.length > 0) setSelectedProduct(res.data[0].id.toString());
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    populateApi
      .read("inventory_stock", { filter: { product_id: selectedProduct } })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setProductStock(res.data[0]);
        } else {
          setProductStock(null);
        }
      })
      .catch(() => setProductStock(null));
  }, [selectedProduct]);

  const handleInitiateTransfer = async (e) => {
    e.preventDefault();

    if (sourceBranch === destBranch) {
      toast.error("Source and destination branch cannot be the same.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid transfer quantity.");
      return;
    }

    if (productStock && productStock.sellable_stock < qty) {
      toast.error(`Insufficient sellable stock! Available: ${productStock.sellable_stock} units.`);
      return;
    }

    setSubmitting(true);
    try {
      const dcNumber = `DC-TR-${Date.now().toString().slice(-6)}`;
      const payload = {
        product_id: parseInt(selectedProduct, 10),
        movement_type: "branch_transfer_outward",
        quantity: qty,
        reference_type: "branch_transfer",
        reference_id: dcNumber,
        remarks: `${sourceBranch} → ${destBranch} | Vehicle: ${vehicleNo || "N/A"} | Ph: ${driverContact || "N/A"}`
      };

      const res = await populateApi.create("stock_ledger", payload);

      if (res?.success || res?.data) {
        toast.success(`Branch transfer initiated! ${qty} units dispatched.`);

        const prod = products.find((p) => p.id.toString() === selectedProduct);
        setChallan({
          dcNumber,
          source: BRANCH_LOCATIONS.find((b) => b.value === sourceBranch)?.label,
          destination: BRANCH_LOCATIONS.find((b) => b.value === destBranch)?.label,
          productName: prod?.name || `Product #${selectedProduct}`,
          quantity: qty,
          vehicleNo: vehicleNo || "Direct Express Courier",
          driverContact: driverContact || "N/A",
          date: new Date().toLocaleString("en-IN")
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to initiate branch transfer");
    } finally {
      setSubmitting(false);
    }
  };

  const productOptions = products.map((p) => ({
    value: p.id.toString(),
    label: p.name
  }));

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/inventory/branch-transfer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-token hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Transfer List
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.25)] text-brand-token shadow-xs">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-primary-token">
                  Dispatch Inter-Branch Stock Transfer
                </h1>
                <Badge variant="brand" size="xs">
                  Challan Generation
                </Badge>
              </div>
              <p className="text-xs text-secondary-token">
                Transfer inventory between central warehouses and retail stores with automated statutory Delivery Challans.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form & Policy Side-by-Side */}
      {!challan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleInitiateTransfer} className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-token space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary-token border-b border-token pb-3">
              1. Transfer Route & Locations
            </h2>

            {/* Route Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Source Branch / Warehouse"
                required
                size="md"
                options={BRANCH_LOCATIONS}
                value={sourceBranch}
                onChange={(e) => setSourceBranch(e.target.value)}
              />

              <Select
                label="Destination Branch / Store"
                required
                size="md"
                options={BRANCH_LOCATIONS}
                value={destBranch}
                onChange={(e) => setDestBranch(e.target.value)}
              />
            </div>

            <h2 className="text-sm font-bold uppercase tracking-wider text-primary-token border-b border-token pb-3 pt-2">
              2. Product & Dispatch Quantity
            </h2>

            {/* Product & Qty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Select
                  label="Select Product"
                  required
                  size="md"
                  options={productOptions}
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  helperText={
                    productStock
                      ? `Available Sellable Stock: ${formatQty(productStock.sellable_stock)} units`
                      : null
                  }
                />
              </div>

              <div>
                <Input
                  label="Quantity (Units)"
                  required
                  size="md"
                  type="number"
                  min="1"
                  max={productStock?.sellable_stock || 99999}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>

            <h2 className="text-sm font-bold uppercase tracking-wider text-primary-token border-b border-token pb-3 pt-2">
              3. Logistics & Transit Details
            </h2>

            {/* Vehicle / Logistics Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Vehicle / Courier Tracking No"
                size="md"
                placeholder="e.g., TN-01-AB-1234 / BlueDart 883921"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
              />

              <Input
                label="Driver / Handler Contact"
                size="md"
                placeholder="e.g., Ramesh (+91 98400 12345)"
                value={driverContact}
                onChange={(e) => setDriverContact(e.target.value)}
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
              Issue Branch Transfer DC ({quantity} Units)
            </Button>
          </form>

          {/* Policy & Guidance Sidebar */}
          <div className="space-y-5">
            <div className="glass-panel p-5 rounded-2xl border border-token space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-token border-b border-token pb-2">
                <Truck className="w-4 h-4 text-brand-token" />
                Transfer Policy & Governance
              </div>
              <div className="text-xs text-secondary-token space-y-2.5">
                <p>• <span className="font-semibold text-primary-token">Instant Outward:</span> Stock is immediately deducted from the source branch sellable ATP inventory.</p>
                <p>• <span className="font-semibold text-primary-token">GST Rule 55 Compliant:</span> Automatically creates a statutory Delivery Challan for goods movement without sale.</p>
                <p>• <span className="font-semibold text-primary-token">In-Transit Tracking:</span> Destination branch verifies and confirms receipt to replenish local inventory.</p>
              </div>
            </div>

            {productStock && (
              <div className="glass-panel p-5 rounded-2xl border border-token space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-token border-b border-token pb-2">
                  <Boxes className="w-4 h-4 text-brand-token" />
                  Source Stock Availability
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-400 font-medium">Sellable (ATP):</span>
                    <span className="font-mono font-bold text-emerald-400">{formatQty(productStock.sellable_stock)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-surface-elevated border border-token">
                    <span className="text-secondary-token">Total On-Hand:</span>
                    <span className="font-mono font-bold text-primary-token">{formatQty(productStock.quantity_on_hand)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Printable Delivery Challan Card */
        <div className="glass-panel p-6 rounded-2xl border-2 border-[var(--brand-secondary)]/50 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-token pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-base font-bold text-primary-token">
                  Challan Dispatched Successfully: #{challan.dcNumber}
                </h2>
                <p className="text-xs text-secondary-token">Inventory has been deducted from source branch.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Challan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/inventory/branch-transfer")}
              >
                View in Transfer List
              </Button>
            </div>
          </div>

          {/* Printable Layout */}
          <div className="p-6 rounded-xl bg-white text-black font-sans text-xs space-y-4 border border-slate-300">
            <div className="flex justify-between items-start border-b border-black/20 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black tracking-tight">AXINIX COMMERCE LTD.</h3>
                <p className="text-[11px] text-gray-700">Central Logistics & Distribution</p>
                <p className="text-[10px] text-gray-600">GSTIN: 33AAAAA0000A1Z5</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 rounded bg-black text-white font-bold text-[10px] uppercase">
                  GST Delivery Challan (Rule 55)
                </span>
                <p className="text-[11px] font-mono mt-1 text-black font-bold">DC No: {challan.dcNumber}</p>
                <p className="text-[10px] text-gray-600">Date: {challan.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-black/20 pb-3">
              <div>
                <span className="font-bold text-gray-700 block">Dispatching Location (From):</span>
                <span className="font-semibold text-black">{challan.source}</span>
                <p className="text-[11px] text-gray-600 mt-1">Vehicle/Courier: {challan.vehicleNo}</p>
              </div>
              <div>
                <span className="font-bold text-gray-700 block">Receiving Location (To):</span>
                <span className="font-semibold text-black">{challan.destination}</span>
                <p className="text-[11px] text-gray-600 mt-1">Driver Contact: {challan.driverContact}</p>
              </div>
            </div>

            <table className="w-full border border-black/20 text-left text-xs">
              <thead className="bg-gray-100 border-b border-black/20 text-gray-800 font-bold">
                <tr>
                  <th className="p-2">Item Description</th>
                  <th className="p-2 text-center">Transfer Qty</th>
                  <th className="p-2 text-center">Movement Nature</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 font-medium">{challan.productName}</td>
                  <td className="p-2 text-center font-bold font-mono">{challan.quantity} Units</td>
                  <td className="p-2 text-center">Inter-Branch Transfer (Not for Sale)</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between pt-8 text-[11px] text-gray-700">
              <div className="border-t border-black/40 pt-1 w-44 text-center">
                Dispatched By (Store Manager)
              </div>
              <div className="border-t border-black/40 pt-1 w-44 text-center">
                Receiver Acknowledgment
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
