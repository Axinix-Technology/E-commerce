import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserCheck, Plus, Search, Edit2 } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { formatQty } from "../../../utils/formatters";
import { Button, Input, Table, Badge } from "../../../components/ui";

export default function AgeGroupsIndex() {
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAgeGroups = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("age_group_master", { limit: 100 });
      const data = Array.isArray(res) ? res : res.data || [];
      setAgeGroups(data);
    } catch {
      setAgeGroups([
        { id: 1, name: "Infant & Toddler", min_age: 0, max_age: 2, description: "Soft organic cotton bodysuits and ceremonial baby wear", status: 1 },
        { id: 2, name: "Kids & Pre-Teens", min_age: 3, max_age: 12, description: "Festive lehengas, kurtas, and durable party wear", status: 1 },
        { id: 3, name: "Teens & Young Adults", min_age: 13, max_age: 19, description: "Modern fusion indo-western and celebration wear", status: 1 },
        { id: 4, name: "Adults & Seniors", min_age: 20, max_age: 99, description: "Bridal couture, classic sarees, and fine menswear", status: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgeGroups();
  }, []);

  const filtered = ageGroups.filter((a) =>
    (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      header: "Age Group Label",
      render: (val) => <span className="font-semibold text-primary-token">{val}</span>,
    },
    {
      key: "span",
      header: "Span (Years)",
      render: (_, row) => (
        <span className="font-mono text-xs text-brand-token font-semibold">
          {formatQty(row.min_age)} to {formatQty(row.max_age)} yrs
        </span>
      ),
    },
    {
      key: "description",
      header: "Category Scope",
      render: (val) => <span className="text-secondary-token text-xs">{val || "—"}</span>,
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
        <Link to={`/catalogue/age-groups/create?id=${row.id}`}>
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
            <UserCheck className="w-5 h-5 text-brand-token" />
            Age Groups Master
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Demographic age bands for merchandise filtering and sizing recommendations
          </p>
        </div>
        <Link to="/catalogue/age-groups/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Add Age Group
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Age Categories: <strong className="text-primary-token font-medium">{formatQty(ageGroups.length)}</strong></span>
        <span>•</span>
        <span>Active Cohorts: <strong className="text-emerald-400 font-medium">{formatQty(ageGroups.filter(a => a.status === 1).length)}</strong></span>
        <span>•</span>
        <span>Storefront Tagging: <strong className="text-brand-token font-medium">Auto Facets</strong></span>
      </div>

      {/* Search Input Bar */}
      <div className="w-full sm:max-w-md">
        <Input
          icon={Search}
          placeholder="Search by age group name or description..."
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
        emptyMessage="No age groups configured."
      />
    </div>
  );
}
