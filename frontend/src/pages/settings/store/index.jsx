import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Building2,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Receipt,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function StoreSettingsPage() {
  const [company, setCompany] = useState(null);
  const [generalSettings, setGeneralSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, setRes] = await Promise.all([
        populateApi.read("company", { limit: 1 }),
        populateApi.read("general_setting", { limit: 50, sort: ["group", "key"] }),
      ]);

      const compList = Array.isArray(compRes) ? compRes : compRes?.data || [];
      const setList = Array.isArray(setRes) ? setRes : setRes?.data || [];

      if (compList.length > 0) {
        setCompany(compList[0]);
      }
      setGeneralSettings(setList);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load store settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setGroupFilter("all");
  };

  const groups = Array.from(new Set(generalSettings.map((s) => s.group).filter(Boolean)));

  const filteredSettings = generalSettings.filter((s) => {
    const matchesSearch =
      (s.key || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.value || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.group || "").toLowerCase().includes(search.toLowerCase());

    const matchesGroup = groupFilter === "all" || s.group === groupFilter;
    return matchesSearch && matchesGroup;
  });

  const settingColumns = [
    {
      key: "group",
      header: "Category",
      render: (val) => (
        <Badge variant="brand" className="uppercase font-mono text-[9px]">
          {val || "CONFIG"}
        </Badge>
      ),
    },
    {
      key: "key",
      header: "Configuration Key",
      render: (val) => <span className="font-mono text-xs font-semibold text-primary-token">{val}</span>,
    },
    {
      key: "value",
      header: "Active Setting Value",
      render: (val) => (
        <span className="font-mono text-xs text-brand-token font-bold">{val}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5 text-brand-token" />
            Store & Company Profile
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Organization identity, tax credentials, address, and localized store parameters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/settings/store/create">
            <Button variant="primary" size="sm" icon={Edit2}>
              Edit Store Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Store Name: <strong className="text-primary-token font-medium">{company?.name || "Axinix Store"}</strong></span>
        <span>•</span>
        <span>GST Registered: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{company?.gst_no ? "Yes" : "—"}</strong></span>
        <span>•</span>
        <span>Active Currency: <strong className="text-brand-token font-medium">INR (₹)</strong></span>
        <span>•</span>
        <span>Config Keys: <strong className="text-primary-token font-medium">{formatQty(generalSettings.length)}</strong></span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Identity */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-brand-token" />
            Legal Organization Profile
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-token">
              <span className="text-muted-token">Store Name</span>
              <span className="font-semibold text-primary-token">{company?.name || "Axinix Couture Pvt Ltd"}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-token">
              <span className="text-muted-token">GSTIN / Tax ID</span>
              <span className="font-mono font-bold text-brand-token">{company?.gst_no || "33AAAAA0000A1Z5"}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-token">
              <span className="text-muted-token">Corporate Email</span>
              <span className="text-primary-token">{company?.email || "info@axinix.com"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-token">Direct Phone</span>
              <span className="text-primary-token">{company?.phone || "+91 98400 12345"}</span>
            </div>
          </div>
        </div>

        {/* Operating Address */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-primary-token uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-brand-token" />
            Headquarters & Dispatch Address
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-token">
              <span className="text-muted-token">Address Line</span>
              <span className="font-medium text-primary-token">{company?.address || "42 Khader Nawaz Khan Road"}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-token">
              <span className="text-muted-token">City / District</span>
              <span className="text-primary-token">{company?.city || "Chennai, Nungambakkam"}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-token">
              <span className="text-muted-token">State & Pincode</span>
              <span className="font-mono text-primary-token">Tamil Nadu - 600006</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-token">Online Storefront</span>
              <span className="text-brand-token hover:underline cursor-pointer">{company?.website || "https://axinix.com"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Configurations Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-token" />
          Active Store Configurations ({formatQty(filteredSettings.length)})
        </h2>

        {/* FilterBar */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search configuration key or value..."
          onReset={handleResetFilters}
          filters={
            <Select
              size="xs"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              options={[
                { value: "all", label: "All Config Categories" },
                ...groups.map((g) => ({ value: g, label: g.toUpperCase() })),
              ]}
            />
          }
        >
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchData}
            title="Refresh Settings"
          >
            Refresh
          </Button>
        </FilterBar>

        <Table
          columns={settingColumns}
          data={filteredSettings}
          loading={loading}
          emptyMessage="No general configuration keys found matching criteria."
        />
      </div>
    </div>
  );
}
