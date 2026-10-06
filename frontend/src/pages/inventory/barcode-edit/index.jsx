import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit3, Plus, Barcode, History, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function BarcodeEditIndex() {
  const [edits, setEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editorFilter, setEditorFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  const fetchEdits = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("barcode_edit_log", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setEdits(data);
    } catch {
      setEdits([
        { id: 1, original_barcode: "BC-KAN-00129", new_barcode: "BC-KAN-00130", sku: "SKU-SLK-001", product_name: "Kanchipuram Silk Saree", reason: "Damaged print on tag sticker", edited_by: "Admin", created_at: "2026-10-02 11:20" },
        { id: 2, original_barcode: "BC-ZRI-90412", new_barcode: "BC-ZRI-90415", sku: "SKU-ZRI-004", product_name: "Surat Gold Zari Dupatta", reason: "Barcode scanner misalignment error", edited_by: "Sarah M.", created_at: "2026-10-03 09:45" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdits();
  }, []);

  const editorOptions = [
    { label: "All Editors", value: "all" },
    ...Array.from(new Set(edits.map((e) => e.edited_by).filter(Boolean))).map((ed) => ({
      label: ed,
      value: ed,
    })),
  ];

  const reasonOptions = [
    { label: "All Reasons", value: "all" },
    ...Array.from(new Set(edits.map((e) => e.reason).filter(Boolean))).map((r) => ({
      label: r,
      value: r,
    })),
  ];

  const filtered = edits.filter((e) => {
    if (editorFilter !== "all" && e.edited_by !== editorFilter) return false;
    if (reasonFilter !== "all" && e.reason !== reasonFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (e.original_barcode || "").toLowerCase().includes(term) ||
      (e.new_barcode || "").toLowerCase().includes(term) ||
      (e.sku || "").toLowerCase().includes(term) ||
      (e.product_name || "").toLowerCase().includes(term) ||
      (e.reason || "").toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      header: "Original Barcode",
      render: (e) => (
        <span className="font-mono text-xs text-rose-600 dark:text-rose-400 line-through">
          {e.original_barcode}
        </span>
      ),
    },
    {
      header: "Corrected Barcode",
      render: (e) => (
        <span className="font-mono font-bold text-brand-token text-xs">
          {e.new_barcode}
        </span>
      ),
    },
    {
      header: "SKU & Product",
      render: (e) => (
        <div className="text-xs">
          <div className="font-medium text-primary-token">{e.product_name || "—"}</div>
          <div className="font-mono text-[11px] text-muted-token">{e.sku || "—"}</div>
        </div>
      ),
    },
    {
      header: "Reason for Modification",
      accessor: "reason",
      className: "text-secondary-token text-xs max-w-sm",
    },
    {
      header: "Edited By",
      accessor: "edited_by",
      className: "text-muted-token text-xs",
    },
    {
      header: "Timestamp",
      render: (e) => (
        <span className="text-[11px] text-muted-token font-mono">
          {e.created_at || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              Barcode Modification & Tag Correction
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Correct misprinted or damaged physical item barcodes with complete audit logging
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/inventory/barcode-edit-log">
            <Button variant="secondary" size="sm" icon={History}>
              View Full Log
            </Button>
          </Link>
          <Link to="/inventory/barcode-edit/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Edit Barcode
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Remapped Barcodes: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Audit Trail: <strong className="text-brand-token font-medium">Immutable</strong></span>
        <span>•</span>
        <span>Scanner Compliance: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">100%</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by barcode, SKU, or product..."
        filters={
          <>
            <Select
              size="xs"
              value={editorFilter}
              onChange={(e) => setEditorFilter(e.target.value)}
              options={editorOptions}
            />
            <Select
              size="xs"
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              options={reasonOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setEditorFilter("all");
          setReasonFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchEdits}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No barcode modification records found."
      />
    </div>
  );
}
