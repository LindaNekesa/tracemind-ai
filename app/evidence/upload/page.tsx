"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

interface Case { id: string; title: string; }

export default function UploadEvidencePage() {
  const searchParams = useSearchParams();
  const [cases, setCases]       = useState<Case[]>([]);
  const [caseId, setCaseId]     = useState(searchParams.get("caseId") || "");
  const [files, setFiles]       = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetch("/api/cases?limit=100").then((r) => r.json()).then((d) => {
      setCases(Array.isArray(d) ? d : (d.cases ?? []));
    });
  }, []);

  const addFiles = (newFiles: File[]) => {
    setFiles((p) => {
      const existing = new Set(p.map((f) => f.name));
      return [...p, ...newFiles.filter((f) => !existing.has(f.name))];
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

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
        if (!res.ok) throw new Error(`Failed: ${file.name}`);
        done.push(file.name);
      }
      setUploaded((p) => [...p, ...done]);
      setFiles([]);
      toast.success(`${done.length} file(s) uploaded`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["jpg","jpeg","png","gif","webp"].includes(ext ?? "")) return "🖼️";
    if (ext === "pdf") return "📄";
    if (["doc","docx"].includes(ext ?? "")) return "📝";
    if (["xls","xlsx","csv"].includes(ext ?? "")) return "📊";
    if (["zip","rar","7z"].includes(ext ?? "")) return "🗜️";
    return "📎";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/cases" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Upload Evidence</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Attach files to a forensic case</p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/3 border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-5">
        {/* Case selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Link to Case *</label>
          <select value={caseId} onChange={(e) => setCaseId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white">
            <option value="">— Select a case —</option>
            {cases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          {cases.length === 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              No cases yet. <Link href="/cases/new" className="text-blue-600 dark:text-blue-400 hover:underline">Create one first.</Link>
            </p>
          )}
        </div>

        {/* Drop zone */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Evidence Files</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer ${
              dragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                : "border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-white/3"
            }`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input type="file" multiple id="file-input" className="hidden"
              onChange={(e) => addFiles(e.target.files ? Array.from(e.target.files) : [])} />
            <div className="text-4xl mb-3">{dragging ? "📂" : "📎"}</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {dragging ? "Drop files here" : "Click to select or drag & drop files"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Any file type accepted</p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-2.5">
                <span className="text-lg">{fileIcon(f.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{f.name}</p>
                  <p className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 transition text-sm">✕</button>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleUpload} disabled={uploading || !files.length || !caseId}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-500 transition disabled:opacity-50 shadow-lg shadow-blue-600/25">
          {uploading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
          ) : (
            <><span>⬆️</span> Upload {files.length > 0 ? `${files.length} File${files.length > 1 ? "s" : ""}` : "Evidence"}</>
          )}
        </button>
      </div>

      {/* Success */}
      {uploaded.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">✓ Uploaded successfully</p>
          {uploaded.map((f, i) => <p key={i} className="text-xs text-emerald-600 dark:text-emerald-500">• {f}</p>)}
          {caseId && (
            <Link href={`/cases/${caseId}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-3 block font-medium">
              View case →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
