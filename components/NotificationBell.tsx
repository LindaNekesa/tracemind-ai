"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  avatar?: string | null;
  href: string;
}

export default function NotificationBell() {
  const [unread, setUnread]           = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen]               = useState(false);
  const [loading, setLoading]         = useState(false);
  const ref                           = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setUnread(data.unread ?? 0);
      setNotifications(data.notifications ?? []);
    } catch { /* silent */ }
  };

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
  };

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnread(0);
      setNotifications([]);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">
              Notifications {unread > 0 && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{unread} new</span>}
            </h3>
            {unread > 0 && (
              <button onClick={markAllRead} disabled={loading}
                className="text-xs text-blue-600 hover:underline disabled:opacity-50">
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm text-gray-400">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <Link key={n.id} href={n.href} onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
                      {n.avatar
                      ? <span className="w-full h-full rounded-full overflow-hidden block" style={{ backgroundImage: `url(${n.avatar})`, backgroundSize: "cover" }} />
                      : n.title.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white leading-snug">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.time)}</p>
                  </div>
                  <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 text-center">
            <Link href="/admin/messages" onClick={() => setOpen(false)}
              className="text-xs text-blue-600 hover:underline font-medium">
              View all messages →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
