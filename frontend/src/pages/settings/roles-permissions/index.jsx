import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Plus,
  Edit2,
  Lock,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function RolesPermissionsPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [accessFilter, setAccessFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("role", {
        limit: 50,
        populate: { users: ["id", "username"] },
        sort: ["id"],
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      setRoles(list);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setAccessFilter("all");
    setStatusFilter("all");
  };

  const filteredRoles = roles.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));

    const matchesAccess =
      accessFilter === "all" ||
      (accessFilter === "superadmin" && r.is_superadmin) ||
      (accessFilter === "standard" && !r.is_superadmin);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && r.status !== 0) ||
      (statusFilter === "disabled" && r.status === 0);

    return matchesSearch && matchesAccess && matchesStatus;
  });

  const superadminRolesCount = roles.filter((r) => r.is_superadmin).length;
  const totalUsersAssigned = roles.reduce((sum, r) => sum + (r.users?.length || 0), 0);

  const columns = [
    {
      key: "name",
      header: "Role / Profile",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val}</span>
          <span className="text-[10px] text-muted-token">{row.description || "Custom privileges"}</span>
        </div>
      ),
    },
    {
      key: "is_superadmin",
      header: "Access Level",
      render: (val) =>
        val ? (
          <Badge variant="brand" dot>
            Superadmin
          </Badge>
        ) : (
          <Badge variant="neutral">
            Standard RBAC
          </Badge>
        ),
    },
    {
      key: "users",
      header: "Assigned Users",
      align: "center",
      render: (val) => (
        <span className="font-semibold">{formatQty(val?.length || 0)} Users</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (val) => (
        <Badge variant={val === 0 ? "rose" : "emerald"} dot>
          {val === 0 ? "Disabled" : "Active"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, row) => (
        <Link to={`/settings/roles-permissions/create?id=${row.id}`}>
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
            <ShieldCheck className="w-5 h-5 text-brand-token" />
            Roles & Access Permissions
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Role-based access control (RBAC), capability matrix, and security privileges
          </p>
        </div>

        <Link to="/settings/roles-permissions/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Create Role
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Defined Roles: <strong className="text-primary-token font-medium">{formatQty(roles.length)}</strong></span>
        <span>•</span>
        <span>Superadmin Profiles: <strong className="text-brand-token font-medium">{formatQty(superadminRolesCount)}</strong></span>
        <span>•</span>
        <span>Assigned Staff: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatQty(totalUsersAssigned)}</strong></span>
        <span>•</span>
        <span>Capability Enforcement: <strong className="text-primary-token font-medium">Active</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search role name or description..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value)}
              options={[
                { value: "all", label: "All Access Levels" },
                { value: "superadmin", label: "Superadmin Only" },
                { value: "standard", label: "Standard RBAC Roles" },
              ]}
            />
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active Roles" },
                { value: "disabled", label: "Disabled Roles" },
              ]}
            />
          </>
        }
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchData}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Reusable Data Table */}
      <Table
        columns={columns}
        data={filteredRoles}
        loading={loading}
        emptyMessage="No roles matching your query."
        onRowClick={(row) => navigate(`/settings/roles-permissions/create?id=${row.id}`)}
      />
    </div>
  );
}
