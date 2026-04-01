"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface Case { id: string; title: string; }

export default function UploadEvidencePage() {
  const searchParams = useSearchParams();
  const [cases, setCases] = useState<Case[]>([]);
  const [caseId, setCaseId] = useState(searchParams.get("caseId") || "");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/cases").then((r) => r.json()).then(setCases);
  }, []);

  const handleUpload = async () => {
    if (!files.length) return toast.error("Select at least one file");
    if (!caseId) return toast.error("Select a case first");
    setUploading(true);
    const done: string[] = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("caseId", caseId);
        const res = await fetch("/api/evidence/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
        done.push(file.name);
      }
      setUploaded((prev) => [...prev, ...done]);
      setFiles([]);
      toast.success(`${done.length} file(s) uploaded`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Evidence</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link to Case *</label>
          <select value={caseId} onChange={(e) => setCaseId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Select a case —</option>
            {cases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          {cases.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">
              No cases yet. <Link href="/cases/new" className="text-blue-600 hover:underline">Create one first.</Link>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Files</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
            <input type="file" multiple id="file-input" className="hidden"
              onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])} />
            <label htmlFor="file-input" className="cursor-pointer">
              <p className="text-3xl mb-2">📎</p>
              <p className="text-sm text-gray-500">Click to select files or drag and drop</p>
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <ul className="space-y-1">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                <span>📄</span> {f.name} <span className="text-gray-400 ml-auto">{(f.size / 1024).toFixed(1)} KB</span>
              </li>
            ))}
          </ul>
        )}

        <button onClick={handleUpload} disabled={uploading || !files.length || !caseId}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50">
          {uploading ? "Uploading..." : `Upload ${files.length > 0 ? `(${files.length} file${files.length > 1 ? "s" : ""})` : ""}`}
        </button>

        {uploaded.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium text-green-700 mb-1">Uploaded successfully:</p>
            {uploaded.map((f, i) => <p key={i} className="text-xs text-green-600">✓ {f}</p>)}
            {caseId && (
              <Link href={`/cases/${caseId}`} className="text-xs text-blue-600 hover:underline mt-2 block">
                View case →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
