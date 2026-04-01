"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import toast from "react-hot-toast";

interface Profile {
  id: string; name: string; email: string;
  role: string; department: string; phone: string | null; avatar: string | null;
}

const deptLabel: Record<string, string> = {
  general: "General", cybercrime: "Cybercrime Unit",
  digital_forensics: "Digital Forensics", incident_response: "Incident Response",
  threat_intelligence: "Threat Intelligence", compliance: "Compliance & Legal",
  it_security: "IT Security",
};

const roleLabel: Record<string, string> = {
  admin: "Administrator", supervisor: "Supervisor", investigator: "Investigator",
  analyst: "Analyst", security_analyst: "Security Analyst", forensic_examiner: "Forensic Examiner",
  threat_hunter: "Threat Hunter", incident_responder: "Incident Responder",
  fraud_analyst: "Fraud Analyst", auditor: "Auditor", legal_counsel: "Legal Counsel",
  trainee: "Student / Trainee", viewer: "Viewer",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      setProfile(d);
      setForm({ name: d.name, phone: d.phone ?? "" });
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone || null }),
      });
      if (!res.ok) throw new Error();
      setProfile((p) => p ? { ...p, phone: form.phone || null } : p);
      toast.success("Profile updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading profile...</div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-start gap-6">
          <Avatar
            src={profile.avatar}
            name={profile.name}
            size="xl"
            editable
            onUpdate={(url) => setProfile((p) => p ? { ...p, avatar: url } : p)}
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-gray-500 text-sm">{profile.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {roleLabel[profile.role] ?? profile.role}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {deptLabel[profile.department] ?? profile.department}
              </span>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="text-sm text-blue-600 hover:underline shrink-0">
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4 border-t pt-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
              <input type="tel" placeholder="+1 234 567 8900" value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        ) : (
          <div className="mt-5 border-t pt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Phone</p>
              <p className="text-gray-700">{profile.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Member since</p>
              <p className="text-gray-700">—</p>
            </div>
          </div>
        )}
      </div>

      {/* Avatar instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">📷 Profile Picture</p>
        <p>Click the ✏️ button on your avatar to upload, change, or remove your profile picture. Supported formats: JPG, PNG, GIF, WebP. Max size: 2MB.</p>
      </div>
    </div>
  );
}
