import React, { useState, useEffect } from "react";
import {
  QrCode,
  Barcode,
  Search,
  RefreshCw,
  Printer,
  Copy,
  Tag,
  CheckCircle2
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Input, Badge, Checkbox, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

const formatCurrency = (val) => {
  const num = Number(val);
  return !num || num === 0
    ? "—"
    : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function BarcodeTaggingPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [selectedLot, setSelectedLot] = useState("");
  const [bucketFilter, setBucketFilter] = useState("all");
  const [soldFilter, setSoldFilter] = useState("all");
  const [selectedUnits, setSelectedUnits] = useState(new Set());
  const [previewUnit, setPreviewUnit] = useState(null);
  const [batchPrintMode, setBatchPrintMode] = useState(false);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (selectedLot.trim()) filter.lot_number__icontains = selectedLot.trim();

      const res = await populateApi.read("tagged_unit", {
        search: searchBarcode.trim() || undefined,
        searchFields: ["item_barcode", "lot_number"],
        filter,
        populate: {
          product: ["id", "name", "category_id"],
          inward_item: ["id", "lot_number", "unit_cost"]
        },
        limit: 100,
        sort: ["-id"]
      });

      if (res?.data) {
        setUnits(res.data);
        if (res.data.length > 0 && !previewUnit) {
          setPreviewUnit(res.data[0]);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load tagged inventory units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [selectedLot]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUnits();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUnits(new Set(filteredUnits.map((u) => u.id)));
    } else {
      setSelectedUnits(new Set());
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyBarcode = (barcode) => {
    navigator.clipboard.writeText(barcode);
    toast.success(`Copied barcode: ${barcode}`);
  };

  const filteredUnits = units.filter((u) => {
    if (bucketFilter !== "all" && u.current_bucket !== bucketFilter) return false;
    if (soldFilter === "available" && u.is_sold) return false;
    if (soldFilter === "sold" && !u.is_sold) return false;
    if (selectedLot.trim() && !(u.lot_number || "").toLowerCase().includes(selectedLot.toLowerCase())) return false;
    if (searchBarcode.trim()) {
      const term = searchBarcode.toLowerCase();
      const matchBarcode = (u.item_barcode || "").toLowerCase().includes(term);
      const matchProduct = (u.product?.name || "").toLowerCase().includes(term);
      const matchLot = (u.lot_number || "").toLowerCase().includes(term);
      if (!matchBarcode && !matchProduct && !matchLot) return false;
    }
    return true;
  });

  const selectedList = filteredUnits.filter((u) => selectedUnits.has(u.id));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-primary-token">
                Barcode Tagging & Unit Registry
              </h1>
              <Badge variant="primary" size="sm">
                Physical Tag Ops
              </Badge>
            </div>
            <p className="text-xs text-muted-token">
              Lookup physical item barcode stickers, inspect metadata, and bulk-print thermal labels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedUnits.size > 0 && (
            <Button
              variant="primary"
              size="sm"
              icon={Printer}
              onClick={() => setBatchPrintMode(true)}
            >
              Print {selectedUnits.size} Tags
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchUnits}
            title="Refresh Tagged Units"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Units on Page: <strong className="text-primary-token font-medium">{formatQty(filteredUnits.length)}</strong></span>
        <span>•</span>
        <span>Selected for Print: <strong className="text-brand-token font-medium">{formatQty(selectedUnits.size)}</strong></span>
        <span>•</span>
        <span>Active Focus: <strong className="text-primary-token font-mono">{previewUnit?.item_barcode || "—"}</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={searchBarcode}
        onSearchChange={setSearchBarcode}
        searchPlaceholder="Scan or type barcode, lot, product..."
        filters={
          <>
            <Select
              size="xs"
              value={bucketFilter}
              onChange={(e) => setBucketFilter(e.target.value)}
              options={[
                { label: "All Stock Buckets", value: "all" },
                { label: "Sellable On-Hand", value: "sellable" },
                { label: "Approval / Memo", value: "approval" },
                { label: "Order Reserved", value: "reserved" },
                { label: "Return Quarantine", value: "quarantine" },
                { label: "Alteration / Repair", value: "repair" },
                { label: "Damaged / Scrap", value: "damaged" },
                { label: "Sold & Dispatched", value: "sold" },
              ]}
            />
            <Select
              size="xs"
              value={soldFilter}
              onChange={(e) => setSoldFilter(e.target.value)}
              options={[
                { label: "All Sales Statuses", value: "all" },
                { label: "Available In-Store", value: "available" },
                { label: "Sold Out", value: "sold" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearchBarcode("");
          setBucketFilter("all");
          setSoldFilter("all");
          setSelectedLot("");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchUnits}
          title="Refresh Tagged Units"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Main Grid: Units List on Left, Active Sticker Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table of Tagged Units */}
        <div className="lg:col-span-2 rounded-2xl border border-token overflow-hidden bg-surface-elevated/20 shadow-xs">
          <div className="p-3 bg-surface-elevated/60 border-b border-token flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedUnits.size > 0 && selectedUnits.size === filteredUnits.length}
                onChange={handleSelectAll}
                className="rounded border-token text-brand-token focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-primary-token">
                {selectedUnits.size} selected of {filteredUnits.length} units
              </span>
            </div>
            <span className="text-[11px] text-muted-token">Click a row to preview sticker</span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated/50 text-muted-token uppercase tracking-wider font-semibold border-b border-token sticky top-0 backdrop-blur-xs">
                <tr>
                  <th className="py-2.5 px-3 w-8"></th>
                  <th className="py-2.5 px-3">Barcode</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Lot No</th>
                  <th className="py-2.5 px-3">Bucket</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-token text-primary-token">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-muted-token">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-token" />
                      Loading tagged physical units...
                    </td>
                  </tr>
                ) : filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-muted-token">
                      No matching barcode tags found.
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((u) => {
                    const isSelected = selectedUnits.has(u.id);
                    const isPreviewed = previewUnit?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setPreviewUnit(u)}
                        className={`cursor-pointer transition-colors ${isPreviewed ? "bg-brand-token/10 font-medium" : "hover:bg-surface-elevated/40"}`}
                      >
                        <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(u.id)}
                            className="rounded border-token text-brand-token focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-brand-token">
                          {u.item_barcode}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          <div className="truncate max-w-[200px] text-primary-token">
                            {u.product?.name || `Product #${u.product_id}`}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-muted-token">
                          {u.lot_number || "—"}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="neutral" size="sm">
                            {u.current_bucket?.toUpperCase() || "STORE"}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-secondary-token">
                          {formatCurrency(u.unit_cost)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Sticker Preview Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-token bg-surface-elevated/40 space-y-4">
            <div className="flex items-center justify-between border-b border-token pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-token" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary-token">
                  Thermal Label Preview (50×25mm)
                </h3>
              </div>
              {previewUnit && (
                <button
                  onClick={() => handleCopyBarcode(previewUnit.item_barcode)}
                  title="Copy Barcode"
                  className="p-1 text-muted-token hover:text-primary-token cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {previewUnit ? (
              <div className="space-y-4">
                {/* Physical Tag Card */}
                <div className="mx-auto w-64 h-32 bg-white text-black p-3 rounded-lg shadow-md flex flex-col justify-between border border-slate-300 font-sans">
                  <div className="border-b border-black/20 pb-1">
                    <div className="text-[10px] font-bold truncate uppercase text-black">
                      {previewUnit.product?.name || `Product #${previewUnit.product_id}`}
                    </div>
                    <div className="flex items-center justify-between text-[8px] text-gray-700 font-mono">
                      <span>LOT: {previewUnit.lot_number}</span>
                      <span>#{previewUnit.id}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center my-0.5">
                    <div className="h-8 w-full flex items-center justify-center gap-[2px] bg-white px-2">
                      {Array.from({ length: 34 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-full ${idx % 3 === 0 ? "w-1 bg-black" : idx % 5 === 0 ? "w-1.5 bg-black" : "w-[2px] bg-black"}`}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-black">
                      {previewUnit.item_barcode}
                    </span>
                  </div>

                  <div className="border-t border-black/20 pt-1 flex items-center justify-between text-[9px] font-bold text-black">
                    <span>{previewUnit.current_bucket?.toUpperCase()}</span>
                    <span className="font-mono">MRP: {formatCurrency(Number(previewUnit.unit_cost || 0) * 1.5)}</span>
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-token">
                    <span className="text-muted-token">Item Barcode:</span>
                    <span className="font-mono font-bold text-brand-token">{previewUnit.item_barcode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-token">
                    <span className="text-muted-token">Lot Sequence:</span>
                    <span className="font-mono text-primary-token">{previewUnit.lot_number || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-token">
                    <span className="text-muted-token">Current Bucket:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">{previewUnit.current_bucket}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-token">
                    <span className="text-muted-token">Unit Cost:</span>
                    <span className="font-mono text-primary-token">{formatCurrency(previewUnit.unit_cost)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-token">Tagged On:</span>
                    <span className="text-secondary-token">
                      {previewUnit.created_at ? new Date(previewUnit.created_at).toLocaleDateString("en-IN") : "—"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  icon={Printer}
                  onClick={() => window.print()}
                >
                  Print Single Sticker
                </Button>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-token">
                Select an item on the left to preview its physical thermal sticker.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Print Preview Section */}
      {batchPrintMode && (
        <div className="p-5 md:p-6 rounded-2xl border-2 border-brand-token/50 bg-surface-elevated/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-token pb-4">
            <div className="flex items-center gap-2.5">
              <Printer className="w-5 h-5 text-brand-token" />
              <div>
                <h2 className="text-base font-bold text-primary-token">
                  Batch Thermal Barcode Sticker Print Sheet ({selectedList.length} Labels)
                </h2>
                <p className="text-xs text-muted-token">
                  Print multiple 50mm × 25mm labels on your continuous roll thermal label printer
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Dispatch to Printer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBatchPrintMode(false)}
              >
                Close Batch View
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4 rounded-xl bg-black/10 dark:bg-black/30 border border-token max-h-[500px] overflow-y-auto">
            {selectedList.map((u) => (
              <div
                key={u.id}
                className="w-full h-32 bg-white text-black p-2.5 rounded shadow flex flex-col justify-between border border-slate-300 font-sans"
              >
                <div className="border-b border-black/20 pb-0.5">
                  <div className="text-[10px] font-bold truncate uppercase text-black">
                    {u.product?.name || `Product #${u.product_id}`}
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-gray-700 font-mono">
                    <span>LOT: {u.lot_number}</span>
                    <span>#{u.id}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center my-0.5">
                  <div className="h-7 w-full flex items-center justify-center gap-[2px] bg-white px-2">
                    {Array.from({ length: 30 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-full ${idx % 3 === 0 ? "w-1 bg-black" : "w-[1.5px] bg-black"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[8px] font-mono font-bold tracking-widest text-black">
                    {u.item_barcode}
                  </span>
                </div>

                <div className="border-t border-black/20 pt-0.5 flex items-center justify-between text-[8px] font-bold text-black">
                  <span>{u.current_bucket?.toUpperCase()}</span>
                  <span className="font-mono">MRP: {formatCurrency(Number(u.unit_cost || 0) * 1.5)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
