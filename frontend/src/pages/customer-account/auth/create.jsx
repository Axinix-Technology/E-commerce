import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import populateApi from "../../../api/populate.api";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";

export default function CustomerSignUpPage() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_type: "b2c",
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    company_name: "",
    gstin: "",
    city: "",
    state_id: "",
    pincode: "",
  });

  useEffect(() => {
    populateApi.read("state_master", { limit: 50, sort: ["name"] })
      .then((res) => {
        if (res?.data) {
          setStates(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, state_id: String(res.data[0].id) }));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      toast.error("Please fill in full name, phone number, and password");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      // Create CustomerMaster record
      await populateApi.create("customer_master", {
        customer_type: formData.customer_type,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        company_name: formData.customer_type === "b2b" ? formData.company_name.trim() : null,
        gstin: formData.customer_type === "b2b" ? formData.gstin.trim().toUpperCase() : null,
        city: formData.city.trim() || null,
        state_id: formData.state_id ? parseInt(formData.state_id) : null,
        pincode: formData.pincode.trim() || null,
        status: 1,
      });

      localStorage.setItem("customer_token", "demo_jwt_token_retail_user");
      localStorage.setItem(
        "customer_user",
        JSON.stringify({
          name: formData.name,
          email: formData.email || formData.phone,
          customer_type: formData.customer_type,
        })
      );

      toast.success("Account created successfully! Welcome to Axinix.");
      navigate("/customer-account/profile");
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Failed to create customer account");
    } finally {
      setSubmitting(false);
    }
  };

  const stateOptions = states.map((s) => ({
    value: String(s.id),
    label: `${s.code ? s.code + " - " : ""}${s.name}`,
  }));

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/customer-account/auth">
          <Button variant="outline" size="sm" icon={ArrowLeft} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary-token flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand-token" />
            <span>Create Customer Account</span>
          </h1>
          <p className="text-xs text-muted-token mt-0.5">Register as a retail consumer or verified B2B wholesale partner</p>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-5">
        {/* Type toggle */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/40 border border-token">
          <span className="text-xs font-semibold text-secondary-token pl-2">Account Type</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, customer_type: "b2c" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                formData.customer_type === "b2c"
                  ? "bg-brand-token text-slate-950 shadow-xs font-bold"
                  : "text-muted-token hover:text-primary-token"
              }`}
            >
              Retail Consumer
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, customer_type: "b2b" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                formData.customer_type === "b2b"
                  ? "bg-brand-token text-slate-950 shadow-xs font-bold"
                  : "text-muted-token hover:text-primary-token"
              }`}
            >
              Business (B2B)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Alex Mercer"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Phone"
              type="tel"
              required
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {formData.customer_type === "b2b" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-token">
              <Input
                label="Company Trade Name"
                required
                placeholder="e.g. Mercer Retail Pvt Ltd"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />

              <Input
                label="GSTIN Number"
                required
                maxLength={15}
                placeholder="27AAACM1234F1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="font-mono uppercase"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-token flex items-center justify-between">
          <Link to="/customer-account/auth" className="text-xs text-muted-token hover:underline">
            Already have an account? Sign in
          </Link>

          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={submitting}
            rightIcon={ArrowRight}
          >
            {submitting ? "Registering..." : "Create Account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
