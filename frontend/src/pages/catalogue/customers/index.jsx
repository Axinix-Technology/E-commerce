import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Building2,
  UserCheck
} from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

      const res = await populateApi.read("customer_master", {
        filter,
        page,
        limit: 10,
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
  }, [page, search]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.25)] text-brand-token shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-primary-token">Customer Master</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[rgba(0,210,210,0.12)] text-brand-token border border-[rgba(0,210,210,0.25)]">
                  {totalCount} Accounts
                </span>
              </div>
              <p className="text-xs text-secondary-token">
                Manage retail consumers (B2C) and corporate business buyers (B2B with GSTIN).
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/catalogue/customers/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </Link>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-token flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-token absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-elevated border border-token text-xs text-primary-token focus:outline-none focus:border-[var(--brand-secondary)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-secondary-token">
          <span>Total: <strong className="text-primary-token font-mono">{totalCount}</strong></span>
          <button
            onClick={fetchCustomers}
            title="Refresh list"
            className="p-1.5 rounded-lg hover:bg-surface-elevated text-muted-token hover:text-primary-token transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-token" : ""}`} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-token overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/60 text-secondary-token uppercase tracking-wider font-semibold border-b border-token">
              <tr>
                <th className="py-3 px-4"># ID</th>
                <th className="py-3 px-4">Customer / Business</th>
                <th className="py-3 px-4">Account Type</th>
                <th className="py-3 px-4">Contact Phone & Email</th>
                <th className="py-3 px-4">GSTIN & PAN</th>
                <th className="py-3 px-4">State (Place of Supply)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-token text-primary-token">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-muted-token">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-token" />
                    Loading customer accounts...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-muted-token">
                    <p className="font-semibold text-secondary-token mb-1">No customers registered</p>
                    <p className="text-xs text-muted-token mb-3">Add customer accounts for POS billing and GST tax invoices.</p>
                    <Link
                      to="/catalogue/customers/create"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Customer
                    </Link>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-muted-token">{c.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-primary-token">{c.name}</div>
                      {c.company_name && (
                        <div className="text-[11px] text-muted-token flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {c.company_name}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.customer_type === "b2b" ? (
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          B2B Corporate
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          B2C Retail
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-secondary-token space-y-0.5">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-muted-token" />
                        {c.phone || "—"}
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-token">
                          <Mail className="w-3 h-3 text-muted-token" />
                          {c.email}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      {c.gstin ? (
                        <span className="font-mono text-[11px] font-semibold text-brand-token">
                          {c.gstin}
                        </span>
                      ) : (
                        <span className="text-muted-token text-[11px]">—</span>
                      )}
                      {c.pan_number && (
                        <div className="text-[10px] font-mono text-muted-token">
                          PAN: {c.pan_number}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.state ? (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-primary-token">
                          <span className="font-mono px-1 py-0.2 rounded bg-surface-elevated border border-token text-[10px] text-brand-token">
                            {c.state.code}
                          </span>
                          {c.state.name}
                        </div>
                      ) : (
                        <span className="text-muted-token text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.status === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                          <AlertCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/catalogue/customers/create?id=${c.id}`}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg hover:bg-surface-elevated text-secondary-token hover:text-brand-token transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c)}
                          title="Deactivate Customer"
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-secondary-token hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-token flex items-center justify-between text-xs text-secondary-token">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-token disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-token disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
