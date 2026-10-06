import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Download, RefreshCw } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import { formatQty, formatCurrency } from "../../../utils/formatters";
import { Button, Table, Badge, FilterBar, Select } from "../../../components/ui";

export default function CustomerPurchasesReportPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, salesRes] = await Promise.all([
        populateApi.read("customer_master", { limit: 200, sort: ["name"] }),
        populateApi.read("sale", { limit: 500, sort: ["-sold_at"] }),
      ]);

      const customerList = Array.isArray(custRes) ? custRes : custRes?.data || [];
      const salesList = Array.isArray(salesRes) ? salesRes : salesRes?.data || [];

      const aggregated = customerList.map((c) => {
        const custSales = salesList.filter(
          (s) => String(s.customer_id) === String(c.id) || (s.customer_phone && s.customer_phone === c.phone)
        );

        const totalSpent = custSales.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
        const orderCount = custSales.length;
        const avgOrder = orderCount > 0 ? totalSpent / orderCount : 0;
        const lastOrder = custSales.length > 0 ? custSales[0].sold_at : null;

        return {
          id: c.id,
          name: c.name,
          phone: c.phone || "—",
          email: c.email || "—",
          city: c.city || "—",
          orderCount,
          totalSpent,
          avgOrder,
          lastOrder,
        };
      });

      aggregated.sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(aggregated);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to load customer purchase report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetFilters = () => {
    setSearch("");
    setTierFilter("all");
    setActivityFilter("all");
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    let matchesTier = true;
    if (tierFilter === "high") matchesTier = c.totalSpent >= 25000;
    else if (tierFilter === "mid") matchesTier = c.totalSpent >= 5000 && c.totalSpent < 25000;
    else if (tierFilter === "low") matchesTier = c.totalSpent > 0 && c.totalSpent < 5000;
    else if (tierFilter === "zero") matchesTier = c.totalSpent === 0;

    let matchesActivity = true;
    if (activityFilter === "active") matchesActivity = c.orderCount > 0;
    else if (activityFilter === "frequent") matchesActivity = c.orderCount >= 5;
    else if (activityFilter === "inactive") matchesActivity = c.orderCount === 0;

    return matchesSearch && matchesTier && matchesActivity;
  });

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalPurchasingCustomers = customers.filter((c) => c.orderCount > 0).length;
  const overallAvg = totalPurchasingCustomers > 0 ? totalRevenue / totalPurchasingCustomers : 0;

  const handleExportCSV = () => {
    const headers = "Customer Name,Phone,Email,City,Total Orders,Lifetime Spend,Avg Order Value,Last Order\n";
    const rows = filteredCustomers
      .map(
        (c) =>
          `"${c.name}","${c.phone}","${c.email}","${c.city}",${c.orderCount},${c.totalSpent},${c.avgOrder.toFixed(2)},"${c.lastOrder || "—"}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customer-purchases-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer report CSV downloaded!");
  };

  const columns = [
    {
      key: "name",
      header: "Customer Name",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary-token">{val}</span>
          <span className="text-[10px] text-muted-token">{row.city !== "—" ? row.city : "Retail Customer"}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Contact Details",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-secondary-token text-xs">{val}</span>
          <span className="text-[10px] text-muted-token">{row.email}</span>
        </div>
      ),
    },
    {
      key: "orderCount",
      header: "Orders Placed",
      align: "center",
      render: (val) => (
        <Badge variant={val > 5 ? "emerald" : val > 0 ? "brand" : "neutral"}>
          {formatQty(val)} Orders
        </Badge>
      ),
    },
    {
      key: "avgOrder",
      header: "Avg Order Value",
      align: "right",
      render: (val) => <span className="font-mono text-secondary-token">{formatCurrency(val)}</span>,
    },
    {
      key: "totalSpent",
      header: "Lifetime Spend (₹)",
      align: "right",
      render: (val) => (
        <span className="font-bold text-primary-token font-mono">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: "lastOrder",
      header: "Last Active",
      render: (val) => (
        <span className="text-secondary-token text-xs">
          {val ? new Date(val).toLocaleDateString() : "—"}
        </span>
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
            Customer Purchases & Lifetime Spend
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Identify high-value shoppers, retention cohorts, and omni-channel purchase histories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Registered Customers: <strong className="text-primary-token font-medium">{formatQty(customers.length)}</strong></span>
        <span>•</span>
        <span>Active Buyers: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{formatQty(totalPurchasingCustomers)}</strong></span>
        <span>•</span>
        <span>Cumulative Revenue: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(totalRevenue)}</strong></span>
        <span>•</span>
        <span>Avg Basket: <strong className="text-brand-token font-medium">{formatCurrency(overallAvg)}</strong></span>
      </div>

      {/* Filter Toolbar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customer by name, phone or email..."
        onReset={handleResetFilters}
        filters={
          <>
            <Select
              size="xs"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              options={[
                { value: "all", label: "All Spend Tiers" },
                { value: "high", label: "VIP / High Spend (> ₹25k)" },
                { value: "mid", label: "Mid Tier (₹5k - ₹25k)" },
                { value: "low", label: "Entry Tier (< ₹5k)" },
                { value: "zero", label: "No Purchases (₹0)" },
              ]}
            />
            <Select
              size="xs"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              options={[
                { value: "all", label: "All Buyer Statuses" },
                { value: "active", label: "Active Buyers (≥ 1 Order)" },
                { value: "frequent", label: "Frequent Buyers (≥ 5 Orders)" },
                { value: "inactive", label: "Dormant / No Orders" },
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
        data={filteredCustomers}
        loading={loading}
        emptyMessage="No customer records found matching your query."
      />
    </div>
  );
}
