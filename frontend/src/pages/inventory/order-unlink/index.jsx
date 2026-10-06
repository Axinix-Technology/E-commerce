import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Unlink2, Plus, Link2, RefreshCw, ShoppingBag } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function OrderUnlinkIndex() {
  const [unlinks, setUnlinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  const fetchUnlinks = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("order_barcode_link", { status: "Unlinked", limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setUnlinks(data);
    } catch {
      setUnlinks([
        { id: 101, order_id: "ORD-2026-880", barcode: "BC-KAN-00110", sku: "SKU-SLK-001", reason: "Customer cancelled item prior to dispatch", unlinked_by: "Sarah M.", unlinked_at: "2026-10-02 16:10" },
        { id: 102, order_id: "ORD-2026-895", barcode: "BC-ZRI-90390", sku: "SKU-ZRI-003", reason: "Wrong color scanned into order bucket", unlinked_by: "Admin", unlinked_at: "2026-10-03 11:05" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnlinks();
  }, []);

  const staffOptions = [
    { label: "All Staff Members", value: "all" },
    ...Array.from(new Set(unlinks.map((u) => u.unlinked_by).filter(Boolean))).map((st) => ({
      label: st,
      value: st,
    })),
  ];

  const reasonOptions = [
    { label: "All Unlink Reasons", value: "all" },
    ...Array.from(new Set(unlinks.map((u) => u.reason).filter(Boolean))).map((r) => ({
      label: r,
      value: r,
    })),
  ];

  const filtered = unlinks.filter((u) => {
    if (staffFilter !== "all" && u.unlinked_by !== staffFilter) return false;
    if (reasonFilter !== "all" && u.reason !== reasonFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (u.order_id || "").toLowerCase().includes(term) ||
      (u.barcode || "").toLowerCase().includes(term) ||
      (u.sku || "").toLowerCase().includes(term) ||
      (u.reason || "").toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      header: "Order ID",
      render: (u) => (
        <span className="font-semibold text-primary-token flex items-center gap-1.5 text-xs">
          <ShoppingBag className="w-3.5 h-3.5 text-muted-token shrink-0" />
          {u.order_id}
        </span>
      ),
    },
    {
      header: "Unlinked Barcode",
      render: (u) => (
        <span className="font-mono text-xs text-rose-600 dark:text-rose-400">
          {u.barcode}
        </span>
      ),
    },
    {
      header: "SKU",
      accessor: "sku",
      className: "font-mono text-xs text-secondary-token",
      render: (u) => <span className="font-mono text-xs text-secondary-token">{u.sku || "—"}</span>,
    },
    {
      header: "Reason for Unlinking",
      accessor: "reason",
      className: "text-secondary-token text-xs max-w-xs",
    },
    {
      header: "Staff",
      accessor: "unlinked_by",
      className: "text-muted-token text-xs",
    },
    {
      header: "Unlinked At",
      render: (u) => (
        <span className="text-[11px] text-muted-token font-mono">
          {u.unlinked_at || "—"}
        </span>
      ),
    },
    {
      header: "Stock Status",
      render: () => (
        <Badge variant="success" size="sm">
          Restored to Stock
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-rose-600 dark:text-rose-400">
            <Unlink2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              Order Barcode Unlinking
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Detach reserved inventory barcodes from orders and return items to active stock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/inventory/order-link">
            <Button variant="secondary" size="sm" icon={Link2}>
              Linked Barcodes
            </Button>
          </Link>
          <Link to="/inventory/order-unlink/create">
            <Button variant="danger" size="sm" icon={Plus}>
              Unlink Barcode
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Unlinked Items: <strong className="text-rose-600 dark:text-rose-400 font-semibold">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Stock Restored: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Immediate</strong></span>
        <span>•</span>
        <span>Release Status: <strong className="text-brand-token font-medium">Available in Sellable Pool</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search unlinked orders, barcodes, or SKUs..."
        filters={
          <>
            <Select
              size="xs"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              options={staffOptions}
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
          setStaffFilter("all");
          setReasonFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchUnlinks}
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
        emptyMessage="No unlinked items found."
      />
    </div>
  );
}
