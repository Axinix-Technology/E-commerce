import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, KeyRound, CheckCircle2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

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
        <div className="w-12 h-12 rounded-2xl bg-brand-token/10 border border-brand-token/20 text-brand-token flex items-center justify-center mx-auto shadow-xs">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-primary-token tracking-tight">Security & Password Reset</h1>
        <p className="text-xs text-muted-token">
          {step === 1 ? "Enter your registered email or phone to receive a 6-digit OTP" : "Enter OTP and choose a strong password"}
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-4">
          <Input
            label="Email or Phone Number"
            type="text"
            required
            placeholder="alex@example.com or +91 9876543210"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <Button
            type="submit"
            variant="secondary"
            size="md"
            loading={loading}
            fullWidth
            rightIcon={ArrowRight}
          >
            {loading ? "Sending OTP..." : "Send Verification Code"}
          </Button>

          <div className="pt-3 border-t border-token text-center">
            <Link to="/customer-account/auth" className="text-xs text-muted-token hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="card-surface p-5 sm:p-6 rounded-2xl border border-token space-y-4">
          <Input
            label="6-Digit OTP Code"
            type="text"
            required
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="font-mono tracking-widest text-center"
          />

          <Input
            label="New Password"
            type="password"
            required
            icon={Lock}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            icon={Lock}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="secondary"
            size="md"
            loading={loading}
            fullWidth
            icon={CheckCircle2}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      )}
    </div>
  );
}
