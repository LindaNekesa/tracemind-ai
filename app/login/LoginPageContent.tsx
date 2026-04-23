'use client'

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
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

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[480px] flex-col justify-between p-12">
        <div>
          <h2 className="text-4xl font-black text-white mb-4">
            Investigate with AI Precision
          </h2>
          <p className="text-gray-400">
            Manage evidence and generate forensic insights.
          </p>
        </div>
        <p className="text-xs text-gray-600">
          © 2026 TraceMind AI
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0d1117]">
        <div className="w-full max-w-[400px]">

          <h1 className="text-3xl font-black text-white mb-6">
            Welcome back
          </h1>

          {/* VERIFIED MESSAGE */}
          {verified === "true" && (
            <div className="mb-4 text-emerald-400">
              ✅ Email verified
            </div>
          )}

          {error && (
            <div className="mb-4 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-white/5 text-white"
              required
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-white/5 text-white"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-gray-400"
            >
              Toggle Password
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 py-3 rounded text-white"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-500">
            No account?{" "}
            <Link href="/register" className="text-blue-400">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}