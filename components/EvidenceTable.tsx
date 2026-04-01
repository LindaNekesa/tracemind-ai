"use client";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";

interface Evidence {
  id: string;
  filePath: string;
  fileType: string;
  caseId: string;
  createdAt: string;
}

export default function EvidenceTable() {
  const [data, setData] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/evidence")
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">File</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Case ID</th>
            <th className="border p-2">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-100">
              <td className="border p-2">{item.filePath}</td>
              <td className="border p-2">{item.fileType}</td>
              <td className="border p-2">{item.caseId}</td>
              <td className="border p-2">{new Date(item.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
          {!data.length && (
            <tr><td colSpan={4} className="border p-2 text-center text-gray-500">No evidence found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
