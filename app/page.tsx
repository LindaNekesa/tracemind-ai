import Link from "next/link";
import Footer from "@/components/Footer";

const features = [
  {
    icon: "🔍",
    title: "Evidence Management",
    desc: "Upload, tag and track digital evidence with full chain-of-custody logging.",
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  },
  {
    icon: "🤖",
    title: "AI Log Analysis",
    desc: "Detect brute-force attacks, suspicious IPs and insider threats automatically.",
    color: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
  },
  {
    icon: "⚖️",
    title: "Court Verification",
    desc: "AI credibility scoring tells you if a case is suitable for court proceedings.",
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  },
  {
    icon: "📊",
    title: "Risk Scoring",
    desc: "Precision, recall and F1 metrics with LOW / MEDIUM / HIGH risk classification.",
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  },
  {
    icon: "👥",
    title: "Role-Based Access",
    desc: "13 specialist roles — investigator, analyst, auditor, legal counsel and more.",
    color: "from-rose-500/20 to-rose-600/10 border-rose-500/30",
  },
  {
    icon: "🛡️",
    title: "Secure by Design",
    desc: "JWT auth, bcrypt passwords, httpOnly cookies and middleware protection.",
    color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
  },
];

const stats = [
  { value: "13",       label: "Specialist Roles" },
  { value: "5",        label: "AI Detection Rules" },
  { value: "100",      label: "Credibility Score" },
  { value: "Real-time",label: "Log Analysis" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#060b18] text-white overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060b18]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">🔍</div>
            <span className="text-lg font-bold tracking-tight">TraceMind AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#stats"    className="hover:text-white transition">Platform</a>
            <a href="#roles"    className="hover:text-white transition">Roles</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition">
              Sign In
            </Link>
            <Link href="/register"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-blue-600/25">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-violet-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse-slow" />
            AI-Powered Digital Forensics Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 animate-fade-in-up">
            Investigate Smarter<br />
            <span className="gradient-text">with AI Precision</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
            Manage evidence, detect threats, verify cases for court, and generate forensic insights — all in one secure, role-based platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-base transition shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5">
              Go to Dashboard
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="/register"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-base transition hover:-translate-y-0.5">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section id="stats" className="border-y border-white/5 bg-white/2 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label} className="animate-fade-in">
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Platform Capabilities</p>
            <h2 className="text-4xl font-black text-white mb-4">Everything You Need</h2>
            <p className="text-gray-400 max-w-xl mx-auto">A complete forensics toolkit built for investigators, analysts, auditors and legal teams.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={f.title}
                className={`animate-fade-in-up delay-${(i % 4) * 100} group relative bg-linear-to-br ${f.color} border rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 cursor-default`}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles section ── */}
      <section id="roles" className="py-24 px-6 bg-white/2 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">Access Control</p>
            <h2 className="text-4xl font-black text-white mb-4">Built for Every Role</h2>
            <p className="text-gray-400">Each role gets a tailored dashboard with the right tools and permissions.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {["Administrator","Investigator","Security Analyst","Forensic Examiner","Threat Hunter","Incident Responder","Fraud Analyst","Auditor","Legal Counsel","Supervisor","Analyst","Trainee","Viewer"].map((r) => (
              <span key={r} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 hover:text-white transition cursor-default">
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-linear-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-3xl p-12">
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/10 blur-2xl" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4 relative">Ready to Investigate?</h2>
            <p className="text-gray-400 mb-8 relative">Join TraceMind AI and start managing forensic cases with AI-powered precision.</p>
            <div className="flex gap-4 justify-center relative">
              <Link href="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold transition shadow-xl shadow-blue-600/30 hover:-translate-y-0.5">
                Create Free Account
              </Link>
              <Link href="/login"
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl font-semibold transition hover:-translate-y-0.5">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
