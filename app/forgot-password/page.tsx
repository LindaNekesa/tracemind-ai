"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">🔍</div>
          <span className="text-lg font-bold text-white">TraceMind AI</span>
        </div>
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 text-sm mb-6">If that email is registered, a reset link has been sent.</p>
            <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium">← Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-white mb-2">Forgot password?</h1>
            <p className="text-gray-500 text-sm mb-8">Enter your email and we&apos;ll send a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Email address</label>
                <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm transition disabled:opacity-60">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : "Send Reset Link"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">← Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
