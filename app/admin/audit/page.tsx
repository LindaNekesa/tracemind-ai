"use client";

import { useEffect, useState } from "react";

interface LogEntry { type: string; icon: string; action: string; actor: string; time: string; meta: string; }

const typeColor: Record<string, string> = {
  case:     "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  evidence: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  analysis: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  message:  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
};

export default function AuditLogPage() {
  const [log, setLog]       = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/audit").then((r) => r.json()).then(setLog).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? log : log.filter((l) => l.type === filter);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Audit Log</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Complete record of system activity</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "case", "evidence", "analysis", "message"].map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition capitalize ${filter === t ? "bg-blue-600 text-white" : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10"}`}>
            {t === "all" ? "All Activity" : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-gray-500 dark:text-gray-400">No activity recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
          {filtered.map((entry, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4 border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/3 transition">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-base shrink-0">{entry.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{entry.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{entry.actor}</span>
                  {entry.meta && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[entry.type] ?? "bg-gray-100 text-gray-600"}`}>{entry.meta}</span>}
                </div>
              </div>
              <p className="text-xs text-gray-400 shrink-0">{new Date(entry.time).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
