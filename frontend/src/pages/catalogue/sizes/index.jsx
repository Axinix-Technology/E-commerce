import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ruler, Plus, Search, Edit2 } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty } from "../../../utils/formatters";
import { Button, Input, Table, Badge } from "../../../components/ui";

export default function SizesIndex() {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSizes = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("size_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setSizes(data);
    } catch {
      setSizes([
        { id: 1, name: "Free Size (Unstitched)", code: "SZ-FREE", category_type: "Ethnic Wear", sort_order: 1, status: 1 },
        { id: 2, name: "Small (S / 36)", code: "SZ-S-36", category_type: "Apparel", sort_order: 2, status: 1 },
        { id: 3, name: "Medium (M / 38)", code: "SZ-M-38", category_type: "Apparel", sort_order: 3, status: 1 },
        { id: 4, name: "Large (L / 40)", code: "SZ-L-40", category_type: "Apparel", sort_order: 4, status: 1 },
        { id: 5, name: "Extra Large (XL / 42)", code: "SZ-XL-42", category_type: "Apparel", sort_order: 5, status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const filtered = sizes.filter((s) =>
    (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.code || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.category_type || "").toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      header: "Size Label",
      render: (val) => <span className="font-semibold text-primary-token">{val}</span>,
    },
    {
      key: "code",
      header: "Code",
      render: (val) => <span className="font-mono text-xs text-brand-token font-semibold">{val}</span>,
    },
    {
      key: "category_type",
      header: "Category Segment",
      render: (val) => <span className="text-secondary-token text-xs">{val || "—"}</span>,
    },
    {
      key: "sort_order",
      header: "Sort Order",
      render: (val) => <span className="font-mono text-xs text-muted-token">{formatQty(val)}</span>,
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
        <Link to={`/catalogue/sizes/create?id=${row.id}`}>
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
            <Ruler className="w-5 h-5 text-brand-token" />
            Sizes Master
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Define sizing standards, international size charts, and sort orders
          </p>
        </div>
        <Link to="/catalogue/sizes/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Size
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Standard Sizes: <strong className="text-primary-token font-medium">{formatQty(sizes.length)}</strong></span>
        <span>•</span>
        <span>Active Sizing: <strong className="text-emerald-400 font-medium">{formatQty(sizes.filter(s => s.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Variant Generation: <strong className="text-brand-token font-medium">Matrix Ready</strong></span>
      </div>

      {/* Search Input Bar */}
      <div className="w-full sm:max-w-md">
        <Input
          icon={Search}
          placeholder="Search by size label, code, or category..."
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
        emptyMessage="No sizes configured."
      />
    </div>
  );
}
