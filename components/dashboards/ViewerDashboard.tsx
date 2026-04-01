import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import Link from "next/link";

interface Props {
  stats: {
    total: number; open: number; closed: number;
    analysisCount: number;
    chartData: { name: string; value: number }[];
    name: string;
    department: string;
  };
}

const deptLabel: Record<string, string> = {
  general: "General", cybercrime: "Cybercrime Unit",
  digital_forensics: "Digital Forensics", incident_response: "Incident Response",
  threat_intelligence: "Threat Intelligence", compliance: "Compliance & Legal",
  it_security: "IT Security",
};

export default function ViewerDashboard({ stats }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold shrink-0">
          {stats.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{stats.name}</h1>
          <p className="text-sm text-gray-500">{deptLabel[stats.department] ?? stats.department} · Read-only access</p>
        </div>
        <span className="ml-auto px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">Viewer</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Cases"   value={stats.total}         icon="📁" color="blue"   sub="Platform-wide" />
        <StatsCard title="Open Cases"    value={stats.open}          icon="🔓" color="yellow" sub="Active" />
        <StatsCard title="Closed Cases"  value={stats.closed}        icon="✅" color="green"  sub="Resolved" />
        <StatsCard title="AI Analyses"   value={stats.analysisCount} icon="🤖" color="purple" sub="Completed" />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h2 className="font-semibold text-blue-800 mb-1">Read-only access</h2>
        <p className="text-sm text-blue-600">You can view cases and reports. Contact your administrator to request elevated access.</p>
        <div className="flex gap-3 mt-4">
          <Link href="/cases"   className="flex items-center gap-2 bg-white text-blue-700 border border-blue-300 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition">🔍 Browse Cases</Link>
          <Link href="/reports" className="flex items-center gap-2 bg-white text-blue-700 border border-blue-300 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition">📄 View Reports</Link>
        </div>
      </div>

      <ChartComponent data={stats.chartData.length ? stats.chartData : undefined} type="bar" title="Cases by Month" />
    </div>
  );
}
