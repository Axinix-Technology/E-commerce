import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Edit, FileText, Landmark, MapPin, Globe, RefreshCw } from "lucide-react";
import { Button, Badge } from "../../../components/ui";
import populateApi from "../../../api/populate.api";

export default function CompanySettingsIndex() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res = await populateApi.read("company", { limit: 1 });
      const list = Array.isArray(res) ? res : res?.data || [];
      if (list.length > 0) {
        setCompany(list[0]);
      } else {
        setCompany(null);
      }
    } catch (err) {
      console.warn("Could not fetch company master record:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary-token tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-token" />
            Company & Legal Entity Profile
          </h1>
          <p className="text-xs text-muted-token mt-0.5">
            Statutory tax registrations, corporate credentials, and corporate location
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} loading={loading} onClick={fetchCompany}>
            Sync
          </Button>
          <Link to="/settings/company/create">
            <Button variant="primary" size="sm" icon={Edit}>
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Rule 2: Minimalist Single-Line Metric Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl bg-surface-elevated/40 border border-token text-xs text-muted-token">
        <span>Company Name: <strong className="text-primary-token font-medium">{company?.name || "—"}</strong></span>
        <span>•</span>
        <span>GST No: <strong className="text-primary-token font-mono font-medium">{company?.gst_no || "—"}</strong></span>
        <span>•</span>
        <span>City: <strong className="text-brand-token font-medium">{company?.city || "—"}</strong></span>
        <span>•</span>
        <span>State: <strong className="text-primary-token font-medium">{company?.state || "—"}</strong></span>
        <span>•</span>
        <span>Status: <strong className="text-emerald-700 dark:text-emerald-400 font-medium">{company ? "Active" : "Not Configured"}</strong></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Corporate Identity */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-2 border-b border-token pb-2">
            <FileText className="w-4 h-4 text-brand-token" />
            Corporate Identity
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Company Name</span>
              <span className="font-semibold text-primary-token">{company?.name || "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Legal Registered Name</span>
              <span className="font-medium text-primary-token">{company?.legal_name || "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Short Brand Name</span>
              <span className="font-medium text-brand-token">{company?.short_name || "—"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-token">GSTIN / Tax ID</span>
              <span className="font-mono font-bold text-primary-token">{company?.gst_no || "—"}</span>
            </div>
          </div>
        </div>

        {/* Operating Address */}
        <div className="p-4 sm:p-5 rounded-2xl border border-token bg-surface-elevated/40 glass-panel space-y-3 shadow-xs">
          <h2 className="text-xs font-bold text-primary-token uppercase tracking-wider flex items-center gap-2 border-b border-token pb-2">
            <MapPin className="w-4 h-4 text-brand-token" />
            Registered Business Address
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Address Line 1</span>
              <span className="text-primary-token">{company?.address_line_1 || "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">Address Line 2</span>
              <span className="text-primary-token">{company?.address_line_2 || "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-token">
              <span className="text-muted-token">City & State</span>
              <span className="text-primary-token">
                {company?.city ? `${company.city}, ${company.state}` : "—"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-token">Postal Code / Country</span>
              <span className="font-mono text-primary-token">
                {company?.pincode ? `${company.pincode} (${company.country || "India"})` : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
