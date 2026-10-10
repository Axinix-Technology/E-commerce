import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightLeft,
  Plus,
  RefreshCw,
  FileText,
  Printer,
  X
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty } from "../../../utils/formatters";
import {
  Button,
  Table,
  FilterBar,
  Select,
  Badge,
  Modal,
  MetricBar,
  PageHeader,
} from "../../../components/ui";

const OPERATION_OPTIONS = [
  { value: "ALL", label: "All Operations" },
  { value: "approval_outward", label: "Issue to Photoshoot/PR" },
  { value: "approval_return", label: "Return from Photoshoot" },
  { value: "repair_outward", label: "Send to Workshop" },
  { value: "repair_return", label: "Restock Repaired Goods" },
  { value: "return_quarantine", label: "Customer Return Quarantine" },
  { value: "qc_restock", label: "QC Pass & Restock" },
  { value: "scrap_writeoff", label: "Scrap Write-Off" },
  { value: "purchase_inward", label: "Purchase Inward" },
  { value: "branch_transfer_outward", label: "Branch Transfer" },
];

const POLICY_OPTIONS = [
  { value: "ALL", label: "All Policies" },
  { value: "DEDUCTS", label: "Deducts Available Stock" },
  { value: "KEEPS", label: "Keeps in Available Stock" },
];

const MOVEMENT_LABELS = {
  approval_outward: { label: "Issue to Photoshoot / PR", variant: "amber" },
  approval_return: { label: "Return from Photoshoot", variant: "emerald" },
  repair_outward: { label: "Send to Workshop / Repair", variant: "cyan" },
  repair_return: { label: "Restock Repaired Goods", variant: "emerald" },
  return_quarantine: { label: "Customer Return Quarantine", variant: "blue" },
  qc_restock: { label: "QC Pass & Restock Return", variant: "emerald" },
  scrap_writeoff: { label: "Scrap / Damaged Write-Off", variant: "rose" },
};

