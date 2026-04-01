"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Case { id: string; title: string; status: string; priority: string; type: string; createdAt: string; }

const statusConfig: Record<string, { label: string; cls: string }> = {
  OPEN:        { label: "Open",        cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
  CLOSED:      { label: "Closed",      cls: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400" },
};
const priorityConfig: Record<string, { cls: string; dot: string }> = {
  LOW:      { cls: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",     dot: "bg-blue-500" },
  MEDIUM:   { cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", dot: "bg-amber-500" },
  HIGH:     { cls: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400", dot: "bg-orange-500" },
  CRITICAL: { cls: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",         dot: "bg-red-500" },
};

export default function CasesPage() {
  const [cases, setCases]   = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/cases")
      .then((r) => { if (!r.ok) throw new Error("Failed to load"); return r.json(); })
      .then((d) => { if (Array.isArray(d)) setCases(d); else throw new Error(d.error); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cases.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Cases</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cases.length} total case{cases.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/cases/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500 transition shadow-lg shadow-blue-600/25 hover:-translate-y-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Case
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search cases..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400" />
        </div>
        <div className="flex gap-2">
          {["ALL", "OPEN", "IN_PROGRESS", "CLOSED"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${statusFilter === s ? "bg-blue-600 text-white shadow-md shadow-blue-600/25" : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10"}`}>
              {s === "ALL" ? "All" : s === "IN_PROGRESS" ? "In Progress" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-8 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
          <button onClick={() => window.location.reload()}
            className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">📁</div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {search || statusFilter !== "ALL" ? "No matching cases" : "No cases yet"}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {search || statusFilter !== "ALL" ? "Try adjusting your search or filters." : "Create your first forensic case to get started."}
          </p>
          {!search && statusFilter === "ALL" && (
            <Link href="/cases/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-500 transition">
              + Create First Case
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/5">
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3.5 font-semibold">Case</th>
                <th className="px-5 py-3.5 font-semibold">Type</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Priority</th>
                <th className="px-5 py-3.5 font-semibold">Created</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map((c) => {
                const sc = statusConfig[c.status];
                const pc = priorityConfig[c.priority];
                return (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition group">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{c.title}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{c.type}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc?.cls ?? "bg-gray-100 text-gray-600"}`}>
                        {sc?.label ?? c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${pc?.cls ?? "bg-gray-100 text-gray-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pc?.dot ?? "bg-gray-400"}`} />
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 dark:text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <Link href={`/cases/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition opacity-0 group-hover:opacity-100">
                        View
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-50 dark:border-white/5 text-xs text-gray-400">
            Showing {filtered.length} of {cases.length} cases
          </div>
        </div>
      )}
    </div>
  );
}
