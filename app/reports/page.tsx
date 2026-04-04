"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Case {
  id: string; title: string; status: string; priority: string; type: string;
  createdAt: string; userId: string;
  evidence?: { id: string }[];
  analysis?: { id: string; result: Record<string, unknown> }[];
}

const statusCls: Record<string, string> = {
  OPEN:        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  CLOSED:      "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
};
const priorityCls: Record<string, string> = {
  LOW:      "bg-blue-100 text-blue-600",
  MEDIUM:   "bg-amber-100 text-amber-700",
  HIGH:     "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};
const riskCls: Record<string, string> = {
  HIGH:   "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  LOW:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
};

export default function ReportsPage() {
  const [cases, setCases]     = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    // Fetch cases with their analysis results
    fetch("/api/cases?limit=100")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : (d.cases ?? []);
        // Fetch full case data with analysis for each
        return Promise.all(
          list.map((c: Case) =>
            fetch(`/api/cases/${c.id}`)
              .then((r) => r.json())
              .catch(() => c)
          )
        );
      })
      .then(setCases)
      .finally(() => setLoading(false));
  }, []);

  const filtered = cases.filter((c) => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAnalyses = cases.filter((c) => c.analysis && c.analysis.length > 0).length;
  const highRisk = cases.filter((c) => {
    const latest = c.analysis?.[c.analysis.length - 1];
    return (latest?.result as Record<string, unknown>)?.risk_level === "HIGH";
  }).length;

  const exportCSV = () => {
    const header = "Title,Status,Priority,Type,Evidence Files,Risk Level,Risk Score,Created\n";
    const rows = filtered.map((c) => {
      const latest = c.analysis?.[c.analysis.length - 1];
      const risk = (latest?.result as Record<string, unknown>)?.risk_level ?? "N/A";
      const score = (latest?.result as Record<string, unknown>)?.risk_score ?? "N/A";
      return [
        `"${c.title}"`, c.status, c.priority, c.type,
        c.evidence?.length ?? 0, risk, score,
        new Date(c.createdAt).toLocaleDateString(),
      ].join(",");
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `tracemind-report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Analysis Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cases.length} cases · {totalAnalyses} analysed</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition">
            ⬇️ CSV
          </button>
          <Link href="/cases/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition">
            + New Case
          </Link>
        </div>
      </div>

      {/* Summary */}
      {cases.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{cases.length}</p>
            <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">Total Cases</p>
          </div>
          <div className="bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-violet-600 dark:text-violet-400">{totalAnalyses}</p>
            <p className="text-sm text-violet-700 dark:text-violet-500 mt-1">AI Analysed</p>
          </div>
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-red-600 dark:text-red-400">{highRisk}</p>
            <p className="text-sm text-red-700 dark:text-red-500 mt-1">High Risk</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400" />
        </div>
        <div className="flex gap-2">
          {["ALL","OPEN","IN_PROGRESS","CLOSED"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${statusFilter === s ? "bg-blue-600 text-white" : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10"}`}>
              {s === "ALL" ? "All" : s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Cases list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No reports found</h3>
          <p className="text-sm text-gray-400 mb-6">Create a case and run AI analysis to generate reports.</p>
          <Link href="/cases/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500 transition">
            + Create First Case
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => {
            const latest = c.analysis?.[c.analysis.length - 1];
            const riskLevel = (latest?.result as Record<string, unknown>)?.risk_level as string;
            const riskScore = (latest?.result as Record<string, unknown>)?.risk_score as number;
            const insights  = (latest?.result as Record<string, unknown>)?.insights as string[] | undefined;
            const hasAnalysis = !!latest;

            return (
              <div key={c.id} className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-800 dark:text-white truncate">{c.title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{c.type} · {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusCls[c.status] ?? "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${priorityCls[c.priority] ?? "bg-gray-100 text-gray-600"}`}>{c.priority}</span>
                  </div>
                </div>

                {hasAnalysis ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${riskCls[riskLevel] ?? "bg-gray-100 text-gray-600"}`}>
                        {riskLevel} · {riskScore}/100
                      </span>
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-1.5 rounded-full ${riskLevel === "HIGH" ? "bg-red-500" : riskLevel === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${riskScore}%` }} />
                      </div>
                    </div>
                    {(insights?.length ?? 0) > 0 && (
                      <ul className="space-y-0.5 mb-3">
                        {(insights ?? []).slice(0, 2).map((ins, i) => (
                          <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
                            <span className="text-blue-500 mt-0.5 shrink-0">•</span>{ins}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full">No AI analysis yet</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Link href={`/cases/${c.id}`}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition flex items-center gap-1">
                    View Case →
                  </Link>
                  {!hasAnalysis && (
                    <Link href={`/cases/${c.id}/analysis`}
                      className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition flex items-center gap-1">
                      Run Analysis →
                    </Link>
                  )}
                  {hasAnalysis && (
                    <Link href={`/cases/${c.id}/analysis`}
                      className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 transition">
                      Full Report →
                    </Link>
                  )}
                  <span className="text-xs text-gray-300 dark:text-gray-600 ml-auto">
                    {c.evidence?.length ?? 0} evidence · {c.analysis?.length ?? 0} analyses
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
