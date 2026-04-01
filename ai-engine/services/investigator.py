"""
Core investigation engine — timeline, pattern detection,
entity extraction, correlation, and threat scoring.
"""
import pandas as pd
from datetime import datetime, timedelta
from typing import Any
from collections import defaultdict
import re


# ── helpers ──────────────────────────────────────────────────────────────────

def _safe_dt(val: Any) -> datetime | None:
    if not val:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%SZ"):
        try:
            return datetime.strptime(str(val)[:19], fmt)
        except ValueError:
            continue
    return None


IP_RE   = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
USER_RE = re.compile(r"\b(?:user|username|account)[=:\s]+(\S+)", re.I)
HOST_RE = re.compile(r"\b(?:host|hostname|server)[=:\s]+(\S+)", re.I)
PATH_RE = re.compile(r"(?:/[\w./\-]+|[A-Za-z]:\\[\w\\.\-]+)")


# ── 1. Timeline reconstruction ────────────────────────────────────────────────

def build_timeline(logs: list[dict]) -> dict[str, Any]:
    events = []
    for log in logs:
        ts = _safe_dt(log.get("timestamp") or log.get("time") or log.get("ts"))
        events.append({
            "timestamp": ts.isoformat() if ts else None,
            "event":     log.get("event") or log.get("action") or log.get("type", "unknown"),
            "user":      log.get("user") or log.get("username", ""),
            "ip":        log.get("ip") or log.get("src_ip", ""),
            "status":    log.get("status", ""),
            "raw":       log,
        })

    events_with_ts = [e for e in events if e["timestamp"]]
    events_with_ts.sort(key=lambda x: x["timestamp"])

    # Detect time gaps > 1 hour
    gaps = []
    for i in range(1, len(events_with_ts)):
        t1 = datetime.fromisoformat(events_with_ts[i - 1]["timestamp"])
        t2 = datetime.fromisoformat(events_with_ts[i]["timestamp"])
        diff = (t2 - t1).total_seconds() / 3600
        if diff > 1:
            gaps.append({
                "after":  events_with_ts[i - 1]["timestamp"],
                "before": events_with_ts[i]["timestamp"],
                "gap_hours": round(diff, 2),
            })

    return {
        "total_events": len(events),
        "timestamped_events": len(events_with_ts),
        "timeline": events_with_ts[:100],   # cap for response size
        "gaps": gaps,
        "first_event": events_with_ts[0]["timestamp"]  if events_with_ts else None,
        "last_event":  events_with_ts[-1]["timestamp"] if events_with_ts else None,
    }


# ── 2. Entity extraction ──────────────────────────────────────────────────────

def extract_entities(logs: list[dict]) -> dict[str, Any]:
    ips, users, hosts, paths = set(), set(), set(), set()

    for log in logs:
        raw = str(log)
        ips.update(IP_RE.findall(raw))
        users.update(m.group(1) for m in USER_RE.finditer(raw))
        hosts.update(m.group(1) for m in HOST_RE.finditer(raw))
        paths.update(PATH_RE.findall(raw))

        # Also pull from structured fields
        for field in ("user", "username", "account"):
            if v := log.get(field):
                users.add(str(v))
        for field in ("ip", "src_ip", "dest_ip", "source_ip"):
            if v := log.get(field):
                ips.add(str(v))

    # Filter private/loopback IPs from suspicious list
    external_ips = [ip for ip in ips if not ip.startswith(("127.", "10.", "192.168.", "172."))]

    return {
        "ips":          sorted(ips),
        "external_ips": external_ips,
        "users":        sorted(users),
        "hosts":        sorted(hosts),
        "file_paths":   sorted(paths)[:20],
    }


# ── 3. Attack pattern classification ─────────────────────────────────────────

