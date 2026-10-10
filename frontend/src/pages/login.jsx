import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authProvider";
import axiosInstance from "../api/axiosInstance";
import { Building2, Lock, User, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { Input, Button } from "../components/ui";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Pure form inputs — zero hardcoded credentials
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic Company Master State (from /api/company/public/)
  const [company, setCompany] = useState({
    name: "Centralized Commerce",
    legal_name: "Axinix Platform",
    short_name: "Axinix",
    logo_image: null,
    is_configured: false,
  });

  // Fetch Company Master data on mount
  useEffect(() => {
    let isMounted = true;
    const loadCompanyInfo = async () => {
      try {
        const res = await axiosInstance.get("/company/public/");
        if (isMounted && res.data) {
          setCompany(res.data);
        }
      } catch (err) {
        console.warn("Company Master not yet populated; using default console branding:", err.message);
      }
    };
    loadCompanyInfo();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      toast.error("Please provide both username and password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      // Client Device & Session fingerprint
      let deviceId = localStorage.getItem("app_device_id");
      if (!deviceId) {
        deviceId = `dev_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
        localStorage.setItem("app_device_id", deviceId);
      }

      const fcmToken = localStorage.getItem("fcm_device_token");
      const sessionData = {
        device: navigator.userAgent.split(")")[0].replace("Mozilla/5.0 (", "") || "Web Browser",
        device_id: deviceId,
        ...(fcmToken ? { fcm_token: fcmToken } : { fcm_token: null }),
      };

      // Standard direct authentication
      const user = await login(cleanUsername, password, sessionData);
      toast.success(`Welcome back, ${user.name || user.username}!`);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.detail?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Invalid username or password";
      toast.error(typeof msg === "string" ? msg : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-canvas">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--brand-primary)] opacity-40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--brand-secondary)] opacity-15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="glass-panel p-8 rounded-2xl border border-token shadow-xl">
          {/* Header with Dynamic Company Master Branding */}
          <div className="text-center mb-8">
            {company.logo_image ? (
              <div className="flex justify-center mb-4">
                <img
                  src={company.logo_image}
                  alt={company.name}
                  className="w-16 h-16 object-contain rounded-2xl p-1.5 bg-surface border border-token shadow-lg shadow-[rgba(0,210,210,0.15)]"
                />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white shadow-lg shadow-[rgba(0,210,210,0.25)] border border-[rgba(0,210,210,0.3)] mb-4">
                <Building2 className="w-7 h-7" />
              </div>
            )}

            <h1 className="text-2xl font-black tracking-tight text-primary-token">
              {company.name || "Platform Console"}
            </h1>
            <p className="text-xs text-secondary-token mt-1.5">
              {company.short_name
                ? `Sign in to manage ${company.short_name} commerce, inventory & channels`
                : "Sign in to manage commerce, inventory & multi-channel services"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              required
              autoComplete="username"
              disabled={loading}
              icon={User}
              size="md"
              showValidation={false}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
              icon={Lock}
              size="md"
              showValidation={false}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-token hover:text-primary-token transition-colors cursor-pointer p-0.5 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              rightIcon={ArrowRight}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 text-center text-[11px] text-muted-token mt-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{company.legal_name || company.name || "Axinix Platform"} · Enterprise Security</span>
        </div>
      </div>
    </div>
  );
}
