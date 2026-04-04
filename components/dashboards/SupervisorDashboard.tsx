"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import RecentActivity from "@/components/RecentActivity";
import Link from "next/link";

interface Props {
  stats: {
    total: number; open: number; closed: number;
    evidenceCount: number; analysisCount: number;
    chartData: { name: string; value: number }[];
    riskBreakdown: { name: string; value: number }[];
    recentCases: { id: string; title: string; status: string; priority: string; createdAt: string }[];
    name: string;
  };
}

interface WorkloadUser {
  id: string; name: string; role: string; open: number; inProgress: number; closed: number; total: number;
}

const statusColor: Record<string, string> = {
  OPEN:        "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  CLOSED:      "bg-gray-100 text-gray-600",
};

function workloadColor(open: number, inProgress: number) {
  const active = open + inProgress;
  if (active >= 5) return "text-red-500";
  if (active >= 3) return "text-amber-500";
  return "text-emerald-500";
}

function workloadLabel(open: number, inProgress: number) {
  const active = open + inProgress;
  if (active >= 5) return { label: "High", cls: "bg-red-500/20 text-red-400" };
  if (active >= 3) return { label: "Medium", cls: "bg-amber-500/20 text-amber-400" };
  return { label: "Low", cls: "bg-emerald-500/20 text-emerald-400" };
}

export default function SupervisorDashboard({ stats }: Props) {
  const [workload, setWorkload] = useState<WorkloadUser[]>([]);

  useEffect(() => {
    fetch("/api/supervisor/workload")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setWorkload(d); })
      .catch(() => {});
  }, []);

  const inProgress = stats.total - stats.open - stats.closed;
  const high = stats.riskBreakdown.find((r) => r.name === "HIGH")?.value ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Supervisor Overview — {stats.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Team workload, case approvals and performance</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition">👥 Team</Link>
          <Link href="/cases/new"   className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ New Case</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatsCard title="Total Cases"    value={stats.total}         icon="📁" color="blue"   sub="All time" />
        <StatsCard title="Open"           value={stats.open}          icon="🔓" color="yellow" sub="Awaiting action" />
        <StatsCard title="In Progress"    value={inProgress}          icon="⚙️" color="purple" sub="Being worked" />
        <StatsCard title="Closed"         value={stats.closed}        icon="✅" color="green"  sub="Resolved" />
        <StatsCard title="High Risk"      value={high}                icon="🚨" color="red"    sub="Needs review" />
      </div>

      {stats.open > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-300 dark:border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <div className="flex-1">
            <p className="font-semibold text-yellow-800 dark:text-yellow-300">{stats.open} case{stats.open > 1 ? "s" : ""} pending review</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Review open cases and approve or escalate as needed.</p>
          </div>
          <Link href="/cases" className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition shrink-0">
            Review Now
          </Link>
        </div>
      )}

      {/* Team Workload Table */}
      <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">👥 Team Workload</h2>
        {workload.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No team members found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-white/5">
                  <th className="text-left pb-3 pr-4">Member</th>
                  <th className="text-center pb-3 px-3">Open</th>
                  <th className="text-center pb-3 px-3">In Progress</th>
                  <th className="text-center pb-3 px-3">Closed</th>
                  <th className="text-center pb-3 px-3">Workload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {workload.map((u) => {
                  const wl = workloadLabel(u.open, u.inProgress);
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-800 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{u.role.replace("_", " ")}</p>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className={`font-bold ${workloadColor(u.open, 0)}`}>{u.open}</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="font-bold text-amber-500">{u.inProgress}</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="font-bold text-gray-500">{u.closed}</span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${wl.cls}`}>{wl.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Supervisor Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/cases"           className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">📁 All Cases</Link>
          <Link href="/cases/new"       className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition">➕ New Case</Link>
          <Link href="/evidence/upload" className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition">🗂️ Evidence</Link>
          <Link href="/reports"         className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition">📄 Reports</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent data={stats.chartData.length ? stats.chartData : undefined} type="bar" title="Team Cases by Month" />
        <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300">Cases Needing Attention</h2>
            <Link href="/cases" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          {stats.recentCases.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">All clear — no pending cases.</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentCases.map((c) => (
                <li key={c.id}>
                  <Link href={`/cases/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition">
                    <span className="text-sm font-medium text-gray-800 dark:text-white truncate">{c.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${statusColor[c.status] ?? "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <RecentActivity />
    </div>
  );
}
