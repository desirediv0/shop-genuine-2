"use client";

import type React from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, Sparkles, ShieldCheck, Lock } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError("Email address is required");
      return;
    }
    if (!password) {
      setFormError("Password is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
    } catch (err: any) {
      console.error("Login error:", err);
      setFormError(err.message || "Invalid credentials. Please verify email and password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0D0D12] text-white font-sans">
      {/* Left Side - Background Image & Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-[#161622]">
        <div className="absolute inset-0">
          <img
            src="/admin_luxury_login.png"
            alt="Shop Genuine Admin Portal"
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              // Fallback if image is loading
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0D0D12] via-[#0D0D12]/70 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 h-full">
          {/* Top Brand Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 w-fit text-xs font-semibold uppercase tracking-wider text-orange-300">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            Admin Control Desk
          </div>

          {/* Bottom Headline */}
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="block h-px w-10 bg-gradient-to-r from-[#F97316] to-[#1D4ED8]" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-orange-300 font-semibold">
                Shop Genuine
              </span>
            </div>

            <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl xl:text-5xl font-light tracking-tight leading-tight">
              Admin <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#1D4ED8]">Control Desk</span>
            </h2>

            <p className="text-sm text-white/60 font-light leading-relaxed">
              Manage nutrition, grocery, pharmacy and cosmetics catalogs, order fulfillment, customer care, and store operations — all in one place.
            </p>

            <div className="flex items-center gap-6 pt-4 text-xs text-white/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F97316]" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#F97316]" />
                <span>Secure Access Token</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12 relative bg-[#0D0D12]">
        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Brand Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="block h-px w-6 bg-[#F97316]" />
              <span className="text-[10px] uppercase tracking-[0.35em] text-[#F97316] font-semibold">
                Admin Authentication
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-['Playfair_Display'] font-light tracking-tight">
              Shop <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#1D4ED8]">Genuine</span>
            </h1>

            <p className="text-xs sm:text-sm text-white/50 font-light leading-relaxed">
              Enter your admin credentials to access the dashboard.
            </p>
          </div>

          {/* Error Message Display */}
          {(error || formError) && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/25 p-4 text-center">
              <p className="text-xs text-red-400 font-medium">
                {formError || error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[11px] uppercase tracking-[0.15em] text-white/60 font-medium"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="connect.genuinenutrition@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  required
                  className={`w-full h-12 px-4 bg-white/[0.04] border text-white placeholder-white/20 text-sm font-normal
                    transition-all duration-300 rounded-xl outline-none
                    ${focusedField === "email"
                      ? "border-[#F97316] shadow-[0_0_0_2px_rgba(249,115,22,0.2)] bg-white/[0.06]"
                      : "border-white/10 hover:border-white/20"
                    }
                    disabled:opacity-40 disabled:cursor-not-allowed`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-[11px] uppercase tracking-[0.15em] text-white/60 font-medium"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  required
                  className={`w-full h-12 px-4 pr-12 bg-white/[0.04] border text-white placeholder-white/20 text-sm font-normal
                    transition-all duration-300 rounded-xl outline-none
                    ${focusedField === "password"
                      ? "border-[#F97316] shadow-[0_0_0_2px_rgba(249,115,22,0.2)] bg-white/[0.06]"
                      : "border-white/10 hover:border-white/20"
                    }
                    disabled:opacity-40 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 text-xs font-semibold uppercase tracking-wider
                bg-gradient-to-r from-[#F97316] to-[#1D4ED8] hover:opacity-95
                text-white rounded-full shadow-[0_4px_20px_rgba(249,115,22,0.35)]
                transition-all duration-300 active:scale-[0.98]
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 mt-6"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </Button>
          </form>

          {/* Footer Branding */}
          <div className="pt-6 border-t border-white/10 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">
              SHOP GENUINE — ADMIN PORTAL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
