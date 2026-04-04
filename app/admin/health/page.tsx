"use client";

import { useEffect, useState, useCallback } from "react";

interface HealthData {
  db: "ok" | "error";
  ai: "ok" | "error";
  uptime: number;
  counts: { users: number; cases: number; evidence: number; notifications: number };
  nextVersion: string;
}

function StatusBadge({ status }: { status: "ok" | "error" | "loading" }) {
  if (status === "loading") return <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">Checking...</span>;
  if (status === "ok") return <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">✓ Online</span>;
  return <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">✗ Error</span>;
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export default function AdminHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/health");
      if (res.ok) {
        setData(await res.json());
        setLastChecked(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">System Health</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()} · auto-refreshes every 30s` : "Checking..."}
          </p>
        </div>
        <button onClick={fetchHealth}
          className="bg-white/5 border border-white/10 text-gray-300 px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition">
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-white/3 rounded-2xl animate-pulse" />)}
        </div>
      ) : data ? (
        <>
          {/* Status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-300">🗄️ Database</p>
                <StatusBadge status={data.db} />
              </div>
              <p className="text-xs text-gray-500">PostgreSQL via Prisma</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-300">🤖 AI Engine</p>
                <StatusBadge status={data.ai} />
              </div>
              <p className="text-xs text-gray-500">FastAPI at 127.0.0.1:8000</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-300">⏱️ Server Uptime</p>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{formatUptime(data.uptime)}</span>
              </div>
              <p className="text-xs text-gray-500">Node.js process uptime</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-300">⚡ Next.js</p>
                <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded-full">v16</span>
              </div>
              <p className="text-xs text-gray-500">App Router</p>
            </div>
          </div>

          {/* DB record counts */}
          <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-4">Database Records</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(data.counts).map(([key, val]) => (
                <div key={key} className="text-center">
                  <p className="text-2xl font-black text-white">{val}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{key}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-sm">Failed to load health data.</p>
      )}
    </div>
  );
}
