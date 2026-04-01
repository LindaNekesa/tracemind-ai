"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CaseResult {
  caseId: string;
  title: string;
  credibility_score: number;
  verdict: string;
  verdict_color: string;
  summary: string;
  flags: string[];
  breakdown: {
    log_quality:         { score: number; max: number; detail: string };
    description_quality: { score: number; max: number; detail: string };
    evidence_presence:   { score: number; max: number; detail: string };
    metadata_coherence:  { score: number; max: number; detail: string };
    anomaly_alignment:   { score: number; max: number; detail: string };
  };
}

const verdictStyle: Record<string, string> = {
  TRUSTED:        "bg-green-100 text-green-800 border-green-300",
  INCONCLUSIVE:   "bg-yellow-100 text-yellow-800 border-yellow-300",
  SUSPICIOUS:     "bg-orange-100 text-orange-800 border-orange-300",
  FALSE_POSITIVE: "bg-red-100 text-red-800 border-red-300",
};

const verdictIcon: Record<string, string> = {
  TRUSTED: "✅", INCONCLUSIVE: "⚠️", SUSPICIOUS: "🔶", FALSE_POSITIVE: "❌",
};

const scoreBar = (score: number, max: number, color: string) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${(score / max) * 100}%` }} />
    </div>
    <span className="text-xs text-gray-500 w-10 text-right">{score}/{max}</span>
  </div>
);

export default function CredibilityPage() {
  const [results, setResults] = useState<CaseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/ai/credibility")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setResults(d);
        else setError(d.error || "Failed to load");
      })
      .catch(() => setError("AI engine unreachable. Make sure the Python server is running."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? results : results.filter((r) => r.verdict === filter);
  const counts = {
    TRUSTED:        results.filter((r) => r.verdict === "TRUSTED").length,
    INCONCLUSIVE:   results.filter((r) => r.verdict === "INCONCLUSIVE").length,
    SUSPICIOUS:     results.filter((r) => r.verdict === "SUSPICIOUS").length,
    FALSE_POSITIVE: results.filter((r) => r.verdict === "FALSE_POSITIVE").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Case Credibility Analysis</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI-powered trustworthiness scoring for all cases</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {(["TRUSTED","INCONCLUSIVE","SUSPICIOUS","FALSE_POSITIVE"] as const).map((v) => (
          <button key={v} onClick={() => setFilter(filter === v ? "ALL" : v)}
            className={`rounded-xl p-4 text-left border-2 transition ${verdictStyle[v]} ${filter === v ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}>
            <p className="text-2xl font-black">{counts[v]}</p>
            <p className="text-sm font-semibold mt-1">{verdictIcon[v]} {v.replace("_", " ")}</p>
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-white rounded-xl p-10 text-center text-gray-400">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Scoring cases with AI...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-xl p-10 text-center text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p>No cases found{filter !== "ALL" ? ` with verdict: ${filter}` : ""}.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.caseId} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setExpanded(expanded === r.caseId ? null : r.caseId)}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">{verdictIcon[r.verdict]}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{r.summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {r.flags.length > 0 && (
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                      {r.flags.length} flag{r.flags.length > 1 ? "s" : ""}
                    </span>
                  )}
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-800">{r.credibility_score}</p>
                    <p className="text-xs text-gray-400">/ 100</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${verdictStyle[r.verdict]}`}>
                    {r.verdict.replace("_", " ")}
                  </span>
                  <Link href={`/cases/${r.caseId}`} onClick={(e) => e.stopPropagation()}
                    className="text-xs text-blue-600 hover:underline">View →</Link>
                </div>
              </div>
            </div>

            {expanded === r.caseId && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {/* Score breakdown */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Score Breakdown</h3>
                  <div className="space-y-2.5">
                    {[
                      { label: "Log Quality",          data: r.breakdown.log_quality,         color: "bg-blue-500" },
                      { label: "Description Quality",  data: r.breakdown.description_quality, color: "bg-purple-500" },
                      { label: "Evidence Presence",    data: r.breakdown.evidence_presence,   color: "bg-green-500" },
                      { label: "Metadata Coherence",   data: r.breakdown.metadata_coherence,  color: "bg-yellow-500" },
                      { label: "Anomaly Alignment",    data: r.breakdown.anomaly_alignment,   color: "bg-indigo-500" },
                    ].map(({ label, data, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span className="font-medium">{label}</span>
                          <span className="text-gray-400">{data.detail}</span>
                        </div>
                        {scoreBar(data.score, data.max, color)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flags */}
                {r.flags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Credibility Flags</h3>
                    <div className="flex flex-wrap gap-2">
                      {r.flags.map((f) => (
                        <span key={f} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded-lg font-mono">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
