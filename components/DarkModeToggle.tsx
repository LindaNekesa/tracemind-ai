"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  // Sync with current state on mount
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition
        bg-gray-100 text-gray-700 hover:bg-gray-200
        dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
    >
      {dark ? (
        <>
          <span>☀️</span>
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <span>🌙</span>
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
