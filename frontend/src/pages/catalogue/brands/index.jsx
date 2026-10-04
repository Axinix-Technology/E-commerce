import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tag, Plus, Search, ExternalLink, Edit2 } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty } from "../../../utils/formatters";
import { Button, Input, Table, Badge } from "../../../components/ui";

export default function BrandsIndex() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("brand_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setBrands(data);
    } catch {
      setBrands([
        { id: 1, name: "Axinix Couture", code: "BRD-AX-01", website: "https://axinix.com/couture", status: 1 },
        { id: 2, name: "Viraasat Heritage Silks", code: "BRD-VIR-02", website: "https://axinix.com/viraasat", status: 1 },
        { id: 3, name: "Aura Daily Pret", code: "BRD-AURA-03", website: "https://axinix.com/aura", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const filtered = brands.filter((b) =>
    (b.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.code || "").toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      header: "Brand / Label Name",
      render: (val) => <span className="font-semibold text-primary-token">{val}</span>,
    },
    {
      key: "code",
      header: "Code",
      render: (val) => <span className="font-mono text-xs text-brand-token font-semibold">{val}</span>,
    },
    {
      key: "website",
      header: "Official Website",
      render: (val) =>
        val ? (
          <a
            href={val}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-brand-token hover:underline"
          >
            {val}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (val) => (
        <Badge variant={val === 1 ? "emerald" : "rose"} dot>
          {val === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <Link to={`/catalogue/brands/create?id=${row.id}`}>
          <Button size="xs" variant="ghost" icon={Edit2}>
            Edit
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-brand-token" />
            Brands & Labels Master
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Manage in-house couture lines and third-party designer label licensing
          </p>
        </div>
        <Link to="/catalogue/brands/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Brand
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Registered Brands: <strong className="text-primary-token font-medium">{formatQty(brands.length)}</strong></span>
        <span>•</span>
        <span>Active Labels: <strong className="text-emerald-400 font-medium">{formatQty(brands.filter(b => b.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Catalogue Filtration: <strong className="text-brand-token font-medium">Facet Enabled</strong></span>
      </div>

      {/* Search Input Bar */}
      <div className="w-full sm:max-w-md">
        <Input
          icon={Search}
          placeholder="Search by brand name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
      </div>

      {/* Reusable Data Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyMessage="No brands found."
      />
    </div>
  );
}
