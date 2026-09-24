import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authProvider";
import axiosInstance from "../api/axiosInstance";
import { Building2, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Native Browser SHA-256 Hasher
 * Pre-hashes the password on client so plain-text never traverses the wire.
 */
async function computeSha256(rawString) {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form State: 'password' strictly holds the raw user input (e.g. 8 dots on screen)
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic Company Master State (Revealed from DB)
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
    if (!username || !password) {
      toast.error("Please provide both username and password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      // 1. Pre-hash password ONLY for the outgoing payload
      // Note: 'password' state is untouched so input field retains user's typed dots without jumping to 64 chars
      const hashedPassword = await computeSha256(password);

      // 2. Client Device & Session fingerprint
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

      // 3. Dispatch login execution
      const user = await login(username, hashedPassword, sessionData);
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
      {/* Ambient background glow effects using Brand Secondary & Accent */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--brand-primary)] opacity-40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--brand-secondary)] opacity-15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="glass-panel p-8 rounded-2xl border border-token">
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

          {/* Demo Credentials Helper */}
          <div className="mb-6 p-3 rounded-xl bg-[rgba(0,210,210,0.08)] border border-[rgba(0,210,210,0.25)] text-xs text-secondary-token flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[var(--brand-secondary)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-token">Default Super Admin</p>
              <p className="text-[11px] text-muted-token mt-0.5">
                Username: <span className="font-mono text-primary-token font-semibold">admin</span> · Password:{" "}
                <span className="font-mono text-primary-token font-semibold">Admin@123456</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-token mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-token">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm text-primary-token placeholder:text-muted-token focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-token mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-token">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl glass-input text-sm text-primary-token placeholder:text-muted-token focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-token hover:text-primary-token transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-secondary-bright)] hover:brightness-110 text-[#081C2C] text-sm font-bold shadow-lg shadow-[rgba(0,210,210,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#081C2C]" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#081C2C]" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-token mt-6">
          {company.legal_name || company.name || "Axinix Platform"} · v1.0.0
        </p>
      </div>
    </div>
  );
}
