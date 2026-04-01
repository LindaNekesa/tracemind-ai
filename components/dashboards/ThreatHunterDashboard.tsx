import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import Link from "next/link";

interface Props {
  stats: {
    total: number; open: number; analysisCount: number; evidenceCount: number;
    riskBreakdown: { name: string; value: number }[];
    chartData: { name: string; value: number }[];
    name: string;
  };
}

const MITRE_TACTICS = [
  { id: "TA0001", name: "Initial Access",       icon: "🚪" },
  { id: "TA0002", name: "Execution",            icon: "⚙️" },
  { id: "TA0003", name: "Persistence",          icon: "🔒" },
  { id: "TA0004", name: "Privilege Escalation", icon: "⬆️" },
  { id: "TA0005", name: "Defense Evasion",      icon: "🛡️" },
  { id: "TA0006", name: "Credential Access",    icon: "🔑" },
  { id: "TA0007", name: "Discovery",            icon: "🔍" },
  { id: "TA0008", name: "Lateral Movement",     icon: "↔️" },
  { id: "TA0009", name: "Collection",           icon: "📦" },
  { id: "TA0010", name: "Exfiltration",         icon: "📤" },
];

export default function ThreatHunterDashboard({ stats }: Props) {
  const high = stats.riskBreakdown.find((r) => r.name === "HIGH")?.value ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Threat Hunting — {stats.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Proactive threat detection and IOC tracking</p>
        </div>
        <Link href="/cases/new" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
          🎯 New Hunt
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Hunt Campaigns"  value={stats.total}         icon="🎯" color="purple" sub="Active hunts" />
        <StatsCard title="Open Hunts"      value={stats.open}          icon="🔍" color="blue"   sub="In progress" />
        <StatsCard title="Threats Found"   value={high}                icon="🚨" color="red"    sub="High risk" />
        <StatsCard title="Analyses Run"    value={stats.analysisCount} icon="🤖" color="green"  sub="AI scans" />
      </div>

      {/* MITRE ATT&CK reference */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4">MITRE ATT&CK Tactic Coverage</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MITRE_TACTICS.map((t) => (
            <div key={t.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs">
              <span>{t.icon}</span>
              <div>
                <p className="font-mono text-gray-400">{t.id}</p>
                <p className="font-medium text-gray-700 leading-tight">{t.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3">Hunt Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/cases/new"       className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition">🎯 Start Hunt</Link>
          <Link href="/cases"           className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">📁 Hunt Log</Link>
          <Link href="/evidence/upload" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">🗂️ Submit IOC</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent data={stats.riskBreakdown.length ? stats.riskBreakdown : undefined} type="bar" title="Threat Severity Distribution" />
        <ChartComponent data={stats.chartData.length ? stats.chartData : undefined} type="line" title="Hunt Activity by Month" />
      </div>
    </div>
  );
}
