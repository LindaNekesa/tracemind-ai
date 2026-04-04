"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Me {
  id: string; name: string; email: string; role: string;
  emailVerified?: boolean; lastLoginAt?: string | null;
}

export default function SettingsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { setMe(d); setName(d.name ?? ""); });
  }, []);

  const handleNameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    try {
      const res = await fetch("/api/auth/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) { toast.success("Name updated"); setMe((m) => m ? { ...m, name: data.name } : m); }
      else toast.error(data.error || "Failed");
    } finally { setSavingName(false); }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) { toast.success("Password changed"); setCurrentPassword(""); setNewPassword(""); }
      else toast.error(data.error || "Failed");
    } finally { setSavingPw(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-white">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your profile and security</p>
      </div>

      {/* Status info */}
      {me && (
        <div className="bg-white/3 border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Email</span>
            <span className="text-sm text-white">{me.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Email Verified</span>
            {me.emailVerified
              ? <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>
              : <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">⚠ Unverified</span>
            }
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Last Login</span>
            <span className="text-sm text-white">
              {me.lastLoginAt ? new Date(me.lastLoginAt).toLocaleString() : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Role</span>
            <span className="text-sm text-white capitalize">{me.role}</span>
          </div>
        </div>
      )}

      {/* Change name */}
      <form onSubmit={handleNameSave} className="bg-white/3 border border-white/5 rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-white">Display Name</h2>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your name"
        />
        <button type="submit" disabled={savingName}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60">
          {savingName ? "Saving..." : "Save Name"}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={handlePasswordSave} className="bg-white/3 border border-white/5 rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold text-white">Change Password</h2>
        <input
          type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
          required placeholder="Current password"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
          required placeholder="New password (min 8 chars)" minLength={8}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" disabled={savingPw}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60">
          {savingPw ? "Saving..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