ATTACK_PATTERNS = {
    "brute_force": {
        "label": "Brute Force Attack",
        "description": "Repeated failed authentication attempts from same source.",
        "mitre": "T1110",
    },
    "lateral_movement": {
        "label": "Lateral Movement",
        "description": "Access to multiple internal hosts from a single account.",
        "mitre": "T1021",
    },
    "privilege_escalation": {
        "label": "Privilege Escalation",
        "description": "Account accessed admin/root resources after normal activity.",
        "mitre": "T1068",
    },
    "data_exfiltration": {
        "label": "Data Exfiltration",
        "description": "Large volume of data accessed or transferred externally.",
        "mitre": "T1041",
    },
    "credential_dumping": {
        "label": "Credential Dumping",
        "description": "Access to credential stores or password files detected.",
        "mitre": "T1003",
    },
    "reconnaissance": {
        "label": "Reconnaissance",
        "description": "Systematic scanning or enumeration of resources.",
        "mitre": "T1595",
    },
}


def classify_attack_patterns(logs: list[dict]) -> list[dict[str, Any]]:
    df = pd.DataFrame(logs)
    if df.empty:
        return []
    df.columns = [c.lower() for c in df.columns]

    detected = []

    # Brute force: ≥5 failed logins from same IP
    if "status" in df.columns and "ip" in df.columns:
        failed = df[df["status"].str.lower() == "failed"]
        per_ip = failed.groupby("ip").size()
        bf_ips = per_ip[per_ip >= 5].index.tolist()
        if bf_ips:
            p = ATTACK_PATTERNS["brute_force"].copy()
            p["evidence"] = f"IPs with ≥5 failures: {', '.join(bf_ips)}"
            p["confidence"] = min(round(len(bf_ips) * 0.2, 2), 1.0)
            detected.append(p)

    # Lateral movement: same user on ≥3 different hosts
    if "user" in df.columns and "host" in df.columns:
        per_user = df.groupby("user")["host"].nunique()
        lm_users = per_user[per_user >= 3].index.tolist()
        if lm_users:
            p = ATTACK_PATTERNS["lateral_movement"].copy()
            p["evidence"] = f"Users on multiple hosts: {', '.join(lm_users)}"
            p["confidence"] = min(round(len(lm_users) * 0.25, 2), 1.0)
            detected.append(p)

    # Privilege escalation: events with "admin", "root", "sudo"
    raw_str = df.to_string().lower()
    if any(kw in raw_str for kw in ("sudo", "root", "admin", "privilege", "escalat")):
        p = ATTACK_PATTERNS["privilege_escalation"].copy()
        p["evidence"] = "Privileged keywords found in log events."
        p["confidence"] = 0.6
        detected.append(p)

    # Data exfiltration: large transfer keywords
    if any(kw in raw_str for kw in ("upload", "transfer", "exfil", "download", "export", "ftp", "scp")):
        p = ATTACK_PATTERNS["data_exfiltration"].copy()
        p["evidence"] = "Data transfer keywords detected in logs."
        p["confidence"] = 0.55
        detected.append(p)

    # Credential dumping
    if any(kw in raw_str for kw in ("passwd", "shadow", "sam ", "lsass", "credential", "mimikatz", "ntds")):
        p = ATTACK_PATTERNS["credential_dumping"].copy()
        p["evidence"] = "Credential-related keywords detected."
        p["confidence"] = 0.75
        detected.append(p)

    # Reconnaissance: port scan / enumeration
    if "event" in df.columns:
        scan_events = df[df["event"].str.lower().str.contains("scan|enum|probe|discover", na=False)]
        if len(scan_events) > 3:
            p = ATTACK_PATTERNS["reconnaissance"].copy()
            p["evidence"] = f"{len(scan_events)} scan/probe events detected."
            p["confidence"] = 0.65
            detected.append(p)

    return detected


# ── 4. Entity threat scoring ──────────────────────────────────────────────────

