import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function StaffSettingsPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["username.icontains"] = search.trim();
      }
      if (statusFilter !== "all") {
        filter["status"] = Number(statusFilter);
      }
      if (roleFilter === "admin") {
        filter["is_superuser"] = true;
      }

      const res = await populateApi.read("user", {
        filter,
        page,
        limit: 15,
        populate: {
          role: ["id", "name", "is_superadmin"],
        },
        sort: ["-id"],
      });

      const list = Array.isArray(res) ? res : res?.data || [];
      setStaff(list);
      setTotalCount(res?.count || list.length);
      setTotalPages(res?.metadata?.total_pages || Math.ceil(list.length / 15) || 1);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page, search, statusFilter, roleFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRoleFilter("all");
    setPage(1);
  };

  const activeStaffCount = staff.filter((s) => s.status === 1).length;
  const adminStaffCount = staff.filter((s) => s.is_superuser || s.role?.is_superadmin).length;

  const handleDeactivate = async (member) => {
    if (!window.confirm(`Deactivate staff user "${member.username}"?`)) return;
    try {
      await populateApi.update("user", member.id, { status: 0 });
      toast.success("Staff user deactivated");
      fetchStaff();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to update user");
    }
  };

  const columns = [
    {
      key: "username",
      header: "Staff Member",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{row.first_name ? `${row.first_name} ${row.last_name || ""}` : val}</span>
          <span className="text-[10px] text-muted-token">@{val}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email & Phone",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-secondary-token text-xs">{val || "—"}</span>
          <span className="text-[10px] text-muted-token">{row.phone || "—"}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Assigned Role",
      render: (val, row) => {
        const isSuper = row.is_superuser || val?.is_superadmin;
        return (
          <Badge variant={isSuper ? "brand" : "neutral"} dot>
            {val?.name || (isSuper ? "Super Administrator" : "Staff User")}
          </Badge>
        );
      },
    },
    {
      key: "status",
      header: "Account State",
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
        <div className="flex items-center justify-end gap-1.5">
          <Link to={`/settings/staff/create?id=${row.id}`}>
            <Button size="xs" variant="ghost" icon={Edit2}>
              Edit
            </Button>
          </Link>
          {row.status === 1 && (
            <Button
              size="xs"
              variant="danger"
              onClick={() => handleDeactivate(row)}
            >
              Disable
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-token" />
            Staff & Store Personnel
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Manage employee accounts, store roles, cash counter credentials, and access gates
          </p>
        </div>

        <Link to="/settings/staff/create">
          <Button variant="primary" size="sm" icon={Plus}>
            New Staff Member
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total Staff: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Active Users: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatQty(activeStaffCount)}</strong></span>
        <span>•</span>
        <span>Administrators: <strong className="text-brand-token font-medium">{formatQty(adminStaffCount)}</strong></span>
        <span>•</span>
        <span>Auth Mode: <strong className="text-primary-token font-medium">RBAC Secured</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff by username or email..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "1", label: "Active Staff" },
                { value: "0", label: "Inactive Staff" },
              ]}
            />
            <Select
              size="xs"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "All Roles" },
                { value: "admin", label: "Super Admins Only" },
                { value: "staff", label: "Store Associates" },
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
          onClick={fetchStaff}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Reusable Data Table */}
      <Table
        columns={columns}
        data={staff}
        loading={loading}
        emptyMessage="No staff members matching your search."
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-1 text-xs text-muted-token">
          <span>Page {page} of {totalPages} ({formatQty(totalCount)} total members)</span>
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
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
