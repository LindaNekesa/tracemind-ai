"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function EvidenceUpload() {
  const { id } = useParams();
  const [files, setFiles] = useState<FileList | null>(null);

  const upload = async () => {
    if (!files) return;
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append("files", f));

    const res = await fetch("/api/cases/uploadEvidence", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert(`Uploaded ${data.length} files`);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-2">Upload Evidence</h1>
      <input type="file" multiple onChange={e => setFiles(e.target.files)} className="mb-2" />
      <button onClick={upload} className="px-4 py-2 bg-blue-600 text-white rounded">Upload</button>
    </div>
  );
}