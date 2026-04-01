"use client";

import { useState } from "react";

interface AnalysisResult {
  risk_score: number;
  risk_level: string;
  total_logs: number;
  failed_attempts: number;
  insights: string[];
  accuracy?: {
    overall_confidence: number;
    overall_f1: number;
  };
}

interface Props {
  caseId: string;
  logs: Record<string, unknown>[];
  onResult?: (result: AnalysisResult) => void;
}

export default function AiAnalysis({ caseId, logs, onResult }: Props) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, logs }),
      });
      const data = await res.json() as AnalysisResult & { error?: string };
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      onResult?.(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const riskColor: Record<string, string> = {
    LOW: "text-green-600",
    MEDIUM: "text-yellow-600",
    HIGH: "text-red-600",
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-3">AI Analysis</h2>
      <button
        onClick={analyze}
        disabled={loading || !logs?.length}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Run Analysis"}
      </button>
      {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
      {result && (
        <div className="mt-4 space-y-2 text-sm">
          <p>Risk Score: <span className={`font-bold ${riskColor[result.risk_level]}`}>{result.risk_score}/100 ({result.risk_level})</span></p>
          <p>Total Logs: {result.total_logs}</p>
          <p>Failed Attempts: {result.failed_attempts}</p>
          {result.accuracy && (
            <p>Model Confidence: <span className="font-semibold text-indigo-600">{(result.accuracy.overall_confidence * 100).toFixed(1)}%</span>
            {" "}· F1: <span className="font-semibold text-indigo-600">{(result.accuracy.overall_f1 * 100).toFixed(1)}%</span></p>
          )}
          {result.insights?.map((i: string, idx: number) => (
            <p key={idx} className="text-gray-600">• {i}</p>
          ))}
        </div>
      )}
    </div>
  );
}
