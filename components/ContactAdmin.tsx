"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
}

const SUBJECTS = [
  "Request role change",
  "Access issue",
  "Case escalation",
  "Technical problem",
  "Request data export",
  "Other",
];

export default function ContactAdmin({ onClose }: Props) {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success("Message sent to admin");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        {sent ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Message Sent</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your message has been delivered to the admin. You will be contacted via your registered email.
            </p>
            <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Contact Admin</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Send a message to the system administrator</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your request or issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={loading || !message.trim()}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 text-sm">
                  {loading ? "Sending..." : "Send Message"}
                </button>
                <button type="button" onClick={onClose}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
