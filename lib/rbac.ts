import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "supersecret");

// ─── Role definitions ────────────────────────────────────────────────────────

export const ALL_ROLES = [
  "admin", "supervisor", "investigator", "analyst", "security_analyst",
  "forensic_examiner", "threat_hunter", "incident_responder",
  "fraud_analyst", "auditor", "legal_counsel", "trainee", "viewer",
] as const;

export type Role = (typeof ALL_ROLES)[number];

// ─── Permission map ───────────────────────────────────────────────────────────
// Each key is a capability; value is the set of roles that have it.

export const PERMISSIONS = {
  // Cases
  cases_view:   ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst","auditor","legal_counsel","trainee","viewer"],
  cases_create: ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst"],
  cases_edit:   ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst"],
  cases_delete: ["admin","supervisor"],
  cases_assign: ["admin","supervisor"],

  // Evidence
  evidence_view:   ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst","auditor","legal_counsel"],
  evidence_upload: ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst"],
  evidence_delete: ["admin","supervisor"],

  // Reports
  reports_view:   ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst","auditor","legal_counsel"],
  reports_export: ["admin","supervisor","auditor","legal_counsel","analyst","investigator"],

  // AI features
  ai_analyze:      ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst"],
  ai_credibility:  ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","fraud_analyst"],
  ai_investigate:  ["admin","supervisor","investigator","forensic_examiner","threat_hunter","incident_responder"],
  ai_chat:         ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst","trainee"],

  // Learning
  learn: ["admin","trainee","viewer","analyst","investigator","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst","auditor","legal_counsel","supervisor"],

  // Admin panel
  admin_panel: ["admin"],

  // Supervisor features
  supervisor_workload: ["admin","supervisor"],

  // User management
  users_manage: ["admin"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hasPermission(role: string, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

export function canAccess(role: string, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

// ─── API route guard ──────────────────────────────────────────────────────────
// Usage: const { role, userId, error } = await requireRole(req, ["admin","supervisor"]);

export async function requireRole(
  req: NextRequest,
  allowed: Role[]
): Promise<{ role: string; userId: string; error?: never } | { error: NextResponse; role?: never; userId?: never }> {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  try {
    const { payload } = await jwtVerify(token, secret);
    const role = (payload.role as string) || "viewer";
    const userId = payload.userId as string;
    if (!allowed.includes(role as Role)) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { role, userId };
  } catch {
    return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }
}

// ─── Page-level route permissions (used in middleware) ────────────────────────
// Maps path prefixes to the roles allowed to access them.
// More specific paths should come first.

export const PAGE_PERMISSIONS: { path: string; roles: Role[] }[] = [
  // Admin — admin only
  { path: "/admin",            roles: ["admin"] },

  // Evidence upload — restricted (no viewer/trainee/auditor/legal_counsel)
  { path: "/evidence/upload",  roles: ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst"] },

  // Evidence view — broader access
  { path: "/evidence",         roles: ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst","auditor","legal_counsel"] },

  // Reports — no trainee/viewer
  { path: "/reports",          roles: ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst","auditor","legal_counsel"] },

  // Cases new/edit — no viewer/trainee/auditor/legal_counsel
  { path: "/cases/new",        roles: ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst"] },

  // Cases view — all authenticated
  { path: "/cases",            roles: ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst","auditor","legal_counsel","trainee","viewer"] },

  // Learning — all authenticated
  { path: "/learn",            roles: ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst","auditor","legal_counsel","trainee","viewer"] },

  // Dashboard — all authenticated
  { path: "/dashboard",        roles: ["admin","supervisor","investigator","analyst","security_analyst","forensic_examiner","threat_hunter","incident_responder","fraud_analyst","auditor","legal_counsel","trainee","viewer"] },
];
