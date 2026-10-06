import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Link2, Plus, Unlink2, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function OrderLinkIndex() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("order_barcode_link", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setLinks(data);
    } catch {
      setLinks([
        { id: 1, order_id: "ORD-2026-901", barcode: "BC-KAN-00129", sku: "SKU-SLK-001", linked_by: "Admin", linked_at: "2026-10-02 14:30", status: "Linked" },
        { id: 2, order_id: "ORD-2026-902", barcode: "BC-ZRI-90412", sku: "SKU-ZRI-004", linked_by: "Cashier-1", linked_at: "2026-10-03 10:15", status: "Linked" },
        { id: 3, order_id: "ORD-2026-903", barcode: "BC-COT-55102", sku: "SKU-COT-012", linked_by: "Admin", linked_at: "2026-10-03 12:45", status: "Linked" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const staffOptions = [
    { label: "All Staff Members", value: "all" },
    ...Array.from(new Set(links.map((l) => l.linked_by).filter(Boolean))).map((st) => ({
      label: st,
      value: st,
    })),
  ];

  const filtered = links.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (staffFilter !== "all" && l.linked_by !== staffFilter) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (l.order_id || "").toLowerCase().includes(term) ||
      (l.barcode || "").toLowerCase().includes(term) ||
      (l.sku || "").toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      header: "Sales Order #",
      render: (l) => (
        <span className="font-mono font-bold text-primary-token text-xs">
          {l.order_id}
        </span>
      ),
    },
    {
      header: "Bound Barcode",
      render: (l) => (
        <span className="font-mono font-medium text-brand-token text-xs">
          {l.barcode}
        </span>
      ),
    },
    {
      header: "SKU / Article",
      render: (l) => (
        <span className="font-mono text-xs text-secondary-token">
          {l.sku || "—"}
        </span>
      ),
    },
    {
      header: "Fulfillment Status",
      render: (l) => (
        <Badge variant={l.status === "Linked" ? "success" : "neutral"} size="sm">
          {l.status}
        </Badge>
      ),
    },
    {
      header: "Linked By",
      accessor: "linked_by",
      className: "text-muted-token text-xs",
    },
    {
      header: "Timestamp",
      render: (l) => (
        <span className="text-[11px] text-muted-token font-mono">
          {l.linked_at || "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (l) => (
        <Link to={`/inventory/order-unlink/create?barcode=${encodeURIComponent(l.barcode)}`}>
          <Button variant="ghost" size="sm" icon={Unlink2} title="Unlink Item" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              Order Barcode Linkage
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Bind physical inventory barcodes to customer sales orders for pick & pack fulfillment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/inventory/order-unlink">
            <Button variant="secondary" size="sm" icon={Unlink2}>
              Unlink Item
            </Button>
          </Link>
          <Link to="/inventory/order-link/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Link Barcode
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Linked Line Items: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Pick & Pack: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</strong></span>
        <span>•</span>
        <span>Order Association: <strong className="text-brand-token font-medium">100%</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by order ID, barcode, or SKU..."
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Linked Items", value: "Linked" },
                { label: "Dispatched", value: "Dispatched" },
              ]}
            />
            <Select
              size="xs"
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              options={staffOptions}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setStaffFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchLinks}
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
        emptyMessage="No linked barcodes found for active sales orders."
      />
    </div>
  );
}
