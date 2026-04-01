import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import Link from "next/link";

interface Props {
  stats: {
    total: number; open: number; closed: number;
    analysisCount: number;
    riskBreakdown: { name: string; value: number }[];
    recentCases: { id: string; title: string; status: string; priority: string; createdAt: string }[];
    name: string;
  };
}

const priorityColor: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH:     "bg-orange-100 text-orange-700",
  MEDIUM:   "bg-yellow-100 text-yellow-700",
  LOW:      "bg-green-100 text-green-700",
};

export default function IncidentResponderDashboard({ stats }: Props) {
  const critical = stats.recentCases.filter((c) => c.priority === "CRITICAL" || c.priority === "HIGH");
  const high = stats.riskBreakdown.find((r) => r.name === "HIGH")?.value ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incident Response — {stats.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Active incident triage and containment</p>
        </div>
        <Link href="/cases/new" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
          🚨 New Incident
        </Link>
      </div>

      {critical.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="font-bold text-red-800">{critical.length} critical/high-priority incident{critical.length > 1 ? "s" : ""} require immediate response</p>
            <div className="mt-2 space-y-1">
              {critical.slice(0, 3).map((c) => (
                <Link key={c.id} href={`/cases/${c.id}`} className="block text-sm text-red-700 hover:underline">
                  → {c.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Active Incidents" value={stats.open}          icon="🔥" color="red"    sub="Needs response" />
        <StatsCard title="Total Incidents"  value={stats.total}         icon="📋" color="blue"   sub="All time" />
        <StatsCard title="Resolved"         value={stats.closed}        icon="✅" color="green"  sub="Contained" />
        <StatsCard title="High Risk"        value={high}                icon="⚠️" color="yellow" sub="AI flagged" />
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Response Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/cases/new"       className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition">🚨 Log Incident</Link>
          <Link href="/cases"           className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">📋 All Incidents</Link>
          <Link href="/evidence/upload" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">🗂️ Upload Evidence</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent data={stats.riskBreakdown.length ? stats.riskBreakdown : undefined} type="bar" title="Incident Severity Distribution" />
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Active Incident Queue</h2>
            <Link href="/cases" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {stats.recentCases.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No active incidents.</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentCases.map((c) => (
                <li key={c.id}>
                  <Link href={`/cases/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                    <span className="text-sm font-medium text-gray-800 truncate">{c.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${priorityColor[c.priority] ?? "bg-gray-100 text-gray-600"}`}>{c.priority}</span>
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
