"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

interface Case {
  id: string;
  title: string;
  status: string;
  aiResult?: any;
}

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Connect Socket.io
    const s = io("http://localhost:3000");
    setSocket(s);

    s.on("new-case", (data: any) => {
      alert(`New case: ${data.title}`);
      setCases((prev) => [data, ...prev]);
    });

    return () => s.disconnect();
  }, []);

  // Fetch cases from API
  useEffect(() => {
    fetch("/api/cases?limit=100")
      .then((res) => res.json())
      .then((d) => setCases(Array.isArray(d) ? d : (d.cases ?? [])));
  }, []);

  // Analyze case
  const analyzeCase = async (caseId: string) => {
    const res = await fetch(`/api/cases/analyze/${caseId}`, { method: "POST" });
    const updatedCase = await res.json();

    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? updatedCase : c))
    );
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {cases.map((c) => (
        <div key={c.id}>
          <h3>{c.title}</h3>
          <p>Status: {c.status}</p>
          <button onClick={() => analyzeCase(c.id)}>Analyze</button>
          {c.aiResult && <pre>{JSON.stringify(c.aiResult, null, 2)}</pre>}
        </div>
      ))}
    </div>
  );
}