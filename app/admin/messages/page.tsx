"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string; role: string };
}

const statusColor: Record<string, string> = {
  unread:   "bg-blue-100 text-blue-700",
  read:     "bg-gray-100 text-gray-600",
  resolved: "bg-green-100 text-green-700",
};

export default function AdminMessagesPage() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);

  // Reply modal state
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [replyBody, setReplyBody]     = useState("");
  const [sending, setSending]         = useState(false);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then(setMessages)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
    } catch { /* silent */ }
  };

  const openReply = (msg: Message) => {
    setReplyTarget(msg);
    setReplyBody("");
    if (msg.status === "unread") updateStatus(msg.id, "read");
  };

  const sendReply = async () => {
    if (!replyTarget || !replyBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: replyTarget.id, replyBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      toast.success(`Reply sent to ${replyTarget.user.email}`);
      setMessages((prev) => prev.map((m) => m.id === replyTarget.id ? { ...m, status: "resolved" } : m));
      setReplyTarget(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const unread = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Messages Inbox</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "All messages read"}
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-gray-500">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${
              m.status === "unread" ? "border-blue-500" : m.status === "resolved" ? "border-green-500" : "border-gray-200"
            }`}>
              <div className="p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => {
                  setExpanded(expanded === m.id ? null : m.id);
                  if (m.status === "unread") updateStatus(m.id, "read");
                }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">
                        {m.user.name}
                        <span className="ml-2 text-xs font-normal text-gray-400">{m.user.email}</span>
                      </p>
                      <p className="text-sm text-gray-600 truncate">{m.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[m.status]}`}>{m.status}</span>
                    <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {expanded === m.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{m.message}</p>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                      onClick={() => openReply(m)}
                      className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                    >
                      ✉️ Reply via Email
                    </button>
                    {m.status !== "resolved" && (
                      <button onClick={() => updateStatus(m.id, "resolved")}
                        className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition">
                        ✅ Mark Resolved
                      </button>
                    )}
                    {m.status === "resolved" && (
                      <button onClick={() => updateStatus(m.id, "read")}
                        className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                        ↩ Reopen
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply modal */}
      {replyTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Reply to {replyTarget.user.name}</h2>
                <p className="text-sm text-gray-500">{replyTarget.user.email}</p>
              </div>
              <button onClick={() => setReplyTarget(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            {/* Original message preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-sm">
              <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Original message</p>
              <p className="text-gray-600 font-medium">{replyTarget.subject}</p>
              <p className="text-gray-500 mt-1 text-xs line-clamp-2">{replyTarget.message}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your reply</label>
              <textarea
                rows={6}
                placeholder={`Hi ${replyTarget.user.name},\n\nThank you for reaching out...`}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={sendReply}
                disabled={sending || !replyBody.trim()}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {sending ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                ) : (
                  <>✉️ Send Email Reply</>
                )}
              </button>
              <button onClick={() => setReplyTarget(null)}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3 text-center">
              Email will be sent to <strong>{replyTarget.user.email}</strong> and the message will be marked as resolved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
