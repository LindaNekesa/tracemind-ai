"use client";

import { useEffect, useState } from "react";

interface AnalysisResult {
  id: string;
  caseId: string;
  result: any;
  createdAt: string;
  case?: { title: string };
}

export default function AIResults() {
  const [results, setResults] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    fetch("/api/ai/results")
      .then((res) => res.json())
      .then(setResults);
  }, []);

  return (
    <div className="grid gap-4">
      {results.map((r) => (
        <div key={r.id} className="bg-white p-4 rounded shadow">
          <h2 className="font-bold">{r.case?.title ?? r.caseId}</h2>
          <p className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(r.result, null, 2)}
          </pre>
        </div>
      ))}
      {!results.length && <p className="text-gray-500">No analysis results yet.</p>}
    </div>
  );
}
