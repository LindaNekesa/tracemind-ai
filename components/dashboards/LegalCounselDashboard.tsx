import StatsCard from "@/components/StatsCard";
import Link from "next/link";

interface Props {
  stats: {
    total: number; open: number; closed: number;
    analysisCount: number;
    name: string; department: string;
  };
}

const deptLabel: Record<string, string> = {
  general: "General", cybercrime: "Cybercrime Unit",
  digital_forensics: "Digital Forensics", incident_response: "Incident Response",
  threat_intelligence: "Threat Intelligence", compliance: "Compliance & Legal",
  it_security: "IT Security",
};

export default function LegalCounselDashboard({ stats }: Props) {
  const closureRate = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-2xl font-bold shrink-0">
          ⚖️
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{stats.name}</h1>
          <p className="text-sm text-gray-500">{deptLabel[stats.department] ?? stats.department} · Legal Counsel</p>
        </div>
        <span className="ml-auto px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">Read-only</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Cases"    value={stats.total}         icon="📋" color="blue"   sub="On record" />
        <StatsCard title="Open Cases"     value={stats.open}          icon="⏳" color="yellow" sub="Pending" />
        <StatsCard title="Closed Cases"   value={stats.closed}        icon="✅" color="green"  sub="Resolved" />
        <StatsCard title="AI Analyses"    value={stats.analysisCount} icon="🤖" color="purple" sub="Available" />
      </div>

      {/* Case closure rate */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-4">Case Resolution Overview</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0f172a" strokeWidth="3"
                strokeDasharray={`${closureRate} ${100 - closureRate}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-gray-800">{closureRate}%</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📋 <span className="font-semibold">{stats.total}</span> total cases on record</p>
            <p>✅ <span className="font-semibold">{stats.closed}</span> cases resolved</p>
            <p>⏳ <span className="font-semibold">{stats.open}</span> cases pending closure</p>
            <p>🤖 <span className="font-semibold">{stats.analysisCount}</span> AI analyses available for review</p>
          </div>
        </div>
      </div>

      {/* Legal notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h2 className="font-semibold text-amber-800 mb-2">⚖️ Legal Access Notice</h2>
        <p className="text-sm text-amber-700">You have read-only access to case summaries and reports for legal proceedings. Raw evidence and AI analysis data are available for review. Contact the system administrator to request specific case exports.</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <Link href="/cases"   className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 transition">📋 Browse Cases</Link>
          <Link href="/reports" className="flex items-center gap-2 bg-white text-amber-700 border border-amber-300 px-4 py-2 rounded-lg text-sm hover:bg-amber-50 transition">📄 Legal Reports</Link>
        </div>
      </div>
    </div>
  );
}
