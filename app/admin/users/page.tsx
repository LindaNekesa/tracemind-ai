"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Avatar from "@/components/Avatar";

interface User {
  id: string; name: string; email: string; role: string;
  department: string; phone: string | null; avatar: string | null; createdAt: string;
  _count: { cases: number };
}

const ALL_ROLES = [
  "viewer", "trainee", "analyst", "security_analyst", "fraud_analyst",
  "auditor", "investigator", "incident_responder", "forensic_examiner",
  "threat_hunter", "legal_counsel", "supervisor", "admin",
];
const DEPARTMENTS = [
  { value: "general",             label: "General" },
  { value: "cybercrime",          label: "Cybercrime" },
  { value: "digital_forensics",   label: "Digital Forensics" },
  { value: "incident_response",   label: "Incident Response" },
  { value: "threat_intelligence", label: "Threat Intelligence" },
  { value: "compliance",          label: "Compliance & Legal" },
  { value: "it_security",         label: "IT Security" },
];
const roleColor: Record<string, string> = {
  admin: "bg-red-100 text-red-700", supervisor: "bg-orange-100 text-orange-700",
  investigator: "bg-blue-100 text-blue-700", analyst: "bg-purple-100 text-purple-700",
  security_analyst: "bg-indigo-100 text-indigo-700", forensic_examiner: "bg-cyan-100 text-cyan-700",
  threat_hunter: "bg-violet-100 text-violet-700", incident_responder: "bg-rose-100 text-rose-700",
  fraud_analyst: "bg-amber-100 text-amber-700", auditor: "bg-teal-100 text-teal-700",
  legal_counsel: "bg-slate-100 text-slate-700", trainee: "bg-lime-100 text-lime-700",
  viewer: "bg-gray-100 text-gray-600",
};
const deptLabel = (v: string) => DEPARTMENTS.find((d) => d.value === v)?.label ?? v;

const EMPTY_FORM = { name: "", email: "", password: "", role: "viewer", department: "general", phone: "" };

export default function AdminUsersPage() {
  const [users, setUsers]       = useState<User[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [creating, setCreating]     = useState(false);

  // Edit
  const [editing, setEditing]   = useState<string | null>(null);
  const [editData, setEditData] = useState<{ role: string; department: string; name: string }>({ role: "", department: "", name: "" });

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [resetTarget, setResetTarget]   = useState<User | null>(null);
  const [newPassword, setNewPassword]   = useState("");
  const [resetting, setResetting]       = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users").then((r) => r.json()).then(setUsers).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setC = (k: string, v: string) => setCreateForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(`User ${createForm.name} created`);
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...editData }),
      });
      if (!res.ok) throw new Error();
      setUsers((p) => p.map((u) => u.id === id ? { ...u, ...editData } : u));
      toast.success("User updated");
    } catch { toast.error("Failed to update"); }
    finally { setEditing(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setUsers((p) => p.filter((u) => u.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} registered user(s)</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + Add User
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <input type="text" placeholder="Search by name or email..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Roles</option>
          {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading users...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Cases</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      {editing === u.id
                        ? <input value={editData.name} onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                            className="border rounded px-2 py-1 text-xs w-28" />
                        : <span className="font-medium text-gray-800">{u.name}</span>
                      }
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3">
                    {editing === u.id
                      ? <select value={editData.role} onChange={(e) => setEditData((d) => ({ ...d, role: e.target.value }))}
                          className="border rounded px-2 py-1 text-xs">
                          {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      : <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColor[u.role] ?? "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                    }
                  </td>
                  <td className="px-5 py-3">
                    {editing === u.id
                      ? <select value={editData.department} onChange={(e) => setEditData((d) => ({ ...d, department: e.target.value }))}
                          className="border rounded px-2 py-1 text-xs">
                          {DEPARTMENTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      : <span className="text-xs bg-gray-100 px-2 py-1 rounded">{deptLabel(u.department)}</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{u.phone ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-5 py-3 text-gray-500">{u._count.cases}</td>
                  <td className="px-5 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    {editing === u.id
                      ? <div className="flex gap-2">
                          <button onClick={() => saveEdit(u.id)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Save</button>
                          <button onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">Cancel</button>
                        </div>
                      : <div className="flex gap-2">
                          <button onClick={() => { setEditing(u.id); setEditData({ role: u.role, department: u.department, name: u.name }); }}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Edit</button>
                          <button onClick={() => { setResetTarget(u); setNewPassword(""); }}
                            className="px-3 py-1 bg-amber-50 text-amber-700 rounded text-xs hover:bg-amber-100">Reset PW</button>
                          <button onClick={() => setDeleteTarget(u)}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100">Delete</button>
                        </div>
                    }
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create user modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800">Add New User</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" required placeholder="Jane Doe" value={createForm.name} onChange={(e) => setC("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" required placeholder="jane@example.com" value={createForm.email} onChange={(e) => setC("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" required placeholder="Min. 6 characters" value={createForm.password} onChange={(e) => setC("password", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select value={createForm.role} onChange={(e) => setC("role", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <select value={createForm.department} onChange={(e) => setC("department", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {DEPARTMENTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone <span className="text-gray-400">(optional)</span></label>
                  <input type="tel" placeholder="+1 234 567 8900" value={createForm.phone} onChange={(e) => setC("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60 text-sm">
                  {creating ? "Creating..." : "Create User"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🔑</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-5">Set a new password for <span className="font-semibold text-gray-800">{resetTarget.name}</span></p>
            <input type="password" placeholder="New password (min. 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
            <div className="flex gap-3">
              <button onClick={async () => {
                if (newPassword.length < 6) { toast.error("Min 6 characters"); return; }
                setResetting(true);
                const res = await fetch("/api/admin/users/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: resetTarget.id, password: newPassword }) });
                if (res.ok) { toast.success("Password reset"); setResetTarget(null); }
                else toast.error("Failed to reset");
                setResetting(false);
              }} disabled={resetting}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60 text-sm">
                {resetting ? "Resetting..." : "Reset Password"}
              </button>
              <button onClick={() => setResetTarget(null)} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Delete User</h2>
            <p className="text-sm text-gray-500 mb-1">
              Are you sure you want to delete <span className="font-semibold text-gray-800">{deleteTarget.name}</span>?
            </p>
            <p className="text-xs text-red-500 mb-6">This action cannot be undone. Their cases will remain in the system.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-60 text-sm">
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
