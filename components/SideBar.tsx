"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ContactAdmin from "./ContactAdmin";
import Avatar from "./Avatar";

interface Me { name: string; role: string; email: string; avatar?: string | null; }

const roleLabel: Record<string, string> = {
  admin: "Administrator", supervisor: "Supervisor", investigator: "Investigator",
  analyst: "Analyst", security_analyst: "Security Analyst", forensic_examiner: "Forensic Examiner",
  threat_hunter: "Threat Hunter", incident_responder: "Incident Responder",
  fraud_analyst: "Fraud Analyst", auditor: "Auditor", legal_counsel: "Legal Counsel",
  trainee: "Trainee", viewer: "Viewer",
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin]     = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [me, setMe]               = useState<Me | null>(null);

  const links = [
    { href: "/dashboard",       label: "Dashboard", icon: "▣" },
    { href: "/cases",           label: "Cases",      icon: "⬡" },
    { href: "/evidence/upload", label: "Evidence",   icon: "◈" },
    { href: "/reports",         label: "Reports",    icon: "◧" },
    ...(me?.role === "trainee" ? [{ href: "/learn", label: "Learning", icon: "🎓" }] : []),
  ];

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { setIsAdmin(d.role === "admin"); setMe(d); })
      .catch(() => {});
  }, []);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <aside className="w-64 min-h-screen bg-[#0d1117] border-r border-white/5 text-white flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">🔍</div>
            <div>
              <p className="text-sm font-bold text-white leading-none">TraceMind AI</p>
              <p className="text-xs text-gray-500 mt-0.5">Forensics Platform</p>
            </div>
          </div>
        </div>

        {/* User card */}
        {me && me.name && (
          <Link href="/profile"
            className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 hover:bg-white/3 transition group">
            <Avatar src={me.avatar} name={me.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate leading-none">{me.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{roleLabel[me.role] ?? me.role}</p>
            </div>
            <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">Navigation</p>
          {links.map((l) => (            <Link key={l.label} href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm font-medium ${
                isActive(l.href)
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              <span className="text-base w-5 text-center">{l.icon}</span>
              {l.label}
              {isActive(l.href) && <span className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3">Admin</p>
              </div>
              <Link href="/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm font-medium ${
                  pathname.startsWith("/admin")
                    ? "bg-red-500/15 text-red-400 border border-red-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                <span className="text-base w-5 text-center">⚙</span>
                Admin Panel
                {pathname.startsWith("/admin") && <span className="ml-auto w-1.5 h-1.5 bg-red-400 rounded-full" />}
              </Link>
            </>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
          <Link href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm font-medium ${
              pathname === "/settings"
                ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}>
            <span className="text-base w-5 text-center">⚙</span> Settings
          </Link>
          <Link href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition text-sm">
            <span className="text-base w-5 text-center">◉</span> My Profile
          </Link>
          {!isAdmin && (
            <button onClick={() => setShowContact(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition text-sm">
              <span className="text-base w-5 text-center">✉</span> Contact Admin
            </button>
          )}
          <button
            onClick={() => { document.cookie = "auth_token=; Max-Age=0; path=/"; window.location.href = "/login"; }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition text-sm">
            <span className="text-base w-5 text-center">⏻</span> Sign Out
          </button>
        </div>
      </aside>
      {showContact && <ContactAdmin onClose={() => setShowContact(false)} />}
    </>
  );
}