def score_entities(logs: list[dict]) -> dict[str, Any]:
    ip_scores:   defaultdict[str, int] = defaultdict(int)
    user_scores: defaultdict[str, int] = defaultdict(int)

    for log in logs:
        ip   = log.get("ip") or log.get("src_ip", "")
        user = log.get("user") or log.get("username", "")
        status = str(log.get("status", "")).lower()
        event  = str(log.get("event",  "")).lower()

        if status == "failed":
            ip_scores[ip]     += 10
            user_scores[user] += 5
        if any(kw in event for kw in ("admin", "root", "sudo", "privilege")):
            ip_scores[ip]     += 15
            user_scores[user] += 20
        if any(kw in event for kw in ("scan", "probe", "enum")):
            ip_scores[ip]     += 8
        if any(kw in event for kw in ("upload", "transfer", "exfil")):
            ip_scores[ip]     += 12
            user_scores[user] += 12

    def label(score: int) -> str:
        return "HIGH" if score >= 30 else "MEDIUM" if score >= 15 else "LOW"

    ip_threats = [
        {"entity": ip, "type": "ip", "score": s, "level": label(s)}
        for ip, s in sorted(ip_scores.items(), key=lambda x: -x[1]) if ip
    ]
    user_threats = [
        {"entity": u, "type": "user", "score": s, "level": label(s)}
        for u, s in sorted(user_scores.items(), key=lambda x: -x[1]) if u
    ]

    return {"ip_threats": ip_threats[:10], "user_threats": user_threats[:10]}


# ── 5. Correlation engine ─────────────────────────────────────────────────────

def correlate_events(logs: list[dict], window_minutes: int = 10) -> list[dict[str, Any]]:
    """Group events that occur within a time window from the same IP or user."""
    events_with_ts = []
    for log in logs:
        ts = _safe_dt(log.get("timestamp") or log.get("time") or log.get("ts"))
        if ts:
            events_with_ts.append({"ts": ts, "log": log})

    events_with_ts.sort(key=lambda x: x["ts"])
    window = timedelta(minutes=window_minutes)
    clusters = []
    used = set()

    for i, ev in enumerate(events_with_ts):
        if i in used:
            continue
        cluster = [ev["log"]]
        used.add(i)
        ip_i   = ev["log"].get("ip") or ev["log"].get("src_ip", "")
        user_i = ev["log"].get("user") or ev["log"].get("username", "")

        for j, ev2 in enumerate(events_with_ts[i + 1:], start=i + 1):
            if j in used:
                continue
            if ev2["ts"] - ev["ts"] > window:
                break
            ip_j   = ev2["log"].get("ip") or ev2["log"].get("src_ip", "")
            user_j = ev2["log"].get("user") or ev2["log"].get("username", "")
            if (ip_i and ip_i == ip_j) or (user_i and user_i == user_j):
                cluster.append(ev2["log"])
                used.add(j)

        if len(cluster) > 1:
            clusters.append({
                "event_count": len(cluster),
                "window_minutes": window_minutes,
                "anchor_time": ev["ts"].isoformat(),
                "common_ip":   ip_i or None,
                "common_user": user_i or None,
                "events": cluster[:10],
            })

    return clusters[:20]


# ── 6. Investigation assistant ────────────────────────────────────────────────

