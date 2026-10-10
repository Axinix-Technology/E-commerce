import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Mail, Phone, ShieldCheck, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import { Button, Table, Badge, FilterBar, Select, MetricBar, PageHeader } from "../../../components/ui";
import { formatQty } from "../../../utils/formatters";

export default function EmployeesIndex() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("user", {
        limit: 100,
        fields: ["id", "username", "first_name", "last_name", "email", "phone", "role_id", "status", "is_superuser"],
        populate: {
          role: ["id", "name"],
        },
      });
      const data = Array.isArray(res) ? res : res?.data || [];
      setEmployees(data);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load employee records from database");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = employees.filter((emp) => {
    const fullName = `${emp?.first_name || ""} ${emp?.last_name || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      (emp?.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (emp?.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && emp?.status === 1) ||
      (statusFilter === "inactive" && emp?.status === 0);
    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && (emp?.is_superuser || emp?.role_id === 1)) ||
      (roleFilter === "staff" && !emp?.is_superuser && emp?.role_id !== 1);
    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalStaff = employees.length;
  const activeStaff = employees.filter((e) => e?.status === 1).length;
  const adminCount = employees.filter((e) => e?.is_superuser || e?.role_id === 1).length;

  const columns = [
    {
      key: "name",
      header: "Staff Member",
      render: (_, emp) => (
        <div>
          <div className="font-semibold text-primary-token text-xs">
            {emp?.first_name} {emp?.last_name || ""}
          </div>
          <div className="text-[11px] font-mono text-brand-token mt-0.5">
            @{emp?.username}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Details",
      render: (_, emp) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-secondary-token">
            <Mail className="w-3 h-3 text-muted-token shrink-0" />
            <span>{emp?.email || "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-token">
            <Phone className="w-3 h-3 shrink-0" />
            <span>{emp?.phone || "—"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role / Access",
      render: (_, emp) => (
        <Badge variant={emp?.is_superuser ? "brand" : "neutral"} size="sm" icon={ShieldCheck}>
          {emp?.is_superuser ? "Super Admin" : `Role #${emp?.role_id || 1}`}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, emp) => (
        <Badge variant={emp?.status === 1 ? "emerald" : "rose"} size="sm" dot>
          {emp?.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (_, emp) => (
        <Link
          to={`/masters/employees/create?id=${emp?.id}`}
          className="text-xs font-semibold text-brand-token hover:underline"
        >
          Edit
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Employees & Personnel Master"
        subtitle="Manage enterprise staff accounts, roles, and branch assignments"
        icon={Users}
        actions={
          <Link to="/masters/employees/create">
            <Button variant="primary" size="sm" icon={Plus}>
              Add Employee
            </Button>
          </Link>
        }
      />

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <MetricBar
        items={[
          { label: "Total Staff", value: totalStaff, isQty: true },
          { label: "Active Accounts", value: activeStaff, isQty: true, variant: "emerald" },
          { label: "Administrators", value: adminCount, isQty: true, variant: "brand" },
          { label: "Security Tier", value: "RBAC Scoped" },
        ]}
      />

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by employee name, username, or email..."
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active Only" },
                { value: "inactive", label: "Inactive Only" },
              ]}
            />
            <Select
              size="xs"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: "all", label: "All Roles" },
                { value: "admin", label: "Super Admins" },
                { value: "staff", label: "Staff Members" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
          setRoleFilter("all");
        }}
      >
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchEmployees}
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
        emptyMessage="No personnel records found matching the criteria."
      />
    </div>
  );
}
