"use client";

import { useEffect, useState, useRef } from "react";
import Avatar from "./Avatar";

interface Comment {
  id: string; content: string; createdAt: string;
  user: { name: string; avatar: string | null; role: string };
}

export default function CaseComments({ caseId }: { caseId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [posting, setPosting]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/cases/${caseId}/comments`)
      .then((r) => r.json()).then(setComments).finally(() => setLoading(false));
  }, [caseId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/cases/${caseId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments((p) => [...p, c]);
      setText("");
    }
    setPosting(false);
  };

  return (
    <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
        <h2 className="font-semibold text-gray-800 dark:text-white text-sm">
          Case Notes & Comments ({comments.length})
        </h2>
      </div>

      <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">{[1,2].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No notes yet. Add the first one.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <Avatar src={c.user.avatar} name={c.user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.user.name}</span>
                  <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2">
                  {c.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="px-5 pb-5 flex gap-3">
        <input
          type="text" placeholder="Add a note or comment..."
          value={text} onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white placeholder-gray-400"
        />
        <button type="submit" disabled={posting || !text.trim()}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-500 transition disabled:opacity-50">
          {posting ? "..." : "Post"}
        </button>
      </form>
    </div>
  );
}
