"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

function ResetForm() {
  const router = useRouter();
  const token  = useSearchParams().get("token") ?? "";
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    const res  = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const data = await res.json();
    if (res.ok) { toast.success("Password reset! Please sign in."); router.push("/login"); }
    else        { toast.error(data.error || "Reset failed"); }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">New Password</label>
        <div className="relative">
          <input type={showPw ? "text" : "password"} required placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12" />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition p-1">
            {showPw ? "🙈" : "👁"}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Confirm Password</label>
        <input type={showPw ? "text" : "password"} required placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${confirm && confirm !== password ? "border-red-500/50" : "border-white/10"}`} />
      </div>
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm transition disabled:opacity-60">
        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</> : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">🔍</div>
          <span className="text-lg font-bold text-white">TraceMind AI</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Set new password</h1>
        <p className="text-gray-500 text-sm mb-8">Choose a strong password for your account.</p>
        <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
          <ResetForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
