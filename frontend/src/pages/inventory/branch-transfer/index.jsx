import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Network,
  Truck,
  Plus,
  RefreshCw,
  FileText,
  Printer,
  X
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty } from "../../../utils/formatters";
import { Button, Table, FilterBar, Select, Badge } from "../../../components/ui";

const SOURCE_OPTIONS = [
  { value: "ALL", label: "All Sources" },
  { value: "WH-CENTRAL", label: "Chennai HQ" },
  { value: "BR-MUMBAI", label: "Mumbai" },
  { value: "BR-DELHI", label: "Delhi" },
  { value: "BR-BLR", label: "Bengaluru" },
  { value: "STORE-EXPRESS", label: "Retail Store" },
];

const DEST_OPTIONS = [
  { value: "ALL", label: "All Destinations" },
  { value: "WH-CENTRAL", label: "Chennai HQ" },
  { value: "BR-MUMBAI", label: "Mumbai" },
  { value: "BR-DELHI", label: "Delhi" },
  { value: "BR-BLR", label: "Bengaluru" },
  { value: "STORE-EXPRESS", label: "Retail Store" },
];

export default function BranchTransferListingPage() {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [destFilter, setDestFilter] = useState("ALL");

  // Selected Challan for Modal preview
  const [activeChallan, setActiveChallan] = useState(null);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("stock_ledger", {
        filter: { movement_type: "branch_transfer_outward" },
        limit: 100,
        sort: ["-id"],
        populate: { product: ["id", "name"] }
      });
      if (res?.data && Array.isArray(res.data)) {
        setTransfers(res.data);
      } else {
        setTransfers([]);
      }
    } catch {
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const query = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (t.reference_id && t.reference_id.toLowerCase().includes(query)) ||
        (t.product?.name && t.product.name.toLowerCase().includes(query)) ||
        (t.remarks && t.remarks.toLowerCase().includes(query));

      const matchSource =
        sourceFilter === "ALL" || (t.remarks && t.remarks.includes(sourceFilter));
      const matchDest =
        destFilter === "ALL" || (t.remarks && t.remarks.includes(destFilter));

      return matchSearch && matchSource && matchDest;
    });
  }, [transfers, searchTerm, sourceFilter, destFilter]);

  // Aggregate stats
  const totalUnits = useMemo(() => {
    return transfers.reduce((sum, t) => sum + (Math.abs(t.quantity) || 0), 0);
  }, [transfers]);

  const uniqueProducts = useMemo(() => {
    const ids = new Set(transfers.map((t) => t.product_id).filter(Boolean));
    return ids.size;
  }, [transfers]);

  // Table Columns Definition
  const columns = [
    {
      key: "id",
      header: "# ID",
      width: "70px",
      render: (val) => <span className="font-mono text-muted-token">#{val}</span>
    },
    {
      key: "reference_id",
      header: "DC Challan #",
      render: (val, row) => (
        <span className="font-mono font-bold text-brand-token">
          {val || `DC-TR-${row.id}`}
        </span>
      )
    },
    {
      key: "product",
      header: "Product Name",
      render: (val, row) => (
        <span className="font-medium text-primary-token">
          {val?.name || `Product #${row.product_id}`}
        </span>
      )
    },
    {
      key: "remarks",
      header: "Transfer Route",
      render: (val) => {
        const route = (val || "").split("|")[0]?.trim() || "Branch Route";
        return <span className="font-semibold text-secondary-token text-xs">{route}</span>;
      }
    },
    {
      key: "quantity",
      header: "Dispatched Qty",
      align: "center",
      render: (val) => (
        <span className="font-mono font-bold text-rose-400">
          -{formatQty(Math.abs(val))}
        </span>
      )
    },
    {
      key: "logistics",
      header: "Vehicle / Driver",
      render: (_, row) => {
        const parts = (row.remarks || "").split("|").map((p) => p.trim());
        const vehicle = parts[1] || "Direct Courier";
        const phone = parts[2] || "";
        return (
          <div className="text-[11px] text-muted-token">
            <div>{vehicle}</div>
            {phone && <div className="text-[10px] text-secondary-token">{phone}</div>}
          </div>
        );
      }
    },
    {
      key: "created_at",
      header: "Dispatch Date",
      render: (val) => (
        <span className="text-secondary-token whitespace-nowrap text-[11px]">
          {val ? new Date(val).toLocaleDateString("en-IN") : "—"}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: () => (
        <Badge variant="cyan" size="sm" dot>
          In Transit
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (_, row) => {
        const parts = (row.remarks || "").split("|").map((p) => p.trim());
        return (
          <Button
            variant="outline"
            size="xs"
            icon={FileText}
            onClick={() => {
              setActiveChallan({
                dcNumber: row.reference_id || `DC-TR-${row.id}`,
                productName: row.product?.name || `Product #${row.product_id}`,
                quantity: Math.abs(row.quantity),
                route: parts[0] || "Branch Route",
                vehicle: parts[1] || "N/A",
                contact: parts[2] || "N/A",
                date: row.created_at ? new Date(row.created_at).toLocaleString("en-IN") : new Date().toLocaleString("en-IN")
              });
            }}
          >
            View DC
          </Button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.25)] text-brand-token shadow-xs">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-primary-token">
                Inter-Branch Stock Transfers
              </h1>
              <Badge variant="brand" size="xs">
                Multi-Location Logistics
              </Badge>
            </div>
            <p className="text-xs text-secondary-token">
              Audit log and dispatch records for inventory moving between warehouses, distribution hubs, and retail stores.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchTransfers}
            title="Refresh List"
          />

          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => navigate("/inventory/branch-transfer/create")}
          >
            Dispatch New Transfer
          </Button>
        </div>
      </div>

      {/* Sleek Single-Line Summary Metric Bar (Rule 15: Zero as Dash) */}
      <div className="glass-panel px-4 py-3 rounded-2xl border border-token flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-secondary-token font-medium">Total Transfers:</span>
            <span className="font-mono font-bold text-primary-token">{formatQty(transfers.length)}</span>
          </div>
          <div className="h-3.5 w-[1px] bg-border-token hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-secondary-token font-medium">Total Dispatched Units:</span>
            <span className="font-mono font-bold text-cyan-400">{formatQty(totalUnits)}</span>
          </div>
          <div className="h-3.5 w-[1px] bg-border-token hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-secondary-token font-medium">Products Moving:</span>
            <span className="font-mono font-bold text-brand-token">{formatQty(uniqueProducts)}</span>
          </div>
        </div>
        <div className="text-[11px] text-muted-token">
          Rule 55 GST Compliant E-Way Logs
        </div>
      </div>

      {/* Standard Unified FilterBar */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search DC#, product, vehicle, or driver..."
        size="sm"
        filters={
          <>
            <Select
              size="sm"
              options={SOURCE_OPTIONS}
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-36"
            />
            <Select
              size="sm"
              options={DEST_OPTIONS}
              value={destFilter}
              onChange={(e) => setDestFilter(e.target.value)}
              className="w-36"
            />
          </>
        }
        onReset={
          searchTerm || sourceFilter !== "ALL" || destFilter !== "ALL"
            ? () => {
                setSearchTerm("");
                setSourceFilter("ALL");
                setDestFilter("ALL");
              }
            : null
        }
      />

      {/* Unified Configurable Data Table */}
      <Table
        columns={columns}
        data={filteredTransfers}
        loading={loading}
        size="md"
        emptyMessage="No branch transfers found matching your filters."
        emptyIcon={Network}
      />

      {/* Delivery Challan Modal Preview */}
      {activeChallan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-token overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-4 bg-surface-elevated/70 border-b border-token flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-token" />
                <h3 className="text-sm font-bold text-primary-token">
                  Statutory GST Delivery Challan #{activeChallan.dcNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="xs"
                  icon={Printer}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
                <button
                  onClick={() => setActiveChallan(null)}
                  className="p-1.5 rounded-lg text-muted-token hover:text-primary-token hover:bg-surface transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="p-6 rounded-xl bg-white text-black font-sans text-xs space-y-4 border border-slate-300">
                <div className="flex justify-between items-start border-b border-black/20 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-black tracking-tight">AXINIX COMMERCE LTD.</h3>
                    <p className="text-[11px] text-gray-700">Central Logistics & Distribution Network</p>
                    <p className="text-[10px] text-gray-600">GSTIN: 33AAAAA0000A1Z5</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 rounded bg-black text-white font-bold text-[10px] uppercase">
                      GST Delivery Challan (Rule 55)
                    </span>
                    <p className="text-[11px] font-mono mt-1 text-black font-bold">DC No: {activeChallan.dcNumber}</p>
                    <p className="text-[10px] text-gray-600">Date: {activeChallan.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-black/20 pb-3">
                  <div>
                    <span className="font-bold text-gray-700 block">Transfer Route:</span>
                    <span className="font-semibold text-black">{activeChallan.route}</span>
                    <p className="text-[11px] text-gray-600 mt-1">{activeChallan.vehicle}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700 block">Driver / Handler:</span>
                    <span className="font-semibold text-black">{activeChallan.contact}</span>
                    <p className="text-[11px] text-gray-600 mt-1">Nature: Stock Transfer Without Sale</p>
                  </div>
                </div>

                <table className="w-full border border-black/20 text-left text-xs">
                  <thead className="bg-gray-100 border-b border-black/20 text-gray-800 font-bold">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-center">Quantity</th>
                      <th className="p-2 text-center">Movement Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 font-medium">{activeChallan.productName}</td>
                      <td className="p-2 text-center font-bold font-mono">{activeChallan.quantity} Units</td>
                      <td className="p-2 text-center">Inter-Branch Outward</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between pt-8 text-[11px] text-gray-700">
                  <div className="border-t border-black/40 pt-1 w-44 text-center">
                    Authorized Signatory
                  </div>
                  <div className="border-t border-black/40 pt-1 w-44 text-center">
                    Receiving Warehouse Incharge
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
