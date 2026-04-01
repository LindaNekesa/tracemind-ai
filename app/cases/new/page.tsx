"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const STATUS_OPTIONS   = ["OPEN", "IN_PROGRESS", "CLOSED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TYPE_OPTIONS     = ["Malware", "Phishing", "Unauthorized Access", "Data Breach", "Insider Threat", "Ransomware", "Fraud", "Other"];

const priorityColor: Record<string, string> = {
  LOW: "text-blue-600", MEDIUM: "text-amber-600", HIGH: "text-orange-600", CRITICAL: "text-red-600",
};

export default function NewCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "OPEN", priority: "MEDIUM", type: "Other", logs: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let logs: unknown[] = [];
    if (form.logs.trim()) {
      try { logs = JSON.parse(form.logs); }
      catch { logs = form.logs.split("\n").filter(Boolean).map((l) => ({ raw: l })); }
    }
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create case");
      toast.success("Case created successfully");
      router.push(`/cases/${data.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create case");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-white/10" />
        <h1 className="text-xl font-black text-gray-900 dark:text-white">New Case</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Case Details</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Case Title *</label>
            <input type="text" required placeholder="e.g. Phishing Attack on Finance Department"
              value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-white/8 text-gray-800 dark:text-white placeholder-gray-400 transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea rows={4} placeholder="Describe the incident in detail — what happened, when, who was involved..."
              value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-white/8 text-gray-800 dark:text-white placeholder-gray-400 transition resize-none" />
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Classification</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Status",   key: "status",   opts: STATUS_OPTIONS },
              { label: "Priority", key: "priority", opts: PRIORITY_OPTIONS },
              { label: "Type",     key: "type",     opts: TYPE_OPTIONS },
            ].map(({ label, key, opts }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">{label}</label>
                <select value={form[key as keyof typeof form]} onChange={(e) => set(key, e.target.value)}
                  className={`w-full px-3 py-2.5 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${key === "priority" ? priorityColor[form.priority] : "text-gray-800 dark:text-white"}`}>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Log data */}
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Log Data</h2>
            <span className="text-xs text-gray-400">JSON array or one entry per line</span>
          </div>
          <textarea rows={6}
            placeholder={`[{"user":"admin","status":"failed","ip":"192.168.1.1","timestamp":"2024-01-15T10:30:00"},\n {"user":"root","status":"failed","ip":"10.0.0.5","timestamp":"2024-01-15T10:31:00"}]`}
            value={form.logs} onChange={(e) => set("logs", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-white/8 text-gray-700 dark:text-gray-300 placeholder-gray-400 transition resize-none" />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-500 transition shadow-lg shadow-blue-600/25 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Create Case</>
            )}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-6 py-3 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
