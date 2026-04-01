"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Report {
  id: string; caseId: string; createdAt: string;
  result: { risk_level: string; risk_score: number; total_logs: number; failed_attempts: number; insights: string[]; suspicious_ips: string[] };
  case?: { title: string; status: string; priority: string };
}

const riskConfig: Record<string, { cls: string; bar: string }> = {
  HIGH:   { cls: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",     bar: "bg-red-500" },
  MEDIUM: { cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", bar: "bg-amber-500" },
  LOW:    { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400", bar: "bg-emerald-500" },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("ALL");
  const [search, setSearch]   = useState("");

  useEffect(() => {
    fetch("/api/ai/results").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setReports(d); }).finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter((r) => {
    const matchRisk   = filter === "ALL" || r.result?.risk_level === filter;
    const matchSearch = !search || r.case?.title?.toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchSearch;
  });

  const counts = { HIGH: reports.filter((r) => r.result?.risk_level === "HIGH").length, MEDIUM: reports.filter((r) => r.result?.risk_level === "MEDIUM").length, LOW: reports.filter((r) => r.result?.risk_level === "LOW").length };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Analysis Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{reports.length} AI analysis report{reports.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/cases" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition">
          + Run Analysis
        </Link>
      </div>

      {/* Risk summary */}
      {reports.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {(["HIGH","MEDIUM","LOW"] as const).map((r) => (
            <button key={r} onClick={() => setFilter(filter === r ? "ALL" : r)}
              className={`${riskConfig[r].cls} border rounded-2xl p-4 text-center transition hover:-translate-y-0.5 ${filter === r ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900" : ""}`}>
              <p className="text-3xl font-black">{counts[r]}</p>
              <p className="text-sm font-semibold mt-1">{r} Risk</p>
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No reports found.</p>
          <Link href="/cases" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500 transition">
            Go to Cases
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const rc = riskConfig[r.result?.risk_level] ?? riskConfig.LOW;
            const pct = r.result?.risk_score ?? 0;
            return (
              <div key={r.id} className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-800 dark:text-white">{r.case?.title ?? `Case ${r.caseId.slice(0, 8)}...`}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${rc.cls}`}>
                    {r.result?.risk_level} · {pct}/100
                  </span>
                </div>

                {/* Risk bar */}
                <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-4">
                  <div className={`h-1.5 rounded-full ${rc.bar} transition-all`} style={{ width: `${pct}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="bg-gray-50 dark:bg-white/3 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Total Logs</p>
                    <p className="font-bold text-gray-800 dark:text-white">{r.result?.total_logs ?? 0}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/3 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Failed Attempts</p>
                    <p className="font-bold text-gray-800 dark:text-white">{r.result?.failed_attempts ?? 0}</p>
                  </div>
                </div>

                {r.result?.insights?.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {r.result.insights.map((ins, i) => (
                      <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                        <span className="text-blue-500 mt-0.5">•</span> {ins}
                      </li>
                    ))}
                  </ul>
                )}

                <Link href={`/cases/${r.caseId}/analysis`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition flex items-center gap-1">
                  View full analysis
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