export default function StockMovementListingPage() {
  const navigate = useNavigate();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [operationFilter, setOperationFilter] = useState("ALL");
  const [policyFilter, setPolicyFilter] = useState("ALL");

  // Selected Gate Pass for Modal preview
  const [activeGatePass, setActiveGatePass] = useState(null);

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("stock_ledger", {
        limit: 100,
        sort: ["-id"],
        populate: {
          product: ["id", "name"],
          issue_type: ["id", "name", "code", "deduct_from_available_stock"]
        }
      });
      if (res?.data && Array.isArray(res.data)) {
        setMovements(res.data);
      } else {
        setMovements([]);
      }
    } catch {
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const query = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (m.product?.name && m.product.name.toLowerCase().includes(query)) ||
        (m.remarks && m.remarks.toLowerCase().includes(query)) ||
        (m.reference_id && m.reference_id.toLowerCase().includes(query)) ||
        (m.id && m.id.toString().includes(query));

      const matchOperation =
        operationFilter === "ALL" || m.movement_type === operationFilter;

      const matchPolicy =
        policyFilter === "ALL"
          ? true
          : policyFilter === "DEDUCTS"
          ? m.issue_type?.deduct_from_available_stock === true
          : m.issue_type?.deduct_from_available_stock === false;

      return matchSearch && matchOperation && matchPolicy;
    });
  }, [movements, searchTerm, operationFilter, policyFilter]);

  // Aggregate stats
  const approvalCount = useMemo(() => {
    return movements
      .filter((m) => m.movement_type === "approval_outward")
      .reduce((sum, m) => sum + (Math.abs(m.quantity) || 0), 0);
  }, [movements]);

  const repairCount = useMemo(() => {
    return movements
      .filter((m) => m.movement_type === "repair_outward")
      .reduce((sum, m) => sum + (Math.abs(m.quantity) || 0), 0);
  }, [movements]);

  const quarantineCount = useMemo(() => {
    return movements
      .filter((m) => m.movement_type === "return_quarantine")
      .reduce((sum, m) => sum + (Math.abs(m.quantity) || 0), 0);
  }, [movements]);

  // Table Columns Definition
  const columns = [
    {
      key: "id",
      header: "# ID",
      width: "70px",
      render: (val) => <span className="font-mono text-muted-token">#{val}</span>
    },
    {
      key: "movement_type",
      header: "Operation Type",
      render: (val) => {
        const cfg = MOVEMENT_LABELS[val] || { label: val, variant: "neutral" };
        return <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>;
      }
    },
    {
      key: "issue_type",
      header: "Stock Issue Policy",
      render: (val) => {
        if (!val) return <span className="text-muted-token text-[11px]">System Standard</span>;
        return (
          <div className="space-y-0.5">
            <span className="font-semibold text-primary-token text-[11px] block">{val.name}</span>
            <Badge variant={val.deduct_from_available_stock ? "rose" : "emerald"} size="xs">
              {val.deduct_from_available_stock ? "Deducts ATP" : "Keeps ATP"}
            </Badge>
          </div>
        );
      }
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
      key: "quantity",
      header: "Movement Qty",
      align: "center",
      render: (val, row) => {
        const isNegative = val < 0 || row.movement_type.includes("outward") || row.movement_type === "scrap_writeoff";
        return (
          <span className={`font-mono font-bold ${isNegative ? "text-rose-400" : "text-emerald-400"}`}>
            {isNegative ? "-" : "+"}{formatQty(Math.abs(val))}
          </span>
        );
      }
    },
    {
      key: "remarks",
      header: "Recipient / Remarks",
      render: (val) => (
        <span className="text-secondary-token text-[11px] max-w-xs truncate block">
          {val || "—"}
        </span>
      )
    },
    {
      key: "created_at",
      header: "Timestamp",
      render: (val) => (
        <span className="text-secondary-token whitespace-nowrap text-[11px]">
          {val ? new Date(val).toLocaleString("en-IN") : "—"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Gate Pass",
      align: "right",
      render: (_, row) => {
        const cfg = MOVEMENT_LABELS[row.movement_type] || { label: row.movement_type };
        return (
          <Button
            variant="outline"
            size="xs"
            icon={FileText}
            onClick={() => {
              setActiveGatePass({
                movementId: row.reference_id || `MVT-${row.id}`,
                movementType: cfg.label,
                productName: row.product?.name || `Product #${row.product_id}`,
                quantity: Math.abs(row.quantity),
                recipient: (row.remarks || "").split("|")[0]?.trim() || "Recipient",
                remarks: (row.remarks || "").split("|")[1]?.trim() || row.remarks || "",
                date: row.created_at ? new Date(row.created_at).toLocaleString("en-IN") : new Date().toLocaleString("en-IN")
              });
            }}
          >
            Pass
          </Button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Stock Movements & Approval Memo"
        subtitle="Audit trail and movement ledger across Photoshoots, PR Memos, Repair Workshops, Quarantine, and Scrap."
        icon={ArrowRightLeft}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={loading}
              onClick={fetchMovements}
              title="Refresh List"
            />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate("/inventory/movement/create")}
            >
              New Stock Movement
            </Button>
          </div>
        }
      />

      {/* Sleek Single-Line Summary Metric Bar (Rule 2) */}
      <MetricBar
        items={[
          { label: "Total Ledger Records", value: movements.length, isQty: true },
          { label: "In Approval Memo", value: approvalCount, isQty: true, variant: "amber" },
          { label: "In Repair Workshop", value: repairCount, isQty: true, variant: "brand" },
          { label: "In Quarantine Hold", value: quarantineCount, isQty: true, variant: "primary" },
          { label: "Audit Standard", value: "Double-Entry Ledger" },
        ]}
      />

      {/* Standard Unified FilterBar */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search product, recipient, reference, or remarks..."
        size="sm"
        filters={
          <>
            <Select
              size="sm"
              options={OPERATION_OPTIONS}
              value={operationFilter}
              onChange={(e) => setOperationFilter(e.target.value)}
              className="w-48"
            />
            <Select
              size="sm"
              options={POLICY_OPTIONS}
              value={policyFilter}
              onChange={(e) => setPolicyFilter(e.target.value)}
              className="w-44"
            />
          </>
        }
        onReset={
          searchTerm || operationFilter !== "ALL" || policyFilter !== "ALL"
            ? () => {
                setSearchTerm("");
                setOperationFilter("ALL");
                setPolicyFilter("ALL");
              }
            : null
        }
      />

      {/* Unified Configurable Data Table */}
      <Table
        columns={columns}
        data={filteredMovements}
        loading={loading}
        size="md"
        emptyMessage="No stock movements found matching your filters."
        emptyIcon={ArrowRightLeft}
      />

      {/* Returnable Gate Pass Modal Preview */}
      <Modal
        isOpen={Boolean(activeGatePass)}
        onClose={() => setActiveGatePass(null)}
        title={`Returnable Delivery Gate Pass #${activeGatePass?.movementId || ""}`}
        icon={FileText}
        size="lg"
        headerAction={
          <Button
            variant="secondary"
            size="xs"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print
          </Button>
        }
      >
        {activeGatePass && (
          <div className="p-4 sm:p-5 rounded-xl bg-white text-black font-sans text-xs space-y-4 border border-slate-300">
            <div className="flex justify-between items-start border-b border-black/20 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black tracking-tight">AXINIX COMMERCE LTD.</h3>
                <p className="text-[11px] text-gray-700">Central Warehouse & Fulfillment Hub</p>
                <p className="text-[10px] text-gray-600">GSTIN: 33AAAAA0000A1Z5</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 rounded bg-black text-white font-bold text-[10px] uppercase">
                  Returnable Gate Pass
                </span>
                <p className="text-[11px] font-mono mt-1 text-black font-bold">Doc: {activeGatePass.movementId}</p>
                <p className="text-[10px] text-gray-600">Date: {activeGatePass.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-black/20 pb-3">
              <div>
                <span className="font-bold text-gray-700 block">Issued To (Recipient):</span>
                <span className="font-semibold text-black">{activeGatePass.recipient}</span>
                {activeGatePass.remarks && (
                  <p className="text-[11px] text-gray-600 mt-1">Ref: {activeGatePass.remarks}</p>
                )}
              </div>
              <div>
                <span className="font-bold text-gray-700 block">Operation:</span>
                <span className="font-semibold text-black">{activeGatePass.movementType}</span>
                <p className="text-[11px] text-gray-600 mt-1">Status: Logged to double-entry ledger</p>
              </div>
            </div>

            <table className="w-full border border-black/20 text-left text-xs">
              <thead className="bg-gray-100 border-b border-black/20 text-gray-800 font-bold">
                <tr>
                  <th className="p-2">Item Description</th>
                  <th className="p-2 text-center">Quantity</th>
                  <th className="p-2 text-center">Policy Nature</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 font-medium">{activeGatePass.productName}</td>
                  <td className="p-2 text-center font-bold font-mono">{activeGatePass.quantity} Units</td>
                  <td className="p-2 text-center">Returnable Internal Movement</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between pt-8 text-[11px] text-gray-700">
              <div className="border-t border-black/40 pt-1 w-44 text-center">
                Authorized Store Incharge
              </div>
              <div className="border-t border-black/40 pt-1 w-44 text-center">
                Recipient Signature
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
