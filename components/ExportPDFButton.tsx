"use client";

interface Report {
  id: string;
  case?: { title: string; status: string; priority: string };
  result?: { risk_level: string; risk_score: number; total_logs: number; failed_attempts: number; insights: string[] };
  createdAt: string;
}

interface Props {
  reports: Report[];
}

export default function ExportPDFButton({ reports }: Props) {
  const handleExport = () => {
    const now = new Date().toLocaleString();
    const rows = reports.map((r) => `
      <tr>
        <td>${r.case?.title ?? "Unknown"}</td>
        <td>${r.result?.risk_level ?? "—"}</td>
        <td>${r.result?.risk_score ?? 0}/100</td>
        <td>${r.result?.total_logs ?? 0}</td>
        <td>${r.result?.failed_attempts ?? 0}</td>
        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TraceMind AI — Analysis Reports</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
    h1 { color: #1e40af; margin-bottom: 4px; }
    p.sub { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #1e40af; color: #fff; padding: 10px 12px; text-align: left; }
    td { padding: 9px 12px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>TraceMind AI — Analysis Reports</h1>
  <p class="sub">Generated: ${now} · ${reports.length} report(s)</p>
  <table>
    <thead>
      <tr>
        <th>Case Title</th><th>Risk Level</th><th>Risk Score</th>
        <th>Total Logs</th><th>Failed Attempts</th><th>Date</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracemind-reports-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition"
    >
      🖨️ Export HTML
    </button>
  );
}
