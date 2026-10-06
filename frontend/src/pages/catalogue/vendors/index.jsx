import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  FileText
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

const formatQty = (val) => {
  const num = Number(val);
  return !num || num === 0 ? "—" : num.toLocaleString();
};

export default function VendorListPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gstFilter, setGstFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (search.trim()) {
        filter["name.icontains"] = search.trim();
      }
      if (statusFilter !== "all") {
        filter.status = parseInt(statusFilter, 10);
      }

      const res = await populateApi.read("vendor_master", {
        filter,
        page,
        limit: 15,
        sort: ["-id"],
      });

      if (res?.data) {
        setVendors(res.data);
        setTotalCount(res.count || 0);
        setTotalPages(res.metadata?.total_pages || 1);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [page, search, statusFilter]);

  const handleDelete = async (vendor) => {
    if (!window.confirm(`Are you sure you want to deactivate vendor "${vendor.name}"?`)) return;

    try {
      await populateApi.delete("vendor_master", vendor.id);
      toast.success("Vendor deactivated successfully");
      fetchVendors();
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to delete vendor");
    }
  };

  const filteredVendors = vendors.filter((v) => {
    if (gstFilter === "registered" && !v.gstin) return false;
    if (gstFilter === "unregistered" && v.gstin) return false;
    return true;
  });

  const activeCount = filteredVendors.filter((v) => v.status === 1).length;
  const gstinCount = filteredVendors.filter((v) => Boolean(v.gstin)).length;

  const columns = [
    {
      header: "# ID",
      accessor: "id",
      className: "font-mono text-muted-token text-xs w-16",
    },
    {
      header: "Vendor / Supplier",
      render: (v) => (
        <div>
          <div className="font-semibold text-primary-token text-xs">{v.name}</div>
          {v.vendor_code && (
            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded font-mono text-[10px] bg-surface-elevated text-brand-token border border-token">
              {v.vendor_code}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Contact Person",
      accessor: "contact_person",
      render: (v) => <span className="text-secondary-token text-xs">{v.contact_person || "—"}</span>,
    },
    {
      header: "Phone & Email",
      render: (v) => (
        <div className="space-y-0.5 text-xs">
          {v.phone && (
            <div className="flex items-center gap-1 font-mono text-[11px] text-secondary-token">
              <Phone className="w-3 h-3 text-muted-token shrink-0" />
              {v.phone}
            </div>
          )}
          {v.email && (
            <div className="flex items-center gap-1 text-[11px] text-muted-token">
              <Mail className="w-3 h-3 text-muted-token shrink-0" />
              {v.email}
            </div>
          )}
          {!v.phone && !v.email && <span className="text-muted-token">—</span>}
        </div>
      ),
    },
    {
      header: "GSTIN & PAN",
      render: (v) => (
        <div className="space-y-0.5 text-xs">
          {v.gstin ? (
            <div className="flex items-center gap-1 font-mono text-[11px] text-brand-token">
              <FileText className="w-3 h-3 text-muted-token shrink-0" />
              {v.gstin}
            </div>
          ) : (
            <span className="text-muted-token text-[11px]">—</span>
          )}
          {v.pan_number && (
            <div className="text-[10px] font-mono text-muted-token">
              PAN: {v.pan_number}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Location",
      render: (v) => {
        const loc = [v.city, v.state].filter(Boolean).join(", ");
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
      render: (v) => (
        <Badge variant={v.status === 1 ? "success" : "neutral"} size="sm">
          {v.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (v) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            onClick={() => navigate(`/catalogue/vendors/create?id=${v.id}`)}
            title="Edit Vendor"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="hover:text-rose-600 dark:hover:text-rose-400"
            onClick={() => handleDelete(v)}
            title="Deactivate Vendor"
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
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-primary-token">Vendor Registration</h1>
            <p className="text-xs text-muted-token">
              Manage registered vendors, trade credentials, GSTIN, and procurement contact points
            </p>
          </div>
        </div>

        <Link to="/catalogue/vendors/create">
          <Button variant="primary" size="sm" icon={Plus}>
            Register Vendor
          </Button>
        </Link>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Total Registered: <strong className="text-primary-token font-medium">{formatQty(totalCount)}</strong></span>
        <span>•</span>
        <span>Active on Page: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{formatQty(activeCount)}</strong></span>
        <span>•</span>
        <span>GSTIN Verified: <strong className="text-brand-token font-medium">{formatQty(gstinCount)}</strong></span>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by vendor name or code..."
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
                { label: "Unregistered / Composition", value: "unregistered" },
              ]}
            />
          </>
        }
        onReset={() => {
          setSearch("");
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
          onClick={fetchVendors}
          title="Refresh List"
        >
          Refresh
        </Button>
      </FilterBar>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredVendors}
        loading={loading}
        emptyMessage="No vendors registered yet. Register your vendors before initiating Purchase and Inward entries."
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
