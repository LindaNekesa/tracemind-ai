import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import Link from "next/link";

interface Props {
  stats: {
    total: number; evidenceCount: number; analysisCount: number;
    chartData: { name: string; value: number }[];
    recentCases: { id: string; title: string; status: string; priority: string; createdAt: string }[];
    name: string;
  };
}

export default function ForensicExaminerDashboard({ stats }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Forensic Examination — {stats.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Evidence analysis and chain of custody</p>
        </div>
        <Link href="/evidence/upload" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          🔬 Submit Evidence
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Cases Examined"  value={stats.total}         icon="🔬" color="blue"   sub="Assigned" />
        <StatsCard title="Evidence Items"  value={stats.evidenceCount} icon="🗂️" color="purple" sub="In custody" />
        <StatsCard title="AI Analyses"     value={stats.analysisCount} icon="🤖" color="green"  sub="Completed" />
      </div>

      {/* Chain of custody notice */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
        <h2 className="font-semibold text-indigo-800 mb-2">🔗 Chain of Custody</h2>
        <p className="text-sm text-indigo-700 mb-3">All evidence submissions are timestamped and linked to your user ID. Maintain integrity by uploading original files only.</p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/evidence/upload" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">🗂️ Upload Evidence</Link>
          <Link href="/cases"           className="flex items-center gap-2 bg-white text-indigo-700 border border-indigo-300 px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 transition">📁 View Cases</Link>
          <Link href="/reports"         className="flex items-center gap-2 bg-white text-indigo-700 border border-indigo-300 px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 transition">📄 Examination Reports</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent data={stats.chartData.length ? stats.chartData : undefined} type="bar" title="Cases by Month" />
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Recent Examinations</h2>
            <Link href="/cases" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {stats.recentCases.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No cases assigned yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentCases.map((c) => (
                <li key={c.id}>
                  <Link href={`/cases/${c.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                    <span className="text-sm font-medium text-gray-800 truncate">{c.title}</span>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">{new Date(c.createdAt).toLocaleDateString()}</span>
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
