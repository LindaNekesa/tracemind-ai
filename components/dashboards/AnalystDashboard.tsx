import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import RecentActivity from "@/components/RecentActivity";
import Link from "next/link";

interface Props {
  stats: {
    total: number; analysisCount: number; evidenceCount: number;
    riskBreakdown: { name: string; value: number }[];
    chartData: { name: string; value: number }[];
    name: string;
  };
}

export default function AnalystDashboard({ stats }: Props) {
  const high   = stats.riskBreakdown.find((r) => r.name === "HIGH")?.value   ?? 0;
  const medium = stats.riskBreakdown.find((r) => r.name === "MEDIUM")?.value ?? 0;
  const low    = stats.riskBreakdown.find((r) => r.name === "LOW")?.value    ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {stats.name} 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your AI analysis overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Cases Analysed"  value={stats.total}         icon="📁" color="blue"   sub="Assigned to you" />
        <StatsCard title="AI Analyses Run" value={stats.analysisCount} icon="🤖" color="purple" sub="Completed" />
        <StatsCard title="Evidence Files"  value={stats.evidenceCount} icon="🗂️" color="green"  sub="Available" />
      </div>

      {/* Risk breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{high}</p>
          <p className="text-sm text-red-700 mt-1 font-medium">High Risk</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{medium}</p>
          <p className="text-sm text-yellow-700 mt-1 font-medium">Medium Risk</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{low}</p>
          <p className="text-sm text-green-700 mt-1 font-medium">Low Risk</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/cases"           className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">🔍 View Cases</Link>
          <Link href="/evidence/upload" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">🗂️ Upload Evidence</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent data={stats.riskBreakdown.length ? stats.riskBreakdown : undefined} type="bar" title="Risk Level Distribution" />
        <RecentActivity />
      </div>
    </div>
  );
}
