"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

const ROLES = [
  { value: "viewer",             label: "Viewer",             desc: "Read-only access" },
  { value: "trainee",            label: "Trainee",            desc: "Learning access" },
  { value: "analyst",            label: "Analyst",            desc: "AI analysis" },
  { value: "security_analyst",   label: "Security Analyst",   desc: "Threat monitoring" },
  { value: "fraud_analyst",      label: "Fraud Analyst",      desc: "Fraud detection" },
  { value: "auditor",            label: "Auditor",            desc: "Compliance review" },
  { value: "investigator",       label: "Investigator",       desc: "Case management" },
  { value: "incident_responder", label: "Incident Responder", desc: "Active incidents" },
  { value: "forensic_examiner",  label: "Forensic Examiner",  desc: "Evidence analysis" },
  { value: "threat_hunter",      label: "Threat Hunter",      desc: "Proactive hunting" },
  { value: "legal_counsel",      label: "Legal Counsel",      desc: "Legal proceedings" },
  { value: "supervisor",         label: "Supervisor",         desc: "Team oversight" },
];

const DEPARTMENTS = [
  { value: "general",             label: "General" },
  { value: "cybercrime",          label: "Cybercrime Unit" },
  { value: "digital_forensics",   label: "Digital Forensics" },
  { value: "incident_response",   label: "Incident Response" },
  { value: "threat_intelligence", label: "Threat Intelligence" },
  { value: "compliance",          label: "Compliance & Legal" },
  { value: "it_security",         label: "IT Security" },
  { value: "education",           label: "Education / Training" },
];

import PhoneInput from "@/components/PhoneInput";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "", role: "viewer", department: "general" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthConfig = [
    null,
    { label: "Weak",   bar: "w-1/3 bg-red-500" },
    { label: "Fair",   bar: "w-2/3 bg-amber-500" },
    { label: "Strong", bar: "w-full bg-emerald-500" },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 6)       { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role, department: form.department, phone: form.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Account created! Please sign in.");
        router.push("/login");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/8 transition";
  const labelCls = "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2";

  return (
    <div className="min-h-screen flex bg-[#060b18]">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-base shadow-lg shadow-blue-600/40">🔍</div>
            <span className="text-xl font-bold text-white">TraceMind AI</span>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-4">
            Join the Forensics<br />
            <span className="gradient-text">Investigation Platform</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Select your role and department to get the right level of access for your work.
          </p>

          {/* Selected role preview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Selected Role</p>
            <p className="text-white font-semibold">{ROLES.find((r) => r.value === form.role)?.label}</p>
            <p className="text-gray-400 text-xs mt-1">{ROLES.find((r) => r.value === form.role)?.desc}</p>
          </div>
        </div>
        <p className="relative text-xs text-gray-600">© 2026 TraceMind AI</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0d1117] overflow-y-auto">
        <div className="w-full max-w-[440px] py-8">

          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">🔍</div>
            <span className="text-lg font-bold text-white">TraceMind AI</span>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-black text-white mb-1.5">Create your account</h1>
            <p className="text-gray-500 text-sm">Fill in your details to get started.</p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input type="text" required placeholder="Jane Doe" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Email Address *</label>
              <input type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Phone <span className="text-gray-600 normal-case font-normal">(optional)</span></label>
              <PhoneInput value={form.phone} onChange={(v) => set("phone", v)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Role</label>
                <select value={form.role} onChange={(e) => set("role", e.target.value)}
                  className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                  {ROLES.map((r) => <option key={r.value} value={r.value} className="bg-gray-900">{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Department</label>
                <select value={form.department} onChange={(e) => set("department", e.target.value)}
                  className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                  {DEPARTMENTS.map((d) => <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Password *</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required placeholder="Min. 6 characters" value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition p-1">
                  {showPassword
                    ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              {form.password.length > 0 && strengthConfig[strength] && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-1 rounded-full transition-all ${strengthConfig[strength]!.bar}`} />
                  </div>
                  <span className="text-xs text-gray-500">{strengthConfig[strength]!.label}</span>
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Confirm Password *</label>
              <input type={showPassword ? "text" : "password"} required placeholder="Re-enter password" value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                className={`${inputCls} ${form.confirm && form.confirm !== form.password ? "border-red-500/50 focus:ring-red-500" : ""}`} />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm transition shadow-xl shadow-blue-600/30 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
