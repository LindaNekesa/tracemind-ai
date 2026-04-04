"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AiAnalysis from "@/components/AiAnalysis";
import CaseComments from "@/components/CaseComments";
import toast from "react-hot-toast";

interface Evidence { id: string; filePath: string; fileType: string; createdAt: string; }
interface Case {
  id: string; title: string; status: string; priority: string; type: string;
  description: string; logs: Record<string, unknown>[]; aiResult?: Record<string, unknown>;
  createdAt: string; updatedAt: string;
  user?: { name: string; email: string };
  evidence: Evidence[];
}

const statusConfig: Record<string, string> = {
  OPEN:        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  CLOSED:      "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
};
const priorityConfig: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-600", MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700", CRITICAL: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS   = ["OPEN", "IN_PROGRESS", "CLOSED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function CaseDetail() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [editForm, setEditForm] = useState({ status: "", priority: "" });
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "analysis" | "comments">("overview");

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then((r) => r.json())
      .then((d) => { setCaseData(d); setEvidenceList(d.evidence ?? []); setEditForm({ status: d.status, priority: d.priority }); })
      .finally(() => setLoading(false));
  }, [id]);

  const deleteEvidence = async (evidenceId: string) => {
    if (!confirm("Delete this evidence file?")) return;
    await fetch(`/api/evidence/${evidenceId}`, { method: "DELETE" });
    setEvidenceList((p) => p.filter((e) => e.id !== evidenceId));
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      setCaseData((c) => c ? { ...c, ...editForm } : c);
      toast.success("Case updated");
      setEditing(false);
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="skeleton h-8 w-64 rounded-xl" />
      <div className="skeleton h-4 w-96 rounded-xl" />
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  );

  if (!caseData) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-3">🔍</p>
      <p className="text-gray-500">Case not found.</p>
      <Link href="/cases" className="text-blue-600 hover:underline text-sm mt-2 block">← Back to Cases</Link>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white truncate">{caseData.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {caseData.type} · Created {new Date(caseData.createdAt).toLocaleDateString()}
              {caseData.user && ` · by ${caseData.user.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {editing ? (
            <>
              <button onClick={saveEdit} disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition disabled:opacity-60">
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition">Edit</button>
              <Link href={`/cases/${id}/analysis`} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition">
                Full Analysis →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Status + Priority */}
      <div className="flex gap-3 flex-wrap">
        {editing ? (
          <>
            <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
              className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={editForm.priority} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}
              className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </>
        ) : (
          <>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[caseData.status] ?? "bg-gray-100 text-gray-600"}`}>{caseData.status}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityConfig[caseData.priority] ?? "bg-gray-100 text-gray-600"}`}>{caseData.priority}</span>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit">
        {(["overview", "evidence", "analysis", "comments"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${activeTab === tab ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{caseData.description || "No description provided."}</p>
          </div>
          {caseData.logs?.length > 0 && (
            <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Log Data ({caseData.logs.length} entries)</h2>
              <pre className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto max-h-48">
                {JSON.stringify(caseData.logs.slice(0, 5), null, 2)}
                {caseData.logs.length > 5 && `\n... and ${caseData.logs.length - 5} more entries`}
              </pre>
            </div>
          )}
        </div>
      )}

      {activeTab === "evidence" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{caseData.evidence?.length ?? 0} file(s) attached</p>
            <Link href={`/evidence/upload?caseId=${id}`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition">
              + Upload Evidence
            </Link>
          </div>
          {!evidenceList?.length ? (
            <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-12 text-center">
              <p className="text-3xl mb-3">🗂️</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No evidence uploaded yet.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {evidenceList.map((e) => (
                <div key={e.id} className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-lg shrink-0">
                    {e.fileType.startsWith("image") ? "🖼️" : e.fileType.includes("pdf") ? "📄" : "📎"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{e.filePath.split("/").pop()}</p>
                    <p className="text-xs text-gray-400">{e.fileType} · {new Date(e.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteEvidence(e.id)}
                    className="text-xs text-red-500 hover:text-red-700 transition font-medium shrink-0">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "analysis" && (
        <AiAnalysis caseId={caseData.id} logs={caseData.logs ?? []} />
      )}

      {activeTab === "comments" && (
        <CaseComments caseId={caseData.id} />
      )}
    </div>
  );
}
