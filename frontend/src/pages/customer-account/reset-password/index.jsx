import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, KeyRound, CheckCircle2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!identifier) {
      toast.error("Please enter your registered email or phone");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      toast.success("Security OTP sent to your registered channel (Demo OTP: 123456)");
    }, 600);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error("Please enter OTP and new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Password reset successfully! Please sign in with your new credentials.");
      navigate("/customer-account/auth");
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(0,210,210,0.1)] border border-[rgba(0,210,210,0.2)] text-[var(--brand-primary)] flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Security & Password Reset</h1>
        <p className="text-xs text-gray-400">
          {step === 1 ? "Enter your registered email or phone to receive a 6-digit OTP" : "Enter OTP and choose a strong password"}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email or Phone Number</label>
            <input
              type="text"
              required
              placeholder="alex@example.com or +91 9876543210"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Sending OTP..." : "Send Verification Code"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-3 border-t border-white/[0.08] text-center">
            <Link to="/customer-account/auth" className="text-xs text-gray-400 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">6-Digit OTP Code</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)] font-mono tracking-widest text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Updating..." : "Update Password"}</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