def investigation_assistant(question: str, context: dict) -> str:
    """Rule-based Q&A assistant using analysis context."""
    q = question.lower().strip()
    insights    = context.get("insights", [])
    risk_level  = context.get("risk_level", "UNKNOWN")
    risk_score  = context.get("risk_score", 0)
    patterns    = context.get("attack_patterns", [])
    entities    = context.get("entities", {})
    threats     = context.get("entity_threats", {})
    timeline    = context.get("timeline", {})

    pattern_labels = [p.get("label", "") for p in patterns]
    high_ips   = [t["entity"] for t in threats.get("ip_threats",   []) if t["level"] == "HIGH"]
    high_users = [t["entity"] for t in threats.get("user_threats", []) if t["level"] == "HIGH"]

    # Risk questions
    if any(kw in q for kw in ("risk", "danger", "threat level", "severity")):
        return (
            f"The overall risk level is **{risk_level}** with a score of **{risk_score}/100**. "
            + (f"Key concerns: {'; '.join(insights)}" if insights else "No major anomalies detected.")
        )

    # Attack type questions
    if any(kw in q for kw in ("attack", "pattern", "type", "what happened", "incident")):
        if pattern_labels:
            return f"Detected attack patterns: **{', '.join(pattern_labels)}**. " + \
                   " | ".join(f"{p['label']}: {p.get('evidence','')}" for p in patterns)
        return "No specific attack patterns were detected in the current log data."

    # Suspect / entity questions
    if any(kw in q for kw in ("suspect", "who", "user", "account", "responsible")):
        parts = []
        if high_users:
            parts.append(f"High-threat users: **{', '.join(high_users)}**")
        if high_ips:
            parts.append(f"High-threat IPs: **{', '.join(high_ips)}**")
        if parts:
            return " | ".join(parts)
        return "No high-threat users or IPs identified. Review medium-threat entities for further investigation."

    # IP questions
    if any(kw in q for kw in ("ip", "address", "source", "origin")):
        ips = entities.get("ips", [])
        ext = entities.get("external_ips", [])
        return (
            f"Found **{len(ips)}** unique IPs ({len(ext)} external). "
            + (f"External IPs: {', '.join(ext[:5])}" if ext else "No external IPs detected.")
        )

    # Timeline questions
    if any(kw in q for kw in ("when", "timeline", "time", "first", "last", "sequence")):
        first = timeline.get("first_event")
        last  = timeline.get("last_event")
        gaps  = timeline.get("gaps", [])
        resp  = f"Activity spans from **{first}** to **{last}**." if first else "No timestamped events found."
        if gaps:
            resp += f" {len(gaps)} suspicious time gap(s) detected."
        return resp

    # Recommendation questions
    if any(kw in q for kw in ("recommend", "next step", "action", "what should", "do next")):
        steps = []
        if risk_level == "HIGH":
            steps.append("Immediately isolate affected systems.")
        if "Brute Force Attack" in pattern_labels:
            steps.append("Block source IPs and enforce account lockout policies.")
        if "Lateral Movement" in pattern_labels:
            steps.append("Audit all internal access and revoke unnecessary permissions.")
        if "Data Exfiltration" in pattern_labels:
            steps.append("Review outbound traffic and check for data loss.")
        if "Privilege Escalation" in pattern_labels:
            steps.append("Audit privileged accounts and review sudo/admin logs.")
        if not steps:
            steps.append("Continue monitoring. No immediate action required.")
        return "Recommended actions: " + " | ".join(steps)

    # MITRE questions
    if any(kw in q for kw in ("mitre", "att&ck", "technique", "tactic")):
        if patterns:
            return "MITRE ATT&CK techniques: " + ", ".join(
                f"{p['label']} ({p.get('mitre', 'N/A')})" for p in patterns
            )
        return "No MITRE ATT&CK techniques mapped for current findings."

    return (
        "I can answer questions about: risk level, attack patterns, suspects, IPs, "
        "timeline, recommendations, and MITRE ATT&CK techniques. Please rephrase your question."
    )


# ── Master investigation function ─────────────────────────────────────────────

def investigate(data: dict) -> dict[str, Any]:
    logs     = data.get("logs", [])
    question = data.get("question", "")

    if not logs:
        return {"error": "No logs provided for investigation"}

    timeline    = build_timeline(logs)
    entities    = extract_entities(logs)
    patterns    = classify_attack_patterns(logs)
    threats     = score_entities(logs)
    correlations = correlate_events(logs)

    # Base risk from analyzer
    from services.analyzer import analyze_logs
    base = analyze_logs({"logs": logs})

    context = {
        "insights":       base.get("insights", []),
        "risk_level":     base.get("risk_level", "LOW"),
        "risk_score":     base.get("risk_score", 0),
        "attack_patterns": patterns,
        "entities":       entities,
        "entity_threats": threats,
        "timeline":       timeline,
    }

    answer = investigation_assistant(question, context) if question else None

    return {
        "risk_score":     base.get("risk_score"),
        "risk_level":     base.get("risk_level"),
        "insights":       base.get("insights"),
        "timeline":       timeline,
        "entities":       entities,
        "attack_patterns": patterns,
        "entity_threats": threats,
        "correlations":   correlations,
        "accuracy":       base.get("accuracy"),
        "assistant_answer": answer,
        "analyzed_at":    datetime.utcnow().isoformat(),
    }
