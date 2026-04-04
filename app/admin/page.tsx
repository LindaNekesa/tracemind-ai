import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import Link from "next/link";

interface AdminStats {
  totalUsers: number; adminUsers: number; totalCases: number;
  openCases: number; closedCases: number; totalEvidence: number;
  totalAnalyses: number;
  recentUsers: { id: string; name: string; email: string; role: string; createdAt: string }[];
  caseChart: { name: string; value: number }[];
  priorityChart: { name: string; value: number }[];
}

const DEFAULT_STATS: AdminStats = {
  totalUsers: 0, adminUsers: 0, totalCases: 0, openCases: 0,
  closedCases: 0, totalEvidence: 0, totalAnalyses: 0,
  recentUsers: [], caseChart: [], priorityChart: [],
};

async function getAdminStats(): Promise<AdminStats> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/stats`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || data.error) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...data };
  } catch { return DEFAULT_STATS; }
}

const roleColor: Record<string, string> = {
  admin: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  default: "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
};

export default async function AdminPage() {
  const s = await getAdminStats();
  const inProgress = Math.max(0, s.totalCases - s.openCases - s.closedCases);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">System Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time platform statistics and management tools</p>
        </div>
        <Link href="/admin/users"
          className="flex items-center gap-2 bg-gray-900 dark:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-700 dark:hover:bg-white/15 transition">
          <span>👥</span> Manage Users
        </Link>
      </div>

      {/* AI Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/admin/verify",      icon: "⚖️", title: "Case Verifier",       desc: "Paste case details and get an AI verdict for court proceedings.", label: "Open Verifier", from: "from-blue-600", to: "to-indigo-700", glow: "shadow-blue-500/25" },
          { href: "/admin/credibility", icon: "🔍", title: "Credibility Scanner",  desc: "Score all cases for trustworthiness and flag suspicious entries.", label: "Scan Cases",    from: "from-violet-600", to: "to-purple-700", glow: "shadow-violet-500/25" },
          { href: "/admin/assistant",   icon: "🤖", title: "AI Assistant",         desc: "Chat with AI, upload evidence, get instant court-readiness verdicts.", label: "Open Chat",  from: "from-slate-700", to: "to-slate-900", glow: "shadow-slate-500/25" },
        ].map((t) => (
          <Link key={t.href} href={t.href}
            className={`group relative bg-linear-to-br ${t.from} ${t.to} text-white rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-xl ${t.glow} overflow-hidden`}>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300" />
            <div className="text-3xl mb-3">{t.icon}</div>
            <h3 className="font-bold text-lg leading-tight">{t.title}</h3>
            <p className="text-white/70 text-sm mt-2 leading-relaxed">{t.desc}</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-white/80 group-hover:text-white transition">
              {t.label}
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Users"    value={s.totalUsers}    icon="👥" color="blue"   sub={`${s.adminUsers} admin(s)`} />
        <StatsCard title="Total Cases"    value={s.totalCases}    icon="📁" color="purple" sub={`${s.openCases} open`} />
        <StatsCard title="Evidence Files" value={s.totalEvidence} icon="🗂️" color="green"  sub="Uploaded" />
        <StatsCard title="AI Analyses"    value={s.totalAnalyses} icon="🤖" color="red"    sub="Completed" />
      </div>

      {/* Training quick stat */}
      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Training Program</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Monitor student enrollment and learning progress</p>
          </div>
        </div>
        <Link href="/admin/training" className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-700 transition shrink-0">
          View Training →
        </Link>
      </div>

      {/* Case status */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open Cases",    value: s.openCases,   bg: "bg-amber-50 dark:bg-amber-500/10",   border: "border-amber-200 dark:border-amber-500/20",   text: "text-amber-600 dark:text-amber-400",   sub: "text-amber-700 dark:text-amber-500" },
          { label: "Closed Cases",  value: s.closedCases, bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", sub: "text-emerald-700 dark:text-emerald-500" },
          { label: "In Progress",   value: inProgress,    bg: "bg-blue-50 dark:bg-blue-500/10",     border: "border-blue-200 dark:border-blue-500/20",     text: "text-blue-600 dark:text-blue-400",     sub: "text-blue-700 dark:text-blue-500" },
        ].map((c) => (
          <div key={c.label} className={`${c.bg} border ${c.border} rounded-2xl p-5 text-center`}>
            <p className={`text-4xl font-black ${c.text}`}>{c.value}</p>
            <p className={`text-sm font-medium mt-1.5 ${c.sub}`}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartComponent data={s.caseChart.length ? s.caseChart : undefined} type="bar" title="Cases by Month" />
        <ChartComponent data={s.priorityChart.length ? s.priorityChart : undefined} type="bar" title="Cases by Priority" />
      </div>

      {/* Recent users */}
      <div className="bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold text-gray-800 dark:text-white">Recently Registered Users</h2>
          <Link href="/admin/users" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">View all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/3">
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold">Role</th>
              <th className="px-6 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/5">
            {s.recentUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/3 transition">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-gray-500 dark:text-gray-400">{u.email}</td>
                <td className="px-6 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === "admin" ? roleColor.admin : roleColor.default}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-gray-400 dark:text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!s.recentUsers.length && (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No users registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
