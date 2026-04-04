"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";

interface Trainee {
  id: string; name: string; email: string;
  department: string; avatar: string | null;
  joinedAt: string; casesCreated: number; activityScore: number;
}

const deptLabel: Record<string, string> = {
  general: "General", cybercrime: "Cybercrime", digital_forensics: "Digital Forensics",
  incident_response: "Incident Response", threat_intelligence: "Threat Intelligence",
  compliance: "Compliance & Legal", it_security: "IT Security", education: "Education / Training",
};

const MODULES = [
  "Introduction to Digital Forensics",
  "Log Analysis & Threat Detection",
  "Evidence Collection & Handling",
  "AI in Digital Forensics",
];

function ProgressBar({ value, color = "bg-blue-500" }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{value}%</span>
    </div>
  );
}

export default function TrainingOverviewPage() {
  const [data, setData]       = useState<{ total: number; trainees: Trainee[] }>({ total: 0, trainees: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    fetch("/api/admin/training").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  const filtered = data.trainees.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const avgActivity = data.trainees.length
    ? Math.round(data.trainees.reduce((s, t) => s + t.activityScore, 0) / data.trainees.length)
    : 0;

  const active = data.trainees.filter((t) => t.casesCreated > 0).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">🎓 Training Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monitor student enrollment and learning progress</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-5">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Enrolled Students</p>
          <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{data.total}</p>
          <p className="text-xs text-blue-400 mt-1">Total trainees registered</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-5">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-1">Active Learners</p>
          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{active}</p>
          <p className="text-xs text-emerald-400 mt-1">Have created at least one case</p>
        </div>
        <div className="bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-2xl p-5">
          <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-1">Avg. Activity Score</p>
          <p className="text-4xl font-black text-violet-600 dark:text-violet-400">{avgActivity}%</p>
          <ProgressBar value={avgActivity} color="bg-violet-500" />
        </div>
      </div>

      {/* Module enrollment */}
      <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-5">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">📚 Learning Modules</h2>
        <div className="space-y-3">
          {MODULES.map((m, i) => {
            // Simulate progress — in production this would come from a DB table
            const enrolled = Math.max(0, data.total - i);
            const pct = data.total > 0 ? Math.round((enrolled / data.total) * 100) : 0;
            const colors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500"];
            return (
              <div key={m}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{m}</span>
                  <span className="text-gray-400 text-xs">{enrolled} students</span>
                </div>
                <ProgressBar value={pct} color={colors[i]} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Student table */}
      <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300">Enrolled Students</h2>
          <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400 w-48" />
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-3">🎓</p>
            <p className="text-gray-500 dark:text-gray-400">
              {search ? "No students match your search." : "No trainees enrolled yet."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/5">
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Cases Created</th>
                <th className="px-5 py-3 font-semibold">Activity</th>
                <th className="px-5 py-3 font-semibold">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar src={t.avatar} name={t.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg">
                      {deptLabel[t.department] ?? t.department}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{t.casesCreated}</td>
                  <td className="px-5 py-3.5 w-40">
                    <ProgressBar
                      value={t.activityScore}
                      color={t.activityScore >= 75 ? "bg-emerald-500" : t.activityScore >= 40 ? "bg-amber-500" : "bg-red-400"}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {new Date(t.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
