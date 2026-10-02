import React, { useState, useEffect } from "react";
import {
  Barcode,
  Search,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  Boxes,
  Camera,
  Wrench,
  AlertTriangle,
  Printer,
  CheckCircle2,
  Copy,
  Layers,
  ArrowUpDown,
  Tag
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";

const BUCKET_LABELS = {
  sellable: { label: "Sellable On-Hand", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  reserved: { label: "Order Reserved", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  approval: { label: "Approval / Memo", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  quarantine: { label: "Return Quarantine", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  repair: { label: "Alteration / Repair", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  damaged: { label: "Damaged / Scrap", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  sold: { label: "Sold & Dispatched", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

export default function DetailedStockReportPage() {
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchBarcode, setSearchBarcode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedBucket, setSelectedBucket] = useState("");
  const [lotFilter, setLotFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [totalCount, setTotalCount] = useState(0);

  // Print modal / inline preview
  const [printUnit, setPrintUnit] = useState(null);

  useEffect(() => {
    // Load products for dropdown
    populateApi.read("product_type", { limit: 200, sort: ["name"] }).then((res) => {
      if (res?.data) setProducts(res.data);
    });
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (selectedProduct) filter.product_id = selectedProduct;
      if (selectedBucket) filter.current_bucket = selectedBucket;
      if (lotFilter.trim()) filter.lot_number__icontains = lotFilter.trim();
      if (startDate) filter.created_at__gte = `${startDate}T00:00:00`;
      if (endDate) filter.created_at__lte = `${endDate}T23:59:59`;

      const res = await populateApi.read("tagged_unit", {
        search: searchBarcode.trim() || undefined,
        searchFields: ["item_barcode", "lot_number"],
        filter,
        populate: {
          product: ["id", "name", "category_id"],
          inward_item: ["id", "lot_number", "unit_cost", "inward_id"]
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        sort: ["-created_at", "-id"]
      });

      if (res?.data) {
        setUnits(res.data);
        setTotalCount(res.total || res.data.length);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load detailed stock units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [page, selectedProduct, selectedBucket, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUnits();
  };

  const handleCopyBarcode = (barcode) => {
    navigator.clipboard.writeText(barcode);
    toast.success(`Copied: ${barcode}`);
  };

  const handleExportCSV = () => {
    if (units.length === 0) {
      toast.error("No stock records to export.");
      return;
    }

    const headers = [
      "Unit ID",
      "Item Barcode",
      "Product Name",
      "Lot Number",
      "Current Bucket",
      "Unit Cost (INR)",
      "Tagged Date",
      "Is Sold",
      "Status"
    ];

    const csvRows = [headers.join(",")];
    units.forEach((u) => {
      csvRows.push([
        u.id,
        `"${u.item_barcode}"`,
        `"${(u.product?.name || "Product #" + u.product_id).replace(/"/g, '""')}"`,
        `"${u.lot_number}"`,
        `"${u.current_bucket}"`,
        u.unit_cost,
        `"${u.created_at}"`,
        u.is_sold ? "Yes" : "No",
        u.status === 1 ? "Active" : "Inactive"
      ].join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `detailed_stock_units_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Detailed stock units exported successfully!");
  };

  // Summary counts
  const sellableCount = units.filter((u) => u.current_bucket === "sellable").length;
  const memoCount = units.filter((u) => u.current_bucket === "approval").length;
  const qcCount = units.filter((u) => ["quarantine", "repair"].includes(u.current_bucket)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.25)] text-brand-token shadow-xs">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-primary-token">
                  Detailed Stock & Barcode Report
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[rgba(0,210,210,0.12)] text-brand-token border border-[rgba(0,210,210,0.25)]">
                  Serialized Unit Registry
                </span>
              </div>
              <p className="text-xs text-secondary-token">
                Item-level physical barcode traceability showing tagged date, lot origin, bucket allocation, and unit valuation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface border border-token text-primary-token text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-brand-token" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchUnits}
            title="Refresh Registry"
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface border border-token text-muted-token hover:text-primary-token transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-token" : ""}`} />
          </button>
        </div>
      </div>

      {/* Compact Single-Line Metric Summary Bar (Zero KPI Cards) */}
      <div className="glass-panel px-4 py-3 rounded-2xl border border-token flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-secondary-token text-[11px] font-sans">Total Pcs: </span>
            <strong className="text-primary-token">{formatQty(totalCount)}</strong>
          </div>
          <div className="h-3.5 w-px bg-token hidden sm:block" />
          <div>
            <span className="text-secondary-token text-[11px] font-sans">Total Purchase Cost: </span>
            <strong className="text-emerald-400">
              {formatCurrency(units.reduce((acc, u) => acc + Number(u.unit_cost || 0), 0))}
            </strong>
          </div>
          <div className="h-3.5 w-px bg-token hidden sm:block" />
          <div>
            <span className="text-secondary-token text-[11px] font-sans">Total Approval Pcs: </span>
            <strong className="text-amber-400">{formatQty(memoCount)}</strong>
          </div>
          <div className="h-3.5 w-px bg-token hidden sm:block" />
          <div>
            <span className="text-secondary-token text-[11px] font-sans">Available Sellable: </span>
            <strong className="text-brand-token">{formatQty(sellableCount)}</strong>
          </div>
          <div className="h-3.5 w-px bg-token hidden sm:block" />
          <div>
            <span className="text-secondary-token text-[11px] font-sans">QC & Workshop: </span>
            <strong className="text-blue-400">{formatQty(qcCount)}</strong>
          </div>
        </div>
        <div className="text-[11px] text-muted-token font-sans">
          Item-level serialized physical units
        </div>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="glass-panel p-4 rounded-2xl border border-token flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Barcode Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-token absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Scan or type barcode (ITM-LOT...)..."
              value={searchBarcode}
              onChange={(e) => setSearchBarcode(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs font-mono"
            />
          </div>

          {/* Product Filter */}
          <div className="w-48">
            <select
              value={selectedProduct}
              onChange={(e) => { setSelectedProduct(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs truncate"
            >
              <option value="">— All Products —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Bucket Filter */}
          <div className="w-44">
            <select
              value={selectedBucket}
              onChange={(e) => { setSelectedBucket(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
            >
              <option value="">— All Buckets —</option>
              <option value="sellable">Sellable On-Hand</option>
              <option value="reserved">Order Reserved</option>
              <option value="approval">Approval / Memo</option>
              <option value="quarantine">Return Quarantine</option>
              <option value="repair">Alteration / Repair</option>
              <option value="damaged">Damaged / Scrap</option>
              <option value="sold">Sold & Dispatched</option>
            </select>
          </div>

          {/* Lot Filter */}
          <div className="w-36">
            <input
              type="text"
              placeholder="Filter by Lot No..."
              value={lotFilter}
              onChange={(e) => setLotFilter(e.target.value)}
              onBlur={() => { setPage(1); fetchUnits(); }}
              className="w-full px-3 py-1.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-1.5 rounded-xl bg-[var(--brand-secondary)] text-slate-950 font-semibold text-xs shadow-xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
        >
          Search
        </button>
      </form>

      {/* Main Units Table */}
      <div className="glass-panel rounded-2xl border border-token overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/60 text-secondary-token uppercase tracking-wider font-semibold border-b border-token">
              <tr>
                <th className="py-3 px-4"># Unit</th>
                <th className="py-3 px-4">Physical Barcode</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Lot Number</th>
                <th className="py-3 px-4">Current Bucket</th>
                <th className="py-3 px-4">Tagged Date</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-token text-primary-token">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-muted-token">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-token" />
                    Loading serialized inventory units...
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-muted-token">
                    <p className="font-semibold text-secondary-token mb-1">No tagged units found</p>
                    <p className="text-xs text-muted-token">Receive a purchase inward to auto-generate physical barcode tags.</p>
                  </td>
                </tr>
              ) : (
                units.map((u) => {
                  const bucketMeta = BUCKET_LABELS[u.current_bucket] || {
                    label: u.current_bucket,
                    color: "bg-surface-elevated text-secondary-token border-token"
                  };
                  return (
                    <tr key={u.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-muted-token">{u.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-brand-token bg-[rgba(0,210,210,0.08)] px-2 py-0.5 rounded border border-[rgba(0,210,210,0.2)]">
                            {u.item_barcode}
                          </span>
                          <button
                            onClick={() => handleCopyBarcode(u.item_barcode)}
                            title="Copy Barcode"
                            className="p-1 text-muted-token hover:text-primary-token transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-primary-token">
                          {u.product?.name || `Product #${u.product_id}`}
                        </div>
                        <span className="text-[10px] text-muted-token font-mono">
                          ID: {u.product_id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-secondary-token bg-surface-elevated px-2 py-0.5 rounded border border-token">
                          {u.lot_number}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${bucketMeta.color}`}>
                          {bucketMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-secondary-token font-mono text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-secondary-token">
                        {formatCurrency(u.unit_cost)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.is_sold ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/10 text-slate-400">
                            Sold
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setPrintUnit(u)}
                          title="Print Thermal Barcode Sticker"
                          className="p-1.5 rounded-lg bg-surface-elevated hover:bg-surface border border-token text-muted-token hover:text-brand-token transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-token flex items-center justify-between text-xs text-secondary-token">
          <span>
            Showing {units.length} of {totalCount} records (Page {page})
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-surface-elevated border border-token disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={units.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg bg-surface-elevated border border-token disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Barcode Sticker Preview Panel (Full-page inline section, zero popups) */}
      {printUnit && (
        <div className="glass-panel p-6 rounded-2xl border-2 border-[var(--brand-secondary)]/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-brand-token" />
              <h2 className="text-base font-bold text-primary-token">Thermal Barcode Sticker Preview (50mm × 25mm)</h2>
            </div>
            <button
              onClick={() => setPrintUnit(null)}
              className="text-xs text-muted-token hover:text-primary-token cursor-pointer"
            >
              Close Preview
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-xl bg-black/40 border border-token">
            {/* The Physical Sticker Box */}
            <div className="w-72 h-36 bg-white text-black p-3 rounded-lg shadow-xl flex flex-col justify-between border border-slate-300 font-sans">
              <div className="border-b border-black/20 pb-1">
                <div className="text-[11px] font-bold truncate uppercase tracking-tight text-black">
                  {printUnit.product?.name || `Product #${printUnit.product_id}`}
                </div>
                <div className="flex items-center justify-between text-[9px] text-gray-700 font-mono">
                  <span>LOT: {printUnit.lot_number}</span>
                  <span>ID: {printUnit.id}</span>
                </div>
              </div>

              {/* Simulated 1D Barcode Graphic */}
              <div className="flex flex-col items-center my-1">
                <div className="h-10 w-full flex items-center justify-center gap-[2px] bg-white px-2">
                  {Array.from({ length: 38 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-full ${idx % 3 === 0 ? "w-1 bg-black" : idx % 5 === 0 ? "w-1.5 bg-black" : "w-[2px] bg-black"}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-black">
                  {printUnit.item_barcode}
                </span>
              </div>

              <div className="border-t border-black/20 pt-1 flex items-center justify-between text-[10px] font-bold text-black">
                <span>BUCKET: {printUnit.current_bucket.toUpperCase()}</span>
                <span className="font-mono">MRP: ₹{Number(printUnit.unit_cost * 1.5).toFixed(0)}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-secondary-token max-w-md">
              <p className="font-semibold text-primary-token">Thermal Label Dispatch:</p>
              <p>Ready to transmit to Zebra/TVS-E/TSC thermal barcode printers. Standard 2" × 1" (50mm × 25mm) continuous roll label layout.</p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[var(--brand-secondary)] text-slate-950 font-bold text-xs shadow-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Print Label Now
                </button>
                <button
                  onClick={() => setPrintUnit(null)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated border border-token text-xs text-primary-token cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
