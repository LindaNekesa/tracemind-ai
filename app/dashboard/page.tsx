import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import StatsCard from "@/components/StatsCard";
import ChartComponent from "@/components/Chart";
import RecentActivity from "@/components/RecentActivity";
import InvestigatorDashboard from "@/components/dashboards/InvestigatorDashboard";
import AnalystDashboard from "@/components/dashboards/AnalystDashboard";
import ViewerDashboard from "@/components/dashboards/ViewerDashboard";
import SecurityAnalystDashboard from "@/components/dashboards/SecurityAnalystDashboard";
import AuditorDashboard from "@/components/dashboards/AuditorDashboard";
import FraudAnalystDashboard from "@/components/dashboards/FraudAnalystDashboard";
import TraineeDashboard from "@/components/dashboards/TraineeDashboard";
import IncidentResponderDashboard from "@/components/dashboards/IncidentResponderDashboard";
import ForensicExaminerDashboard from "@/components/dashboards/ForensicExaminerDashboard";
import ThreatHunterDashboard from "@/components/dashboards/ThreatHunterDashboard";
import LegalCounselDashboard from "@/components/dashboards/LegalCounselDashboard";
import SupervisorDashboard from "@/components/dashboards/SupervisorDashboard";
import Link from "next/link";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      name: (payload.name as string) || "User",
      role: (payload.role as string) || "viewer",
      department: (payload.department as string) || "general",
    };
  } catch { return null; }
}

async function getStats(_userId: string, _role: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard`, {
      cache: "no-store",
      headers: { Cookie: `auth_token=${token}` },
    });
    return res.json();
  } catch {
    return { total: 0, open: 0, closed: 0, evidenceCount: 0, analysisCount: 0, chartData: [], riskBreakdown: [], recentCases: [] };
  }
}

export default async function DashboardPage() {
  const user = await getUserFromCookie();
  if (!user) redirect("/login");

  const stats = await getStats(user.userId, user.role);

  // Admin dashboard
  if (user.role === "admin") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Full system overview</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition">⚙️ Admin Panel</Link>
            <Link href="/cases/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">+ New Case</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatsCard title="Total Cases"    value={stats.total}         icon="📁" color="blue"   sub="All time" />
          <StatsCard title="Open Cases"     value={stats.open}          icon="🔓" color="yellow" sub="Active" />
          <StatsCard title="Closed Cases"   value={stats.closed}        icon="✅" color="green"  sub="Resolved" />
          <StatsCard title="Evidence Files" value={stats.evidenceCount} icon="🗂️" color="purple" sub="Uploaded" />
          <StatsCard title="AI Analyses"    value={stats.analysisCount} icon="🤖" color="red"    sub="Completed" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Quick Actions</h2>
          <div className="flex gap-3 flex-wrap">
            <Link href="/cases/new"       className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">📁 New Case</Link>
            <Link href="/cases"           className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">🔍 All Cases</Link>
            <Link href="/evidence/upload" className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">🗂️ Upload Evidence</Link>
            <Link href="/admin/users"     className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">👥 Manage Users</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartComponent data={stats.chartData.length ? stats.chartData : undefined} type="bar" title="Cases by Month" />
          <RecentActivity />
        </div>
      </div>
    );
  }

  if (user.role === "investigator") {
    return <InvestigatorDashboard stats={{ ...stats, name: user.name }} />;
  }

  if (user.role === "analyst") {
    return <AnalystDashboard stats={{ ...stats, name: user.name }} />;
  }

  if (user.role === "security_analyst") {
    return <SecurityAnalystDashboard stats={{ ...stats, name: user.name }} />;
  }

  if (user.role === "auditor") {
    return <AuditorDashboard stats={{ ...stats, name: user.name }} />;
  }

  if (user.role === "fraud_analyst") {
    return <FraudAnalystDashboard stats={{ ...stats, name: user.name }} />;
  }

  if (user.role === "trainee") {
    return <TraineeDashboard stats={{ ...stats, name: user.name, department: user.department }} />;
  }

  if (user.role === "incident_responder") {
    return <IncidentResponderDashboard stats={{ ...stats, name: user.name }} />;
  }

  if (user.role === "forensic_examiner") {
    return <ForensicExaminerDashboard stats={{ ...stats, name: user.name }} />;
  }

  if (user.role === "threat_hunter") {
    return <ThreatHunterDashboard stats={{ ...stats, name: user.name }} />;
  }

  if (user.role === "legal_counsel") {
    return <LegalCounselDashboard stats={{ ...stats, name: user.name, department: user.department }} />;
  }

  if (user.role === "supervisor") {
    return <SupervisorDashboard stats={{ ...stats, name: user.name }} />;
  }

  // viewer (default)
  return <ViewerDashboard stats={{ ...stats, name: user.name, department: user.department }} />;
}
