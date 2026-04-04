"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import PhoneInput from "./PhoneInput";

interface Props {
  onDone: () => void; // eslint-disable-line
}

export default function PhonePrompt({ onDone }: Props) {
  const [phone, setPhone]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error();
      toast.success("Phone number saved!");
    } catch {
      // silently dismiss
    } finally {
      setLoading(false);
      onDone();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📱</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add your phone number</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Help your team reach you. You can update this later in your profile.
          </p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <PhoneInput value={phone} onChange={setPhone} />
          <button type="submit" disabled={loading || !phone.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Saving..." : "Save Phone Number"}
          </button>
          <button type="button" onClick={onDone}
            className="w-full text-sm text-gray-400 hover:text-gray-600 transition">
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
