import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import Link from "next/link";

interface Props {
  stats: {
    total: number; open: number; closed: number;
    evidenceCount: number;
    chartData: { name: string; value: number }[];
    recentCases: { id: string; title: string; status: string; priority: string; createdAt: string }[];
    name: string;
  };
}

const priorityColor: Record<string, string> = {
  HIGH:   "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW:    "bg-green-100 text-green-700",
};
const statusColor: Record<string, string> = {
  OPEN:        "bg-blue-100 text-blue-700",
  CLOSED:      "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
};

export default function InvestigatorDashboard({ stats }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {stats.name} 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your investigation overview</p>
        </div>
        <Link href="/cases/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + New Case
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="My Cases"       value={stats.total}         icon="📁" color="blue"   sub="All time" />
        <StatsCard title="Open"           value={stats.open}          icon="🔓" color="yellow" sub="Active" />
        <StatsCard title="Closed"         value={stats.closed}        icon="✅" color="green"  sub="Resolved" />
        <StatsCard title="Evidence Files" value={stats.evidenceCount} icon="🗂️" color="purple" sub="Uploaded" />
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/cases/new"       className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">📁 New Case</Link>
          <Link href="/cases"           className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">🔍 My Cases</Link>
          <Link href="/evidence/upload" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">🗂️ Upload Evidence</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent data={stats.chartData.length ? stats.chartData : undefined} type="bar" title="My Cases by Month" />

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Recent Cases</h2>
            <Link href="/cases" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {stats.recentCases.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-gray-400">No cases yet.</p>
              <Link href="/cases/new" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Create your first case →</Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {stats.recentCases.map((c) => (
                <li key={c.id}>
                  <Link href={`/cases/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                    <span className="font-medium text-gray-800 text-sm truncate">{c.title}</span>
                    <div className="flex gap-2 shrink-0 ml-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status] ?? "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[c.priority] ?? "bg-gray-100 text-gray-600"}`}>{c.priority}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
