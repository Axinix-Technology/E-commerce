import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PackageCheck,
  Plus,
  Search,
  RefreshCw,
  Building2,
  Calendar,
  FileText,
  Barcode,
  Eye,
  CheckCircle2,
  Clock
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function PurchaseInwardListPage() {
  const [inwards, setInwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Barcode modal replacement: dedicated slideout/drawer or view section
  const [selectedInward, setSelectedInward] = useState(null);
  const [barcodes, setBarcodes] = useState([]);
  const [loadingBarcodes, setLoadingBarcodes] = useState(false);

  const fetchInwards = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["inward_number.icontains"] = search.trim();
      }

      const res = await populateApi.read("purchase_inward", {
        filter,
        page,
        limit: 10,
        populate: {
          vendor: ["id", "name", "vendor_code"],
        },
        sort: ["-id"],
      });

      if (res?.data) {
        setInwards(res.data);
        setTotalCount(res.count || 0);
        setTotalPages(res.metadata?.total_pages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load purchase inwards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInwards();
  }, [page, search]);

  const viewBarcodes = async (inward) => {
    setSelectedInward(inward);
    setLoadingBarcodes(true);
    try {
      const res = await populateApi.read("tagged_unit", {
        filter: { "inward_item.inward_id": inward.id },
        limit: 500,
        populate: { product: ["name"] },
      });
      if (res?.data) {
        setBarcodes(res.data);
      }
    } catch (err) {
      toast.error("Failed to fetch generated barcodes");
    } finally {
      setLoadingBarcodes(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.25)] text-brand-token shadow-xs">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-primary-token">Purchase Inward (GRN)</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[rgba(0,210,210,0.12)] text-brand-token border border-[rgba(0,210,210,0.25)]">
                  {totalCount} GRNs
                </span>
              </div>
              <p className="text-xs text-secondary-token">
                Warehouse goods receipt notes, lot allocations, cost pricing, and physical barcode stickers.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/inward/purchase/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Inward Entry</span>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-token flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-token absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by GRN or inward number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-elevated border border-token text-xs text-primary-token font-mono focus:outline-none focus:border-[var(--brand-secondary)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-secondary-token">
          <span>Total: <strong className="text-primary-token font-mono">{totalCount}</strong></span>
          <button
            onClick={fetchInwards}
            title="Refresh list"
            className="p-1.5 rounded-lg hover:bg-surface-elevated text-muted-token hover:text-primary-token transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-token" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-2xl border border-token overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/60 text-secondary-token uppercase tracking-wider font-semibold border-b border-token">
              <tr>
                <th className="py-3 px-4"># GRN No</th>
                <th className="py-3 px-4">Vendor / Supplier</th>
                <th className="py-3 px-4">Invoice No & Date</th>
                <th className="py-3 px-4">Inward Date</th>
                <th className="py-3 px-4 text-right">Taxable (₹)</th>
                <th className="py-3 px-4 text-right">Tax (₹)</th>
                <th className="py-3 px-4 text-right">Total Amount (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Barcodes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-token text-primary-token">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-muted-token">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-token" />
                    Loading purchase inwards...
                  </td>
                </tr>
              ) : inwards.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-muted-token">
                    <p className="font-semibold text-secondary-token mb-1">No purchase inwards found</p>
                    <p className="text-xs text-muted-token mb-3">Record physical stock arrivals to create lots and barcodes.</p>
                    <Link
                      to="/inward/purchase/create"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Inward Entry
                    </Link>
                  </td>
                </tr>
              ) : (
                inwards.map((inw) => (
                  <tr key={inw.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-token">{inw.inward_number}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-primary-token">{inw.vendor?.name || "—"}</div>
                      {inw.vendor?.vendor_code && (
                        <span className="text-[10px] text-muted-token font-mono">{inw.vendor.vendor_code}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-secondary-token font-semibold">
                        <FileText className="w-3 h-3 inline mr-1 text-muted-token" />
                        {inw.invoice_number}
                      </div>
                      <div className="text-[10px] text-muted-token">
                        {inw.invoice_date}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-secondary-token font-mono">
                      {inw.inward_date}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-secondary-token">
                      ₹{parseFloat(inw.total_taxable_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-secondary-token">
                      ₹{parseFloat(inw.total_tax_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      ₹{parseFloat(inw.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Stocked
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => viewBarcodes(inw)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface border border-token text-brand-token text-[11px] font-mono cursor-pointer transition-colors"
                        title="View & Print Barcode Tags"
                      >
                        <Barcode className="w-3.5 h-3.5" />
                        <span>Tags</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-token flex items-center justify-between text-xs text-secondary-token">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-token disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-token disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Barcodes View Section (Clean inline panel, NO POPUP) */}
      {selectedInward && (
        <div className="glass-panel p-6 rounded-2xl border border-brand-token/30 space-y-4 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-token">
            <div>
              <h2 className="text-sm font-bold text-primary-token flex items-center gap-2">
                <Barcode className="w-4 h-4 text-brand-token" />
                Physical Item Barcode Stickers for {selectedInward.inward_number}
              </h2>
              <p className="text-xs text-secondary-token mt-0.5">
                Vendor: <strong className="text-primary-token">{selectedInward.vendor?.name}</strong> | Bill #{selectedInward.invoice_number}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface border border-token text-xs font-semibold text-primary-token cursor-pointer"
              >
                Print Stickers
              </button>
              <button
                onClick={() => setSelectedInward(null)}
                className="px-3 py-1.5 rounded-xl border border-token text-secondary-token hover:bg-surface-elevated text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>

          {loadingBarcodes ? (
            <div className="py-8 text-center text-muted-token text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-token" />
              Loading barcode stickers...
            </div>
          ) : barcodes.length === 0 ? (
            <div className="py-6 text-center text-muted-token text-xs">
              No individual item tags generated for this inward.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto pr-1">
              {barcodes.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-surface-elevated border border-token text-center space-y-1 hover:border-brand-token transition-colors"
                >
                  <span className="block text-[10px] font-mono text-muted-token">{b.lot_number}</span>
                  <span className="block font-mono font-bold text-xs text-brand-token tracking-wide">
                    {b.item_barcode}
                  </span>
                  <span className="block text-[11px] font-medium text-primary-token truncate" title={b.product_name}>
                    {b.product_name}
                  </span>
                  <span className="inline-block px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold text-emerald-400 bg-emerald-500/10">
                    Cost: ₹{parseFloat(b.unit_cost).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
