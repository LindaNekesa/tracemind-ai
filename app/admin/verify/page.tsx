"use client";

import { useState } from "react";

interface Breakdown {
  score: number;
  max: number;
  detail: string;
  flag?: string;
}

interface VerifyResult {
  credibility_score: number;
  verdict: string;
  summary: string;
  flags: string[];
  breakdown: {
    log_quality:         Breakdown;
    description_quality: Breakdown;
    evidence_presence:   Breakdown;
    metadata_coherence:  Breakdown;
    anomaly_alignment:   Breakdown;
  };
  assessed_at: string;
}

const verdictConfig: Record<string, { bg: string; border: string; text: string; icon: string; label: string }> = {
  TRUSTED:        { bg: "bg-green-50",  border: "border-green-400",  text: "text-green-800",  icon: "✅", label: "TRUSTED — Suitable for court proceedings" },
  INCONCLUSIVE:   { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-800", icon: "⚠️", label: "INCONCLUSIVE — Further investigation needed" },
  SUSPICIOUS:     { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-800", icon: "🔶", label: "SUSPICIOUS — Case may be exaggerated or incomplete" },
  FALSE_POSITIVE: { bg: "bg-red-50",    border: "border-red-400",    text: "text-red-800",    icon: "❌", label: "FALSE POSITIVE — Not suitable for court proceedings" },
};

const CASE_TYPES = ["Malware", "Phishing", "Unauthorized Access", "Data Breach", "Insider Threat", "Ransomware", "Fraud", "Other"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES   = ["OPEN", "IN_PROGRESS", "CLOSED"];

function ScoreBar({ label, score, max, detail, color }: { label: string; score: number; max: number; detail: string; color: string }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{score}/{max}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500">{detail}</p>
    </div>
  );
}

export default function CaseVerifierPage() {
  const [form, setForm] = useState({
    title: "", description: "", type: "Other",
    priority: "MEDIUM", status: "OPEN",
    logs: "", evidence_count: "0",
  });
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai/verify-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const vc = result ? verdictConfig[result.verdict] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">⚖️ Case Verifier</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste case details below. The AI engine will assess credibility and determine
          whether the case is suitable for court proceedings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input form */}
        <form onSubmit={handleVerify} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 border-b pb-2">Case Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case Title *</label>
            <input type="text" required placeholder="e.g. Phishing attack on Finance dept"
              value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea rows={4} required placeholder="Describe the incident in detail..."
              value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Log Data <span className="text-gray-400 font-normal">(JSON array or one entry per line)</span>
            </label>
            <textarea rows={6} placeholder={`[{"user":"admin","status":"failed","ip":"192.168.1.1","timestamp":"2024-01-15T10:30:00"},\n {"user":"root","status":"failed","ip":"10.0.0.5","timestamp":"2024-01-15T10:31:00"}]`}
              value={form.logs} onChange={(e) => set("logs", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Evidence Files</label>
            <input type="number" min="0" value={form.evidence_count}
              onChange={(e) => set("evidence_count", e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing...</>
            ) : (
              <><span>⚖️</span> Verify Case</>
            )}
          </button>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        </form>

        {/* Result panel */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 h-full flex flex-col items-center justify-center">
              <span className="text-5xl mb-4">⚖️</span>
              <p className="font-medium text-gray-600">AI Verdict will appear here</p>
              <p className="text-sm mt-1">Fill in the case details and click Verify Case</p>
            </div>
          )}

          {result && vc && (
            <>
              {/* Verdict banner */}
              <div className={`${vc.bg} border-2 ${vc.border} rounded-xl p-5`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{vc.icon}</span>
                  <div>
                    <p className={`text-xl font-black ${vc.text}`}>{vc.label}</p>
                    <p className={`text-sm ${vc.text} opacity-80 mt-0.5`}>{result.summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-3 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${result.credibility_score >= 75 ? "bg-green-500" : result.credibility_score >= 50 ? "bg-yellow-500" : result.credibility_score >= 30 ? "bg-orange-500" : "bg-red-500"}`}
                      style={{ width: `${result.credibility_score}%` }}
                    />
                  </div>
                  <span className={`text-2xl font-black ${vc.text}`}>{result.credibility_score}<span className="text-sm font-normal">/100</span></span>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
                <h3 className="font-semibold text-gray-700">Score Breakdown</h3>
                <ScoreBar label="Log Quality"          score={result.breakdown.log_quality.score}         max={result.breakdown.log_quality.max}         detail={result.breakdown.log_quality.detail}         color="bg-blue-500" />
                <ScoreBar label="Description Quality"  score={result.breakdown.description_quality.score} max={result.breakdown.description_quality.max} detail={result.breakdown.description_quality.detail} color="bg-purple-500" />
                <ScoreBar label="Evidence Presence"    score={result.breakdown.evidence_presence.score}   max={result.breakdown.evidence_presence.max}   detail={result.breakdown.evidence_presence.detail}   color="bg-green-500" />
                <ScoreBar label="Metadata Coherence"   score={result.breakdown.metadata_coherence.score}  max={result.breakdown.metadata_coherence.max}  detail={result.breakdown.metadata_coherence.detail}  color="bg-yellow-500" />
                <ScoreBar label="Anomaly Alignment"    score={result.breakdown.anomaly_alignment.score}   max={result.breakdown.anomaly_alignment.max}   detail={result.breakdown.anomaly_alignment.detail}   color="bg-indigo-500" />
              </div>

              {/* Flags */}
              {result.flags.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-700 mb-3">⚠️ Credibility Flags</h3>
                  <div className="space-y-2">
                    {result.flags.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">
                        <span>🚩</span> {f.replace(/_/g, " ")}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Court recommendation */}
              <div className="bg-gray-900 text-white rounded-xl p-5">
                <h3 className="font-semibold mb-2">⚖️ Court Proceedings Recommendation</h3>
                {result.verdict === "TRUSTED" && (
                  <p className="text-sm text-green-300">This case has sufficient credibility to proceed to court. Evidence and logs are consistent and well-documented.</p>
                )}
                {result.verdict === "INCONCLUSIVE" && (
                  <p className="text-sm text-yellow-300">Additional investigation is recommended before court proceedings. Strengthen evidence documentation and ensure all logs are timestamped.</p>
                )}
                {result.verdict === "SUSPICIOUS" && (
                  <p className="text-sm text-orange-300">Do not proceed to court without further verification. Multiple credibility issues were detected that could undermine the case.</p>
                )}
                {result.verdict === "FALSE_POSITIVE" && (
                  <p className="text-sm text-red-300">This case should NOT proceed to court. The AI engine has detected strong indicators of fabrication, incomplete data, or a test entry.</p>
                )}
                <p className="text-xs text-gray-400 mt-3">Assessed at: {new Date(result.assessed_at).toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
