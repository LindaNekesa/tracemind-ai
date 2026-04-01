"use client";
import { usePathname, useRouter } from "next/navigation";
import DarkModeToggle from "./DarkModeToggle";
import NotificationBell from "./NotificationBell";

const breadcrumbs: Record<string, string[]> = {
  "/dashboard":           ["Dashboard"],
  "/cases":               ["Cases"],
  "/cases/new":           ["Cases", "New Case"],
  "/evidence/upload":     ["Evidence", "Upload"],
  "/reports":             ["Reports"],
  "/profile":             ["Profile"],
  "/admin":               ["Admin", "Overview"],
  "/admin/users":         ["Admin", "Users"],
  "/admin/messages":      ["Admin", "Messages"],
  "/admin/verify":        ["Admin", "Case Verifier"],
  "/admin/credibility":   ["Admin", "Credibility"],
  "/admin/assistant":     ["Admin", "AI Assistant"],
};

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const crumbs   = breadcrumbs[pathname] ?? ["TraceMind AI"];

  return (
    <header className="w-full bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/5 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
            <span className={i === crumbs.length - 1
              ? "font-semibold text-gray-800 dark:text-white"
              : "text-gray-400 dark:text-gray-500"}>
              {c}
            </span>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <DarkModeToggle />
        <NotificationBell />
        <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />
        <button
          onClick={() => { document.cookie = "auth_token=; Max-Age=0; path=/"; router.push("/login"); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/5 transition font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </header>
  );
}
