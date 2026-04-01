"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface AccuracyRule {
  rule: string;
  triggered: boolean;
  precision: number;
  recall: number;
  f1: number;
  confidence: number;
}

interface AccuracyMetrics {
  overall_precision: number;
  overall_recall: number;
  overall_f1: number;
  overall_confidence: number;
  rules: AccuracyRule[];
}

interface AnalysisResult {
  total_logs: number;
  failed_attempts: number;
  suspicious_ips: string[];
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  insights: string[];
  analyzed_at: string;
  accuracy: AccuracyMetrics;
}

const riskColor = { LOW: "text-green-600", MEDIUM: "text-yellow-600", HIGH: "text-red-600" };

export default function CaseAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [caseData, setCaseData] = useState<{ title: string; logs: Record<string, unknown>[] } | null>(null);

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then((r) => r.json())
      .then(setCaseData);
  }, [id]);

  const runAnalysis = async () => {
    if (!caseData) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: id, logs: caseData.logs }),
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

  const timelineData: { label: string; value: number }[] = result
    ? [
        { label: "Total Logs", value: result.total_logs },
        { label: "Failed", value: result.failed_attempts },
        { label: "Susp. IPs", value: result.suspicious_ips.length },
        { label: "Risk Score", value: result.risk_score },
      ]
    : [];

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-2">AI Analysis</h1>
      {caseData && <p className="text-gray-500 mb-6">{caseData.title}</p>}

      <button
        onClick={runAnalysis}
        disabled={loading || !caseData}
        className="mb-6 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Run Analysis"}
      </button>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {result && (
        <>
          <section className="mb-6 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Risk Assessment</h2>
            <p className="text-4xl font-bold">{result.risk_score}<span className="text-base font-normal text-gray-500">/100</span></p>
            <p className={`text-lg font-semibold mt-1 ${riskColor[result.risk_level]}`}>{result.risk_level} RISK</p>
          </section>

          <section className="mb-6 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Insights</h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              {result.insights.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
          </section>

          <section className="mb-6 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Analysis Overview</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timelineData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {result.suspicious_ips.length > 0 && (
            <section className="mb-6 bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">Suspicious IPs</h2>
              <ul className="list-disc ml-6 text-gray-700">
                {result.suspicious_ips.map((ip) => <li key={ip}>{ip}</li>)}
              </ul>
            </section>
          )}

          {result.accuracy && (
            <section className="mb-6 bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Model Accuracy</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Precision", value: result.accuracy.overall_precision },
                  { label: "Recall",    value: result.accuracy.overall_recall },
                  { label: "F1 Score",  value: result.accuracy.overall_f1 },
                  { label: "Confidence",value: result.accuracy.overall_confidence },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{(value * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2 border">Rule</th>
                    <th className="p-2 border">Triggered</th>
                    <th className="p-2 border">Precision</th>
                    <th className="p-2 border">Recall</th>
                    <th className="p-2 border">F1</th>
                    <th className="p-2 border">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {result.accuracy.rules.map((r) => (
                    <tr key={r.rule} className="hover:bg-gray-50">
                      <td className="p-2 border">{r.rule}</td>
                      <td className="p-2 border">
                        <span className={r.triggered ? "text-red-600 font-semibold" : "text-gray-400"}>
                          {r.triggered ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="p-2 border">{(r.precision * 100).toFixed(1)}%</td>
                      <td className="p-2 border">{(r.recall * 100).toFixed(1)}%</td>
                      <td className="p-2 border">{(r.f1 * 100).toFixed(1)}%</td>
                      <td className="p-2 border">{(r.confidence * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <p className="text-xs text-gray-400">Analyzed at: {new Date(result.analyzed_at).toLocaleString()}</p>
        </>
      )}
    </div>
  );
}
