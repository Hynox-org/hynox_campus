"use client";

import React, { useState } from "react";
import { 
  signInWithGoogle, 
  signInWithPasswordAction, 
  signUpPublicUserAction 
} from "@/app/actions/auth-actions";
import { Terminal, ShieldCheck, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "invite">("login");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [inviteToken, setInviteToken] = useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const msg = params.get("message");
      const err = params.get("error");
      if (msg === "AlreadyActivated") {
        setSuccessMessage("Your account is already activated. Please sign in with Google directly.");
      } else if (err === "OAuthExchangeFailed") {
        setErrorMessage("Google authentication failed. Please try again.");
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      await signInWithGoogle("/");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initialize Google Sign-In.");
      setLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const res = await signInWithPasswordAction(formData);
    if (res?.error) {
      setErrorMessage(res.error);
      setLoading(false);
    } else {
      // Success: browser reload or direct router check resolves session and redirects
      router.refresh();
      router.push("/");
    }
  };

  const handlePasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("fullName", fullName);

    const res = await signUpPublicUserAction(formData);
    if (res?.error) {
      setErrorMessage(res.error);
      setLoading(false);
    } else {
      setSuccessMessage("Public registration successful! Please sign in using your credentials.");
      setActiveTab("login");
      setLoading(false);
      setPassword("");
    }
  };

  const handleClaimInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !inviteToken) {
      setErrorMessage("Please fill in both fields.");
      return;
    }
    // Route directly to the verify page with parameters
    router.push(`/onboarding/verify?token=${inviteToken}&email=${encodeURIComponent(email)}`);
  };

  // Google G Logo SVG
  const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-[#0F172A]">
      <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-md">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-[#2563EB]/10 text-[#2563EB] p-2.5 rounded-xl border border-[#2563EB]/20 mb-3">
            <Terminal size={22} className="stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">Hynox Campus</h2>
          <p className="text-xs text-[#475569] mt-1">Platform Authentication Portal</p>
        </div>

        {/* Tab Headers */}
        <div className="grid grid-cols-3 gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-1 mb-6">
          <button
            onClick={() => {
              setActiveTab("login");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`text-xs font-semibold py-1.5 rounded-md transition-all ${
              activeTab === "login"
                ? "bg-white text-[#2563EB] shadow-sm border border-[#E2E8F0]"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`text-xs font-semibold py-1.5 rounded-md transition-all ${
              activeTab === "signup"
                ? "bg-white text-[#2563EB] shadow-sm border border-[#E2E8F0]"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => {
              setActiveTab("invite");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`text-xs font-semibold py-1.5 rounded-md transition-all ${
              activeTab === "invite"
                ? "bg-white text-[#2563EB] shadow-sm border border-[#E2E8F0]"
                : "text-[#475569] hover:text-[#0F172A]"
            }`}
          >
            Claim Token
          </button>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-4 bg-[#DC2626]/5 border border-[#DC2626]/20 text-[#DC2626] rounded-lg p-3 text-xs flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-[#16A34A]/5 border border-[#16A34A]/20 text-[#16A34A] rounded-lg p-3 text-xs flex items-start gap-2">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tabs Content */}
        {activeTab === "login" && (
          <div className="space-y-4">
            {/* Google OAuth Login Button at Top */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-[#0F172A] hover:bg-[#0F172A]/90 border border-[#E2E8F0] text-white text-xs font-semibold py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 duration-200"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-white px-2.5 text-[#475569] font-semibold uppercase tracking-wider">Or credentials</span>
              </div>
            </div>

            <form onSubmit={handlePasswordSignIn} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-[#475569]" size={15} />
                <input
                  type="email"
                  placeholder="Institutional Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-10 pr-3 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-[#475569]" size={15} />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-10 pr-3 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm hover:bg-[#2563EB]/95 transition-all disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In with Credentials"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "signup" && (
          <div className="space-y-4">
            {/* Google OAuth Login Button at Top */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-[#0F172A] hover:bg-[#0F172A]/90 border border-[#E2E8F0] text-white text-xs font-semibold py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 duration-200"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-white px-2.5 text-[#475569] font-semibold uppercase tracking-wider">Or credentials</span>
              </div>
            </div>

            <form onSubmit={handlePasswordSignUp} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 text-[#475569]" size={15} />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-10 pr-3 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-[#475569]" size={15} />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-10 pr-3 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-[#475569]" size={15} />
                <input
                  type="password"
                  placeholder="Create Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-10 pr-3 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm hover:bg-[#2563EB]/95 transition-all disabled:opacity-50"
              >
                {loading ? "Registering..." : "Sign Up"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "invite" && (
          <form onSubmit={handleClaimInvite} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-[#475569]" size={15} />
              <input
                type="email"
                placeholder="Registered Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-10 pr-3 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#475569]" size={15} />
              <input
                type="text"
                placeholder="Invitation Token UUID"
                required
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-10 pr-3 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#2563EB] shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2563EB] text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm hover:bg-[#2563EB]/95 transition-all flex items-center justify-center gap-2"
            >
              Verify Token Details
              <ArrowRight size={14} />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
