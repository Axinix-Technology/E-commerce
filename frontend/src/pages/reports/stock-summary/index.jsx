import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Search,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  Boxes,
  Camera,
  Wrench,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  FileSpreadsheet
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency, formatInwardQty, formatOutwardQty } from "../../../utils/formatters";

export default function StockSummaryReportPage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const firstOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [categoryId, setCategoryId] = useState("");
  const [productId, setProductId] = useState("");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({
    total_products: 0,
    total_opening: 0,
    total_inward: 0,
    total_outward: 0,
    total_closing: 0,
    total_valuation: 0,
  });

  useEffect(() => {
    // Fetch dropdown categories & products
    populateApi.read("category_master", { limit: 100, sort: ["name"] }).then((res) => {
      if (res?.data) setCategories(res.data);
    });
    populateApi.read("product_type", { limit: 200, sort: ["name"] }).then((res) => {
      if (res?.data) setProducts(res.data);
    });
  }, []);

  const fetchStockReport = async () => {
    setLoading(true);
    try {
      const res = await populateApi.report("stock_ledger", {
        filter: {
          start_date: startDate,
          end_date: endDate,
          category_id: categoryId || undefined,
          product_id: productId || undefined,
        },
      });

      if (res?.success) {
        setReportData(res.data || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to generate stock summary report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockReport();
  }, [startDate, endDate, categoryId, productId]);

  const handleExportCSV = () => {
    if (reportData.length === 0) {
      toast.error("No report data available to export.");
      return;
    }

    const headers = [
      "Product ID",
      "Product Name",
      "Category",
      "Brand",
      "Opening Stock",
      "Inward (+)",
      "Outward (-)",
      "Closing Stock",
      "Sellable Stock",
      "In Approval Memo",
      "In Return Quarantine",
      "In Repair Workshop",
      "Unit Price (INR)",
      "Total Valuation (INR)",
    ];

    const csvRows = [headers.join(",")];

    reportData.forEach((row) => {
      csvRows.push([
        row.product_id,
        `"${row.product_name.replace(/"/g, '""')}"`,
        `"${(row.category_name || "").replace(/"/g, '""')}"`,
        `"${(row.brand || "").replace(/"/g, '""')}"`,
        row.opening,
        row.inward,
        row.outward,
        row.closing,
        row.sellable,
        row.approval,
        row.quarantine,
        row.repair,
        row.unit_price,
        row.valuation,
      ].join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `stock_summary_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Stock summary report exported to CSV successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.25)] text-brand-token shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-primary-token">
                  Stock In / Out Summary Report
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[rgba(0,210,210,0.12)] text-brand-token border border-[rgba(0,210,210,0.25)]">
                  Aggregated Ledger
                </span>
              </div>
              <p className="text-xs text-secondary-token">
                4-Pillar inventory movement analysis (Opening Balance → Inward Receipts → Outward Dispatches → Closing Stock).
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
            onClick={fetchStockReport}
            title="Refresh Report"
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface border border-token text-muted-token hover:text-primary-token transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-token" : ""}`} />
          </button>
        </div>
      </div>

      {/* Date & Filter Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-token flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-xl border border-token">
            <Calendar className="w-3.5 h-3.5 text-muted-token" />
            <span className="text-secondary-token font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-primary-token focus:outline-none font-mono text-xs cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-surface-elevated px-3 py-1.5 rounded-xl border border-token">
            <Calendar className="w-3.5 h-3.5 text-muted-token" />
            <span className="text-secondary-token font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-primary-token focus:outline-none font-mono text-xs cursor-pointer"
            />
          </div>

          <div className="w-44">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs"
            >
              <option value="">— All Categories —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-surface-elevated border border-token text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] text-xs truncate"
            >
              <option value="">— All Products —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-secondary-token">
          <span>Period: <strong className="text-primary-token">{startDate}</strong> to <strong className="text-primary-token">{endDate}</strong></span>
        </div>
      </div>

      {/* Compact Single-Line Metric Summary Bar (Zero Bulky Cards) */}
      <div className="glass-panel px-4 py-3 rounded-2xl border border-token flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-secondary-token text-[11px] font-sans">Opening: </span>
            <strong className="text-primary-token">{formatQty(summary.total_opening)}</strong>
          </div>
          <div className="h-3.5 w-px bg-token hidden sm:block" />
          <div>
            <span className="text-secondary-token text-[11px] font-sans">Inward (+): </span>
            <strong className="text-emerald-400">{formatInwardQty(summary.total_inward)}</strong>
          </div>
          <div className="h-3.5 w-px bg-token hidden sm:block" />
          <div>
            <span className="text-secondary-token text-[11px] font-sans">Outward (-): </span>
            <strong className="text-rose-400">{formatOutwardQty(summary.total_outward)}</strong>
          </div>
          <div className="h-3.5 w-px bg-token hidden sm:block" />
          <div>
            <span className="text-secondary-token text-[11px] font-sans">Closing (=): </span>
            <strong className="text-brand-token">{formatQty(summary.total_closing)}</strong>
          </div>
          <div className="h-3.5 w-px bg-token hidden sm:block" />
          <div>
            <span className="text-secondary-token text-[11px] font-sans">Valuation: </span>
            <strong className="text-emerald-400">{formatCurrency(summary.total_valuation)}</strong>
          </div>
        </div>
        <div className="text-[11px] text-muted-token font-sans">
          Period: {startDate} to {endDate}
        </div>
      </div>

      {/* Main Ledger Grid */}
      <div className="glass-panel rounded-2xl border border-token overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/60 text-secondary-token uppercase tracking-wider font-semibold border-b border-token">
              <tr>
                <th className="py-3 px-4"># ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Opening</th>
                <th className="py-3 px-4 text-center text-emerald-400">Inward (+)</th>
                <th className="py-3 px-4 text-center text-rose-400">Outward (-)</th>
                <th className="py-3 px-4 text-center font-bold text-brand-token">Closing (=)</th>
                <th className="py-3 px-4 text-center">Sellable (ATP)</th>
                <th className="py-3 px-4 text-center">Approval / PR</th>
                <th className="py-3 px-4 text-center">QC / Repair</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Valuation (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-token text-primary-token">
              {loading ? (
                <tr>
                  <td colSpan="12" className="py-16 text-center text-muted-token">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-token" />
                    Calculating dynamic stock ledger balances...
                  </td>
                </tr>
              ) : reportData.length === 0 ? (
                <tr>
                  <td colSpan="12" className="py-16 text-center text-muted-token">
                    <p className="font-semibold text-secondary-token mb-1">No stock movements found for the selected period</p>
                    <p className="text-xs text-muted-token">Try selecting a broader date range or removing category filters.</p>
                  </td>
                </tr>
              ) : (
                reportData.map((row) => (
                  <tr key={row.product_id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-muted-token">{row.product_id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-primary-token">{row.product_name}</div>
                      {row.brand && <span className="text-[10px] text-muted-token font-mono">{row.brand}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-surface-elevated border border-token text-[11px]">
                        {row.category_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-secondary-token">
                      {formatQty(row.opening)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-400">
                      {formatInwardQty(row.inward)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-rose-400">
                      {formatOutwardQty(row.outward)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-brand-token">
                      {formatQty(row.closing)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400 bg-emerald-500/5">
                      {formatQty(row.sellable)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-secondary-token">
                      {row.approval > 0 ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-semibold">
                          <Camera className="w-3 h-3" /> {formatQty(row.approval)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-secondary-token">
                      {row.quarantine + row.repair > 0 ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-semibold">
                          <Wrench className="w-3 h-3" /> {formatQty(row.quarantine + row.repair)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-secondary-token">
                      {formatCurrency(row.unit_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                      {formatCurrency(row.valuation)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
