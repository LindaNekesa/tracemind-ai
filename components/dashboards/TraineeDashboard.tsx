import StatsCard from "@/components/StatsCard";
import Link from "next/link";

interface Props {
  stats: {
    total: number; analysisCount: number; evidenceCount: number;
    name: string; department: string;
  };
}

const deptLabel: Record<string, string> = {
  general: "General", cybercrime: "Cybercrime Unit",
  digital_forensics: "Digital Forensics", incident_response: "Incident Response",
  threat_intelligence: "Threat Intelligence", compliance: "Compliance & Legal",
  it_security: "IT Security",
};

const LEARNING_MODULES = [
  { icon: "📁", title: "Create Your First Case",    desc: "Learn how to open and document a forensic case.",   href: "/cases/new",       },
  { icon: "🗂️", title: "Upload Evidence",           desc: "Practice uploading and tagging digital evidence.",   href: "/evidence/upload", },
  { icon: "🤖", title: "Run AI Analysis",           desc: "Use the AI engine to analyse log data.",             href: "/cases",           },
  { icon: "🎓", title: "Learning Center",           desc: "Study digital forensics with guided lessons & quizzes.", href: "/learn",       },
];

export default function TraineeDashboard({ stats }: Props) {
  const progress = Math.min(
    Math.round(((stats.total > 0 ? 1 : 0) + (stats.evidenceCount > 0 ? 1 : 0) + (stats.analysisCount > 0 ? 1 : 0)) / 3 * 100),
    100
  );

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
            {stats.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome, {stats.name}! 🎓</h1>
            <p className="text-blue-100 text-sm mt-0.5">
              {deptLabel[stats.department] ?? stats.department} · Trainee
            </p>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-blue-100">Training Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-2.5 bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Cases Created"   value={stats.total}         icon="📁" color="blue"   sub="Practice cases" />
        <StatsCard title="Evidence Items"  value={stats.evidenceCount} icon="🗂️" color="green"  sub="Uploaded" />
        <StatsCard title="AI Analyses"     value={stats.analysisCount} icon="🤖" color="purple" sub="Completed" />
      </div>

      {/* Learning modules */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Learning Modules</h2>
          <a href="/learn" className="text-xs text-blue-600 font-semibold hover:underline">Open Learning Center →</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {LEARNING_MODULES.map((m) => (
            <Link key={m.title} href={m.href}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition group">
              <span className="text-2xl">{m.icon}</span>
              <div>
                <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-700">{m.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h2 className="font-semibold text-amber-800 mb-3">💡 Getting Started Tips</h2>
        <ul className="space-y-2 text-sm text-amber-700">
          <li>• Start by creating a practice case with sample log data.</li>
          <li>• Upload a text file as evidence to see how the system processes it.</li>
          <li>• Run an AI analysis on a case to see risk scoring in action.</li>
          <li>• Check the Reports section to understand investigation documentation.</li>
        </ul>
      </div>
    </div>
  );
}
