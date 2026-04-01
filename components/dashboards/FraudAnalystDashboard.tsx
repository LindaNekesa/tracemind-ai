import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import RecentActivity from "@/components/RecentActivity";
import Link from "next/link";

interface Props {
  stats: {
    total: number; open: number; closed: number;
    analysisCount: number; evidenceCount: number;
    riskBreakdown: { name: string; value: number }[];
    chartData: { name: string; value: number }[];
    name: string;
  };
}

export default function FraudAnalystDashboard({ stats }: Props) {
  const high = stats.riskBreakdown.find((r) => r.name === "HIGH")?.value ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fraud Investigation — {stats.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fraud pattern detection and case analysis</p>
        </div>
        <Link href="/cases/new" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition">
          + Flag Fraud Case
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Fraud Cases"      value={stats.total}         icon="🔎" color="red"    sub="Under investigation" />
        <StatsCard title="Active"           value={stats.open}          icon="⚠️" color="yellow" sub="Open cases" />
        <StatsCard title="Resolved"         value={stats.closed}        icon="✅" color="green"  sub="Closed" />
        <StatsCard title="High-Risk Flags"  value={high}                icon="🚩" color="red"    sub="Needs immediate review" />
      </div>

      {/* Fraud alert banner */}
      {high > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-semibold text-red-800">
              {high} high-risk case{high > 1 ? "s" : ""} flagged for immediate review
            </p>
            <p className="text-sm text-red-600 mt-0.5">
              AI analysis has detected suspicious patterns. Review and escalate if necessary.
            </p>
            <Link href="/cases" className="mt-2 inline-block text-sm text-red-700 font-medium hover:underline">
              View flagged cases →
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Investigation Tools</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/cases/new"       className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition">🔎 New Fraud Case</Link>
          <Link href="/cases"           className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">📁 All Cases</Link>
          <Link href="/evidence/upload" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">🗂️ Upload Evidence</Link>
          <Link href="/reports"         className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">📄 Fraud Reports</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent data={stats.riskBreakdown.length ? stats.riskBreakdown : undefined} type="bar" title="Risk Level Breakdown" />
        <RecentActivity />
      </div>
    </div>
  );
}
