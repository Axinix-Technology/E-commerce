import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, User } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [states, setStates] = useState([]);

  const [formData, setFormData] = useState({
    name: "Alex Mercer",
    phone: "+91 9876543210",
    email: "alex@example.com",
    customer_type: "b2c",
    company_name: "Mercer Retail Enterprises",
    gstin: "27AAACM1234F1Z5",
    city: "Mumbai",
    state_id: "",
    pincode: "400050",
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("customer_user") || "null");
    if (stored) {
      setFormData((prev) => ({ ...prev, ...stored }));
    }

    populateApi.read("state_master", { limit: 50, sort: ["name"] })
      .then((res) => {
        if (res?.data) {
          setStates(res.data);
          if (res.data.length > 0 && !formData.state_id) {
            setFormData((prev) => ({ ...prev, state_id: String(res.data[0].id) }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      localStorage.setItem("customer_user", JSON.stringify(formData));
      toast.success("Profile credentials updated successfully!");
      navigate("/customer-account/profile");
    }, 500);
  };

  const stateOptions = states.map((s) => ({
    value: String(s.id),
    label: `${s.code ? s.code + " - " : ""}${s.name}`,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/customer-account/profile">
          <Button variant="outline" size="sm" icon={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-token" />
            <span>Edit Profile & Tax Credentials</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">Update statutory invoicing details and contact preferences</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Mobile Phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <div className="sm:col-span-2">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <h3 className="text-xs font-bold text-brand-token uppercase tracking-wider pt-3 border-t border-token">
            B2B Commercial Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company / Trade Name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            />

            <Input
              label="GSTIN Number"
              maxLength={15}
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              className="font-mono uppercase"
            />

            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <Input
              label="PIN Code"
              maxLength={6}
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-token flex items-center justify-end gap-3">
          <Link to="/customer-account/profile">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={submitting}
            icon={Save}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
