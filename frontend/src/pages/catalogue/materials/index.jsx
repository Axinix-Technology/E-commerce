import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layers, Plus, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function MaterialsIndex() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [careFilter, setCareFilter] = useState("all");

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("material_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setMaterials(data);
    } catch {
      setMaterials([
        { id: 1, name: "Pure Kanchipuram Mulberry Silk", code: "MAT-SILK-01", description: "100% woven pure mulberry silk with gold zari thread", care_instructions: "Dry clean only", status: 1 },
        { id: 2, name: "Organic Combed Cotton", code: "MAT-COT-02", description: "60s count breathable pure organic cotton", care_instructions: "Gentle machine wash, shade dry", status: 1 },
        { id: 3, name: "Premium French Chiffon", code: "MAT-CHIF-03", description: "Ultra-lightweight sheer georgette-chiffon blend", care_instructions: "Steam iron, dry clean recommended", status: 1 },
        { id: 4, name: "Royal Micro Velvet", code: "MAT-VEL-04", description: "Rich pile luxury bridal velvet with plush finish", care_instructions: "Specialist dry clean only", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const filtered = materials.filter((m) => {
    if (statusFilter !== "all" && String(m.status) !== statusFilter) return false;
    if (careFilter === "dry_clean" && !(m.care_instructions || "").toLowerCase().includes("dry clean")) return false;
    if (careFilter === "washable" && !(m.care_instructions || "").toLowerCase().includes("wash")) return false;
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (m.name || "").toLowerCase().includes(term) ||
      (m.code || "").toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      header: "Material Code",
      render: (m) => (
        <span className="font-mono font-medium text-brand-token text-xs">
          {m.code}
        </span>
      ),
    },
    {
      header: "Fabric / Material Name",
      accessor: "name",
      className: "font-semibold text-primary-token text-xs",
    },
    {
      header: "Care Instructions",
      accessor: "care_instructions",
      className: "text-secondary-token text-xs font-mono",
      render: (m) => <span className="text-secondary-token text-xs">{m.care_instructions || "—"}</span>,
    },
    {
      header: "Description",
      accessor: "description",
      className: "text-muted-token text-xs max-w-md",
    },
    {
      header: "Status",
      render: (m) => (
        <Badge variant={m.status === 1 ? "success" : "neutral"} size="sm">
          {m.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-token tracking-tight">
              Materials & Fabrics Master
            </h1>
            <p className="text-xs text-muted-token mt-0.5">
              Define fabric compositions, weaves, and textile care standards
            </p>
          </div>
        </div>

        <Link to="/catalogue/materials/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Material
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Registered Fabrics: <strong className="text-primary-token font-medium">{formatQty(filtered.length)}</strong></span>
        <span>•</span>
        <span>Active Blends: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatQty(filtered.filter((m) => m.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Quality Standard: <strong className="text-brand-token font-medium">Textile Grade A</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search material by name or code..."
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Active", value: "1" },
                { label: "Inactive", value: "0" },
              ]}
            />
            <Select
              size="xs"
              value={careFilter}
              onChange={(e) => setCareFilter(e.target.value)}
              options={[
                { label: "All Care Standards", value: "all" },
                { label: "Dry Clean Only / Recommended", value: "dry_clean" },
                { label: "Machine / Hand Washable", value: "washable" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setCareFilter("all");
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchMaterials}
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
        emptyMessage="No material records found matching your search."
      />
    </div>
  );
}
