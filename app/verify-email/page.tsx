"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (r.ok || r.redirected) {
          setStatus("success");
          setTimeout(() => router.push("/login?verified=true"), 2000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Verifying your email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <p className="text-4xl mb-4">✅</p>
            <h1 className="text-white text-xl font-bold mb-2">Email Verified!</h1>
            <p className="text-gray-400 text-sm mb-6">Redirecting you to login...</p>
            <Link href="/login" className="text-blue-400 text-sm hover:underline">Go to Login</Link>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-4xl mb-4">❌</p>
            <h1 className="text-white text-xl font-bold mb-2">Verification Failed</h1>
            <p className="text-gray-400 text-sm mb-6">The link is invalid or has expired.</p>
            <Link href="/register" className="text-blue-400 text-sm hover:underline">Register again</Link>
          </>
        )}
      </div>
    </div>
  );
}
