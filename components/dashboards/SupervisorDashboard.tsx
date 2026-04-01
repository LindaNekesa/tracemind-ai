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

const statusColor: Record<string, string> = {
  OPEN:        "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  CLOSED:      "bg-gray-100 text-gray-600",
};

export default function SupervisorDashboard({ stats }: Props) {
  const inProgress = stats.total - stats.open - stats.closed;
  const high = stats.riskBreakdown.find((r) => r.name === "HIGH")?.value ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Supervisor Overview — {stats.name}</h1>
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

      {/* Pending approvals banner */}
      {stats.open > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <div className="flex-1">
            <p className="font-semibold text-yellow-800">{stats.open} case{stats.open > 1 ? "s" : ""} pending review</p>
            <p className="text-sm text-yellow-600">Review open cases and approve or escalate as needed.</p>
          </div>
          <Link href="/cases" className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition shrink-0">
            Review Now
          </Link>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Supervisor Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/cases"           className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">📁 All Cases</Link>
          <Link href="/cases/new"       className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">➕ New Case</Link>
          <Link href="/evidence/upload" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">🗂️ Evidence</Link>
          <Link href="/reports"         className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">📄 Reports</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent data={stats.chartData.length ? stats.chartData : undefined} type="bar" title="Team Cases by Month" />
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Cases Needing Attention</h2>
            <Link href="/cases" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {stats.recentCases.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">All clear — no pending cases.</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentCases.map((c) => (
                <li key={c.id}>
                  <Link href={`/cases/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                    <span className="text-sm font-medium text-gray-800 truncate">{c.title}</span>
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
