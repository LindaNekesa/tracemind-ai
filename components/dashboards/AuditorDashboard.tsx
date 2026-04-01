import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import Link from "next/link";

interface Props {
  stats: {
    total: number; open: number; closed: number;
    analysisCount: number; evidenceCount: number;
    chartData: { name: string; value: number }[];
    name: string;
  };
}

export default function AuditorDashboard({ stats }: Props) {
  const complianceRate = stats.total > 0
    ? Math.round((stats.closed / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Audit Dashboard — {stats.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Compliance review and case audit trail</p>
        </div>
        <Link href="/reports" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          📋 Audit Reports
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Cases"     value={stats.total}         icon="📋" color="blue"   sub="Under audit" />
        <StatsCard title="Resolved"        value={stats.closed}        icon="✅" color="green"  sub="Closed cases" />
        <StatsCard title="Pending Review"  value={stats.open}          icon="⏳" color="yellow" sub="Open cases" />
        <StatsCard title="AI Analyses"     value={stats.analysisCount} icon="🤖" color="purple" sub="Reviewed" />
      </div>

      {/* Compliance rate */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4">Case Resolution Rate</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3"
                strokeDasharray={`${complianceRate} ${100 - complianceRate}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-black text-indigo-600">{complianceRate}%</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ <span className="font-semibold">{stats.closed}</span> cases resolved</p>
            <p>⏳ <span className="font-semibold">{stats.open}</span> cases pending</p>
            <p>📊 <span className="font-semibold">{stats.evidenceCount}</span> evidence items logged</p>
            <p>🤖 <span className="font-semibold">{stats.analysisCount}</span> AI analyses on record</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap mt-5">
          <Link href="/cases"   className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition">📋 Review Cases</Link>
          <Link href="/reports" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">📄 View Reports</Link>
        </div>
      </div>

      <ChartComponent data={stats.chartData.length ? stats.chartData : undefined} type="bar" title="Case Activity by Month" />
    </div>
  );
}
