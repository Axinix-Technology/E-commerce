import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileText
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function CustomerListPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gstFilter, setGstFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["name.icontains"] = search.trim();
      }
      if (customerTypeFilter !== "all") {
        filter.customer_type = customerTypeFilter;
      }
      if (statusFilter !== "all") {
        filter.status = parseInt(statusFilter, 10);
      }

      const res = await populateApi.read("customer_master", {
        filter,
        page,
        limit: 15,
        populate: {
          state: ["id", "code", "name"],
        },
        sort: ["-id"],
      });

      if (res?.data) {
        setCustomers(res.data);
        setTotalCount(res.count || 0);
        setTotalPages(res.metadata?.total_pages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, customerTypeFilter, statusFilter]);

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to deactivate customer "${customer.name}"?`)) return;

    try {
      await populateApi.delete("customer_master", customer.id);
      toast.success("Customer deactivated successfully");
      fetchCustomers();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (gstFilter === "registered" && !c.gstin) return false;
    if (gstFilter === "unregistered" && c.gstin) return false;
    return true;
  });

  const b2bCount = filteredCustomers.filter((c) => c.customer_type === "b2b").length;
  const activeCount = filteredCustomers.filter((c) => c.status === 1).length;

  const columns = [
    {
      header: "# ID",
      accessor: "id",
      className: "font-mono text-muted-token text-xs w-16",
    },
    {
      header: "Customer",
      render: (c) => (
        <div>
          <div className="font-semibold text-primary-token text-xs">{c.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant={c.customer_type === "b2b" ? "primary" : "neutral"} size="sm">
              {c.customer_type?.toUpperCase() || "B2C"}
            </Badge>
            {c.company_name && (
              <span className="text-[11px] text-muted-token truncate max-w-[150px]">
                {c.company_name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Phone & Email",
      render: (c) => (
        <div className="space-y-0.5 text-xs">
          {c.phone && (
            <div className="flex items-center gap-1 font-mono text-[11px] text-secondary-token">
              <Phone className="w-3 h-3 text-muted-token shrink-0" />
              {c.phone}
            </div>
          )}
          {c.email && (
            <div className="flex items-center gap-1 text-[11px] text-muted-token">
              <Mail className="w-3 h-3 text-muted-token shrink-0" />
              {c.email}
            </div>
          )}
          {!c.phone && !c.email && <span className="text-muted-token">—</span>}
        </div>
      ),
    },
    {
      header: "Taxation & GSTIN",
      render: (c) => (
        <div className="space-y-0.5 text-xs">
          {c.gstin ? (
            <div className="flex items-center gap-1 font-mono text-[11px] text-brand-token">
              <FileText className="w-3 h-3 text-muted-token shrink-0" />
              {c.gstin}
            </div>
          ) : (
            <span className="text-muted-token text-[11px]">—</span>
          )}
          {c.pan_number && (
            <div className="text-[10px] font-mono text-muted-token">
              PAN: {c.pan_number}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Location",
      render: (c) => {
        const stateName = c.state?.name || "";
        const loc = [c.city, stateName].filter(Boolean).join(", ");
        return loc ? (
          <div className="flex items-center gap-1 text-xs text-secondary-token">
            <MapPin className="w-3 h-3 text-muted-token shrink-0" />
            {loc}
          </div>
        ) : (
          <span className="text-muted-token text-xs">—</span>
        );
      },
    },
    {
      header: "Status",
      render: (c) => (
        <Badge variant={c.status === 1 ? "success" : "neutral"} size="sm">
          {c.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            onClick={() => navigate(`/catalogue/customers/create?id=${c.id}`)}
            title="Edit Customer"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="hover:text-rose-600 dark:hover:text-rose-400"
            onClick={() => handleDelete(c)}
            title="Deactivate Customer"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-surface-elevated/40 border border-token text-brand-token">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">Customer Directory</h1>
            <p className="text-xs text-muted-token">
              Manage retail counter clients, B2B wholesale buyers, GST compliance, and credit profiles
            </p>
          </div>
        </div>

        <Link to="/catalogue/customers/create">
          <Button variant="primary" size="sm" icon={Plus}>
            New Customer
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total Customers: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Active on Page: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatQty(activeCount)}</strong></span>
        <span>•</span>
        <span>B2B Commercial: <strong className="text-brand-token font-medium">{formatQty(b2bCount)}</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by customer name, phone, or company..."
        filters={
          <>
            <Select
              size="xs"
              value={customerTypeFilter}
              onChange={(e) => {
                setCustomerTypeFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Customer Types", value: "all" },
                { label: "Retail (B2C)", value: "b2c" },
                { label: "Wholesale (B2B)", value: "b2b" },
              ]}
            />
            <Select
              size="xs"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Statuses", value: "all" },
                { label: "Active", value: "1" },
                { label: "Inactive", value: "0" },
              ]}
            />
            <Select
              size="xs"
              value={gstFilter}
              onChange={(e) => setGstFilter(e.target.value)}
              options={[
                { label: "All GST Profiles", value: "all" },
                { label: "GSTIN Registered", value: "registered" },
                { label: "Unregistered Consumer", value: "unregistered" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
          setCustomerTypeFilter("all");
          setStatusFilter("all");
          setGstFilter("all");
          setPage(1);
        }}
      >
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchCustomers}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredCustomers}
        loading={loading}
        emptyMessage="No customer records found matching your criteria."
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-token flex items-center justify-between text-xs text-secondary-token">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
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
