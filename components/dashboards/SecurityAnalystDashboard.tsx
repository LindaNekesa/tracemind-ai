import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import RecentActivity from "@/components/RecentActivity";
import Link from "next/link";

interface Props {
  stats: {
    total: number; open: number; analysisCount: number; evidenceCount: number;
    riskBreakdown: { name: string; value: number }[];
    chartData: { name: string; value: number }[];
    name: string;
  };
}

export default function SecurityAnalystDashboard({ stats }: Props) {
  const high   = stats.riskBreakdown.find((r) => r.name === "HIGH")?.value   ?? 0;
  const medium = stats.riskBreakdown.find((r) => r.name === "MEDIUM")?.value ?? 0;
  const low    = stats.riskBreakdown.find((r) => r.name === "LOW")?.value    ?? 0;
  const total  = high + medium + low || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Security Operations — {stats.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Threat monitoring and security event analysis</p>
        </div>
        <Link href="/cases" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
          🚨 Active Threats
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Monitored Cases"  value={stats.total}         icon="🛡️" color="blue"   sub="Under review" />
        <StatsCard title="Open Threats"     value={stats.open}          icon="🚨" color="red"    sub="Needs attention" />
        <StatsCard title="Analyses Run"     value={stats.analysisCount} icon="🤖" color="purple" sub="AI scans" />
        <StatsCard title="Evidence Items"   value={stats.evidenceCount} icon="🗂️" color="green"  sub="Collected" />
      </div>

      {/* Threat level gauge */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4">Threat Level Distribution</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-4xl font-black text-red-600">{high}</p>
            <p className="text-sm font-semibold text-red-700 mt-1">CRITICAL / HIGH</p>
            <div className="mt-2 h-2 bg-red-200 rounded-full">
              <div className="h-2 bg-red-500 rounded-full" style={{ width: `${(high / total) * 100}%` }} />
            </div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-4xl font-black text-yellow-600">{medium}</p>
            <p className="text-sm font-semibold text-yellow-700 mt-1">MEDIUM</p>
            <div className="mt-2 h-2 bg-yellow-200 rounded-full">
              <div className="h-2 bg-yellow-500 rounded-full" style={{ width: `${(medium / total) * 100}%` }} />
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-4xl font-black text-green-600">{low}</p>
            <p className="text-sm font-semibold text-green-700 mt-1">LOW</p>
            <div className="mt-2 h-2 bg-green-200 rounded-full">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(low / total) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/cases" className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition">🚨 View High-Risk Cases</Link>
          <Link href="/evidence/upload" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">🗂️ Upload Evidence</Link>
          <Link href="/reports" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">📄 Security Reports</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent data={stats.riskBreakdown.length ? stats.riskBreakdown : undefined} type="bar" title="Risk Distribution" />
        <RecentActivity />
      </div>
    </div>
  );
}
