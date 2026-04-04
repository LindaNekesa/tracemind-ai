"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import Link from "next/link";

interface AccuracyRule { rule: string; triggered: boolean; precision: number; recall: number; f1: number; confidence: number; }
interface AnalysisResult {
  total_logs: number; failed_attempts: number; suspicious_ips: string[];
  risk_score: number; risk_level: "LOW" | "MEDIUM" | "HIGH";
  insights: string[]; analyzed_at: string;
  accuracy: { overall_precision: number; overall_recall: number; overall_f1: number; overall_confidence: number; rules: AccuracyRule[] };
}

const riskConfig = {
  LOW:    { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", bar: "bg-emerald-500" },
  MEDIUM: { text: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",       bar: "bg-amber-500" },
  HIGH:   { text: "text-red-600 dark:text-red-400",        bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",               bar: "bg-red-500" },
};

export default function CaseAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult]   = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [caseData, setCaseData] = useState<{ title: string; logs: unknown[] } | null>(null);
  const [logsInput, setLogsInput] = useState("");
  const [showLogsInput, setShowLogsInput] = useState(false);

  useEffect(() => {
    fetch(`/api/cases/${id}`).then((r) => r.json()).then((d) => {
      setCaseData(d);
      if (!d.logs || (Array.isArray(d.logs) && d.logs.length === 0)) {
        setShowLogsInput(true);
      }
    });
  }, [id]);

  const getLogs = (): unknown[] => {
    // Use inline logs if provided, otherwise use case logs
    if (logsInput.trim()) {
      try { return JSON.parse(logsInput); }
      catch { return logsInput.split("\n").filter(Boolean).map((l) => ({ raw: l })); }
    }
    return caseData?.logs ?? [];
  };

  const runAnalysis = async () => {
    const logs = getLogs();
    if (!logs.length) { setError("Please add log data before running analysis."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: id, logs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { label: "Total", value: result.total_logs },
    { label: "Failed", value: result.failed_attempts },
    { label: "Susp. IPs", value: result.suspicious_ips.length },
    { label: "Risk", value: result.risk_score },
  ] : [];

  const rc = result ? riskConfig[result.risk_level] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/cases/${id}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">AI Analysis</h1>
          {caseData && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{caseData.title}</p>}
        </div>
      </div>

      {/* Log input — shown when case has no logs */}
      {showLogsInput && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">This case has no log data</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Paste log data below to run analysis, or go back and edit the case to add logs.</p>
            </div>
          </div>
          <textarea rows={6}
            placeholder={`Paste log data here (JSON array or one entry per line):\n[{"user":"admin","status":"failed","ip":"192.168.1.1","timestamp":"2024-01-15T10:30:00"},\n {"user":"root","status":"failed","ip":"10.0.0.5","timestamp":"2024-01-15T10:31:00"}]`}
            value={logsInput} onChange={(e) => setLogsInput(e.target.value)}
            className="w-full px-4 py-3 border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-black/20 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none" />
        </div>
      )}

      {/* Run button */}
      <div className="flex items-center gap-3">
        <button onClick={runAnalysis} disabled={loading || !caseData}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-500 transition disabled:opacity-50 shadow-lg shadow-blue-600/25">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
          ) : (
            <><span>🤖</span> Run Analysis</>
          )}
        </button>
        {!showLogsInput && (
          <button onClick={() => setShowLogsInput(true)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition">
            + Add/override logs
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {result && rc && (
        <div className="space-y-5">
          {/* Risk card */}
          <div className={`border rounded-2xl p-6 ${rc.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-700 dark:text-gray-300">Risk Assessment</h2>
              <span className={`text-lg font-black ${rc.text}`}>{result.risk_level} RISK</span>
            </div>
            <div className="flex items-center gap-4">
              <p className={`text-5xl font-black ${rc.text}`}>{result.risk_score}<span className="text-lg font-normal text-gray-400">/100</span></p>
              <div className="flex-1 h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className={`h-3 rounded-full ${rc.bar} transition-all duration-700`} style={{ width: `${result.risk_score}%` }} />
              </div>
            </div>
          </div>

          {/* Stats + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-5">
              <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Analysis Overview</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <CartesianGrid stroke="#f0f0f0" strokeDasharray="4 4" />
                  <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-5">
              <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Insights</h2>
              <ul className="space-y-2">
                {result.insights.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-blue-500 mt-0.5 shrink-0">•</span>{ins}
                  </li>
                ))}
              </ul>
              {result.suspicious_ips.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Suspicious IPs</p>
                  <div className="flex flex-wrap gap-2">
                    {result.suspicious_ips.map((ip) => (
                      <span key={ip} className="text-xs bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-1 rounded-lg font-mono">{ip}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Accuracy metrics */}
          {result.accuracy && (
            <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-5">
              <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Model Accuracy</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {[
                  { label: "Precision",  value: result.accuracy.overall_precision },
                  { label: "Recall",     value: result.accuracy.overall_recall },
                  { label: "F1 Score",   value: result.accuracy.overall_f1 },
                  { label: "Confidence", value: result.accuracy.overall_confidence },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{(value * 100).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-white/3">
                  <tr className="text-left text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {["Rule","Triggered","Precision","Recall","F1","Confidence"].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {result.accuracy.rules.map((r) => (
                    <tr key={r.rule} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                      <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{r.rule}</td>
                      <td className="px-3 py-2"><span className={r.triggered ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-400"}>
                        {r.triggered ? "Yes" : "No"}</span></td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{(r.precision*100).toFixed(1)}%</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{(r.recall*100).toFixed(1)}%</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{(r.f1*100).toFixed(1)}%</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{(r.confidence*100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-gray-400">Analyzed at: {new Date(result.analyzed_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
