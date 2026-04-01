"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar";

const adminLinks = [
  { href: "/admin",             label: "Overview",    icon: "📊" },
  { href: "/admin/assistant",   label: "AI Assistant", icon: "🤖" },
  { href: "/admin/verify",      label: "Case Verifier", icon: "⚖️" },
  { href: "/admin/credibility", label: "Credibility", icon: "🔍" },
  { href: "/admin/users",       label: "Users",       icon: "👥" },
  { href: "/admin/messages",    label: "Messages",    icon: "✉️" },
  { href: "/admin/audit",       label: "Audit Log",   icon: "📋" },
  { href: "/dashboard",         label: "← App",       icon: "🔙" },
];

function AdminSidebar() {
  const pathname = usePathname();

  const logout = () => {
    document.cookie = "auth_token=; Max-Age=0; path=/";
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="p-5 border-b border-gray-800">
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">ADMIN</span>
        <h2 className="text-lg font-bold text-white mt-2">TraceMind AI</h2>
        <p className="text-xs text-gray-500">Administration Panel</p>
      </div>
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {adminLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm font-medium ${
              pathname === l.href
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <span>{l.icon}</span>{l.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-800 hover:text-white transition text-sm"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-6">{children}</main>
      </div>
    </div>
  );
}
