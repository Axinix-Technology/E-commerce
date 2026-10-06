import React, { useState, useEffect } from "react";
import {
  Barcode,
  Boxes,
  Printer,
  Copy,
  Download,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Input, Select, Table, Badge, FilterBar } from "../../../components/ui";

const BUCKET_VARIANTS = {
  sellable: { label: "Sellable On-Hand", variant: "emerald" },
  reserved: { label: "Order Reserved", variant: "brand" },
  approval: { label: "Approval / Memo", variant: "amber" },
  quarantine: { label: "Return Quarantine", variant: "blue" },
  repair: { label: "Alteration / Repair", variant: "cyan" },
  damaged: { label: "Damaged / Scrap", variant: "rose" },
  sold: { label: "Sold & Dispatched", variant: "neutral" },
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

  useEffect(() => {
    populateApi.read("product_type", { limit: 200, sort: ["name"] }).then((res) => {
      const list = Array.isArray(res) ? res : res?.data || [];
      setProducts(list);
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
          inward_item: ["id", "lot_number", "unit_cost", "inward_id"],
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        sort: ["-created_at", "-id"],
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      setUnits(list);
      setTotalCount(res?.total || res?.count || list.length);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load detailed stock units");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [page, selectedProduct, selectedBucket, startDate, endDate]);

  const handleCopyBarcode = (barcode) => {
    navigator.clipboard.writeText(barcode);
    toast.success(`Copied: ${barcode}`);
  };

  const handleExportCSV = () => {
    const headers = "Barcode,Lot Number,Product,Bucket,Unit Cost,Tagged Date\n";
    const rows = units
      .map(
        (u) =>
          `"${u.item_barcode}","${u.lot_number || "—"}","${u.product?.name || "Item"}","${u.current_bucket || "sellable"}",${u.inward_item?.unit_cost || 0},"${u.created_at || "—"}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `detailed-stock-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Detailed stock CSV exported!");
  };

  const columns = [
    {
      key: "item_barcode",
      header: "Unit Barcode",
      render: (val) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-brand-token">
          <span>{val}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyBarcode(val);
            }}
            title="Copy barcode"
            className="text-muted-token hover:text-primary-token cursor-pointer p-0.5"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      ),
    },
    {
      key: "product",
      header: "Product / Item",
      render: (val) => (
        <span className="font-semibold text-primary-token">{val?.name || "Standard Unit"}</span>
      ),
    },
    {
      key: "lot_number",
      header: "Lot #",
      render: (val, row) => (
        <span className="font-mono text-xs text-secondary-token">
          {val || row.inward_item?.lot_number || "—"}
        </span>
      ),
    },
    {
      key: "current_bucket",
      header: "Stock Bucket",
      render: (val) => {
        const config = BUCKET_VARIANTS[val] || { label: val || "Sellable", variant: "neutral" };
        return (
          <Badge variant={config.variant} dot>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "unit_cost",
      header: "Cost / Unit",
      align: "right",
      render: (_, row) => (
        <span className="font-mono text-xs text-secondary-token">
          {formatCurrency(row.inward_item?.unit_cost)}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Tagged Date",
      render: (val) => (
        <span className="text-secondary-token text-xs">
          {val ? new Date(val).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Barcode className="w-5 h-5 text-brand-token" />
            Detailed Unit-Level Stock Ledger
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Audit serialized barcode tags, lot trackings, and physical inventory buckets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Serialized Units: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Current Page: <strong className="text-primary-token font-medium">{formatQty(units.length)} pcs</strong></span>
        <span>•</span>
        <span>Tracked Lots: <strong className="text-brand-token font-medium">Batch Serialized</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={searchBarcode}
        onSearchChange={setSearchBarcode}
        searchPlaceholder="Scan or type barcode / lot #..."
        filters={
          <>
            <Select
              size="xs"
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              options={[
                { label: "All Stock Buckets", value: "" },
                { label: "Sellable On-Hand", value: "sellable" },
                { label: "Order Reserved", value: "reserved" },
                { label: "Approval / Memo", value: "approval" },
                { label: "Return Quarantine", value: "quarantine" },
                { label: "Alteration / Repair", value: "repair" },
                { label: "Damaged / Scrap", value: "damaged" },
                { label: "Sold & Dispatched", value: "sold" },
              ]}
            />
            <Select
              size="xs"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              placeholder="All Products"
              options={products.map((p) => ({ value: p.id, label: p.name }))}
            />
          </>
        }
        onReset={() => {
          setSearchBarcode("");
          setSelectedBucket("");
          setSelectedProduct("");
          setLotFilter("");
          setStartDate("");
          setEndDate("");
          setPage(1);
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchUnits}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Reusable Data Table */}
      <Table
        columns={columns}
        data={units}
        loading={loading}
        emptyMessage="No serialized stock units found matching your criteria."
      />

      {/* Pagination Bar */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-token">
          <span>Page {page} of {Math.ceil(totalCount / pageSize)} ({formatQty(totalCount)} total units)</span>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="xs"
              variant="outline"
              disabled={page >= Math.ceil(totalCount / pageSize)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
