"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  credibility?: {
    verdict: string;
    credibility_score: number;
    flags: string[];
  };
}

interface CaseContext {
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  logs: string;
  evidence_count: string;
}

const CASE_TYPES    = ["Other", "Malware", "Phishing", "Unauthorized Access", "Data Breach", "Insider Threat", "Ransomware", "Fraud"];
const PRIORITIES    = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUSES      = ["OPEN", "IN_PROGRESS", "CLOSED"];

const verdictBadge: Record<string, string> = {
  TRUSTED:        "bg-green-100 text-green-800",
  INCONCLUSIVE:   "bg-yellow-100 text-yellow-800",
  SUSPICIOUS:     "bg-orange-100 text-orange-800",
  FALSE_POSITIVE: "bg-red-100 text-red-800",
};
const verdictIcon: Record<string, string> = {
  TRUSTED: "✅", INCONCLUSIVE: "⚠️", SUSPICIOUS: "🔶", FALSE_POSITIVE: "❌",
};

const SUGGESTED = [
  "Is this case credible enough for court?",
  "What attack patterns are present?",
  "Who are the main suspects?",
  "What are the recommended next steps?",
  "What MITRE ATT&CK techniques apply?",
  "Are there any suspicious IPs?",
];

export default function AdminAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm the TraceMind AI Assistant. Paste your case details on the left, upload evidence, then ask me anything about the case — including whether it's suitable for court proceedings." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [caseCtx, setCaseCtx] = useState<CaseContext>({
    title: "", description: "", type: "Other",
    priority: "MEDIUM", status: "OPEN", logs: "", evidence_count: "0",
  });
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setCtx = (k: string, v: string) => setCaseCtx((c) => ({ ...c, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const files = Array.from(e.target.files);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/evidence/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error(`Failed: ${file.name}`);
        setUploadedFiles((p) => [...p, file.name]);
      }
      const newCount = String(parseInt(caseCtx.evidence_count || "0") + files.length);
      setCtx("evidence_count", newCount);
      toast.success(`${files.length} file(s) uploaded`);
      setMessages((m) => [...m, {
        role: "assistant",
        content: `📎 ${files.length} evidence file(s) uploaded: ${files.map((f) => f.name).join(", ")}. Evidence count updated to ${newCount}.`,
      }]);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const buildCasePayload = () => {
    let logs: unknown[] = [];
    if (caseCtx.logs.trim()) {
      try { logs = JSON.parse(caseCtx.logs); }
      catch { logs = caseCtx.logs.split("\n").filter(Boolean).map((l) => ({ raw: l })); }
    }
    return {
      title:       caseCtx.title,
      description: caseCtx.description,
      type:        caseCtx.type,
      priority:    caseCtx.priority,
      status:      caseCtx.status,
      logs,
    };
  };

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: "user", content: question };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          history: messages.slice(-6),
          case: buildCasePayload(),
          evidence_count: parseInt(caseCtx.evidence_count) || 0,
          analysis_count: 0,
          risk_score: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI error");

      setMessages((m) => [...m, {
        role: "assistant",
        content: data.answer,
        credibility: data.credibility ? {
          verdict: data.credibility.verdict,
          credibility_score: data.credibility.credibility_score,
          flags: data.credibility.flags,
        } : undefined,
      }]);
    } catch (e: unknown) {
      setMessages((m) => [...m, {
        role: "assistant",
        content: `⚠️ ${e instanceof Error ? e.message : "Something went wrong. Make sure the AI engine is running."}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex gap-4">
      {/* Left — Case context panel */}
      <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📋</span> Case Context
          </h2>
          <div className="space-y-3">
            <input type="text" placeholder="Case title" value={caseCtx.title}
              onChange={(e) => setCtx("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <textarea rows={3} placeholder="Case description..." value={caseCtx.description}
              onChange={(e) => setCtx("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <div className="grid grid-cols-2 gap-2">
              <select value={caseCtx.type} onChange={(e) => setCtx("type", e.target.value)}
                className="px-2 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CASE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={caseCtx.priority} onChange={(e) => setCtx("priority", e.target.value)}
                className="px-2 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <select value={caseCtx.status} onChange={(e) => setCtx("status", e.target.value)}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <textarea rows={5} placeholder={`Log data (JSON or one per line):\n[{"user":"admin","status":"failed","ip":"192.168.1.1"}]`}
              value={caseCtx.logs} onChange={(e) => setCtx("logs", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        {/* Evidence upload */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🗂️</span> Evidence Upload
          </h2>
          <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition ${uploading ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}>
            <span className="text-2xl mb-1">{uploading ? "⏳" : "📎"}</span>
            <span className="text-xs text-gray-500">{uploading ? "Uploading..." : "Click or drag files here"}</span>
            <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          {uploadedFiles.length > 0 && (
            <ul className="mt-3 space-y-1">
              {uploadedFiles.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Evidence count:</span>
            <input type="number" min="0" value={caseCtx.evidence_count}
              onChange={(e) => setCtx("evidence_count", e.target.value)}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        {/* Suggested questions */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>💡</span> Suggested Questions
          </h2>
          <div className="space-y-1.5">
            {SUGGESTED.map((q) => (
              <button key={q} onClick={() => sendMessage(q)}
                className="w-full text-left text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Chat panel */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">🤖</div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">TraceMind AI Assistant</p>
            <p className="text-xs text-green-500">● Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${m.role === "user" ? "order-2" : "order-1"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mb-1">🤖</div>
                )}
                <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}>
                  {m.content}
                </div>
                {m.credibility && (
                  <div className={`mt-2 px-3 py-2 rounded-xl text-xs ${verdictBadge[m.credibility.verdict] ?? "bg-gray-100 text-gray-700"}`}>
                    {verdictIcon[m.credibility.verdict]} Credibility: <strong>{m.credibility.verdict}</strong> — {m.credibility.credibility_score}/100
                    {m.credibility.flags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {m.credibility.flags.map((f) => (
                          <span key={f} className="bg-white/60 px-1.5 py-0.5 rounded font-mono">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-100">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the case, credibility, suspects, evidence..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 text-sm">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
