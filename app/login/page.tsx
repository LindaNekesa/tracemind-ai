"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Welcome back!");
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#060b18]">

      {/* Left branding panel */}
      <div className="hidden lg:flex w-[480px] shrink-0 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-base shadow-lg shadow-blue-600/40">🔍</div>
            <span className="text-xl font-bold text-white tracking-tight">TraceMind AI</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Investigate with<br />
            <span className="gradient-text">AI-Powered</span><br />
            Precision
          </h2>
          <p className="text-gray-400 text-base leading-relaxed">
            Manage evidence, detect anomalies, and generate forensic insights in real time.
          </p>
        </div>
        <div className="relative space-y-3">
          {["Evidence Management", "AI Log Analysis", "Risk Scoring & Accuracy Metrics", "Court Case Verification"].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-gray-300">{f}</span>
            </div>
          ))}
        </div>
        <p className="relative text-xs text-gray-600">© 2026 TraceMind AI — Digital Forensics Platform</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0d1117]">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">🔍</div>
            <span className="text-lg font-bold text-white">TraceMind AI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-gray-500 text-sm">Sign in to your account to continue.</p>
          </div>

          {/* Verified banner */}
          {verified === "true" && (
            <div className="mb-6 flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm">
              ✅ Email verified! You can now sign in.
            </div>
          )}
          {verified === "error" && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              ❌ Email verification failed. Please try again.
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Email address
              </label>
              <input
                type="email" placeholder="you@example.com" value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                  required autoComplete="current-password" minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition p-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm transition shadow-xl shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
