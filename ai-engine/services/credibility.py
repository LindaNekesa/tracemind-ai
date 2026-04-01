"""
Case Credibility Engine
Scores each case 0–100 for trustworthiness and flags suspicious patterns.
Verdict: TRUSTED | SUSPICIOUS | FALSE_POSITIVE | INCONCLUSIVE
"""
import re
import math
from datetime import datetime
from typing import Any


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


# ── scoring rules ─────────────────────────────────────────────────────────────

def _score_log_quality(logs: list[dict]) -> dict[str, Any]:
    """Are the logs real and consistent?"""
    if not logs:
        return {"score": 0, "max": 25, "flag": "NO_LOGS",
                "detail": "No log data provided. Cannot verify incident."}

    issues = []
    score = 25

    # Check for required fields
    has_timestamp = sum(1 for l in logs if l.get("timestamp") or l.get("time") or l.get("ts"))
    has_ip        = sum(1 for l in logs if l.get("ip") or l.get("src_ip"))
    has_user      = sum(1 for l in logs if l.get("user") or l.get("username"))
    has_event     = sum(1 for l in logs if l.get("event") or l.get("action") or l.get("status"))

    ratio_ts   = has_timestamp / len(logs)
    ratio_ip   = has_ip / len(logs)
    ratio_user = has_user / len(logs)
    ratio_evt  = has_event / len(logs)

    if ratio_ts < 0.5:
        score -= 8
        issues.append("Less than 50% of logs have timestamps.")
    if ratio_ip < 0.3:
        score -= 5
        issues.append("Most logs missing IP addresses.")
    if ratio_user < 0.3:
        score -= 4
        issues.append("Most logs missing user identifiers.")
    if ratio_evt < 0.5:
        score -= 5
        issues.append("Most logs missing event/action fields.")

    # Check for suspiciously uniform logs (copy-paste fabrication)
    unique_entries = len(set(str(l) for l in logs))
    if len(logs) > 3 and unique_entries / len(logs) < 0.3:
        score -= 10
        issues.append("Logs appear highly repetitive — possible fabrication.")

    # Check for future timestamps
    future_count = 0
    now = datetime.utcnow()
    for l in logs:
        ts = _safe_dt(l.get("timestamp") or l.get("time") or l.get("ts"))
        if ts and ts > now:
            future_count += 1
    if future_count > 0:
        score -= 8
        issues.append(f"{future_count} log(s) have future timestamps — likely fabricated.")

    flag = "LOG_QUALITY_OK" if score >= 20 else "LOG_QUALITY_POOR"
    return {
        "score": max(score, 0), "max": 25,
        "flag": flag,
        "detail": "; ".join(issues) if issues else "Log structure looks consistent.",
        "stats": {
            "total_logs": len(logs),
            "with_timestamp": has_timestamp,
            "with_ip": has_ip,
            "with_user": has_user,
            "unique_entries": unique_entries,
        }
    }


def _score_description_quality(title: str, description: str) -> dict[str, Any]:
    """Is the case description substantive and specific?"""
    score = 20
    issues = []

    title = title.strip()
    description = description.strip()

    # Title checks
    if len(title) < 10:
        score -= 5
        issues.append("Title is too short or vague.")
    if re.match(r"^(test|fake|sample|demo|untitled|case \d+)$", title.lower()):
        score -= 10
        issues.append(f"Title '{title}' looks like a test/placeholder.")

    # Description checks
    word_count = len(description.split())
    if word_count < 10:
        score -= 8
        issues.append("Description is too brief (under 10 words).")
    elif word_count < 25:
        score -= 3
        issues.append("Description could be more detailed.")

    # Check for generic/template descriptions
    generic_phrases = ["test case", "sample incident", "lorem ipsum", "placeholder",
                       "n/a", "tbd", "todo", "fill in", "description here"]
    desc_lower = description.lower()
    for phrase in generic_phrases:
        if phrase in desc_lower:
            score -= 8
            issues.append(f"Description contains generic placeholder text: '{phrase}'.")
            break

    # Specificity bonus — contains technical terms
    technical_terms = ["ip", "port", "malware", "phishing", "ransomware", "exploit",
                       "vulnerability", "attack", "breach", "unauthorized", "credential",
                       "network", "server", "database", "firewall", "endpoint"]
    found_terms = [t for t in technical_terms if t in desc_lower]
    if len(found_terms) >= 2:
        score = min(score + 3, 20)  # small bonus for technical specificity

    flag = "DESCRIPTION_OK" if score >= 15 else "DESCRIPTION_WEAK"
    return {
        "score": max(score, 0), "max": 20,
        "flag": flag,
        "detail": "; ".join(issues) if issues else "Description appears substantive.",
        "word_count": word_count,
        "technical_terms_found": found_terms,
    }


def _score_evidence_presence(evidence_count: int, analysis_count: int) -> dict[str, Any]:
    """Is there supporting evidence and analysis?"""
    score = 0
    details = []

    if evidence_count > 0:
        score += min(evidence_count * 5, 15)
        details.append(f"{evidence_count} evidence file(s) attached.")
    else:
        details.append("No evidence files uploaded.")

    if analysis_count > 0:
        score += min(analysis_count * 5, 10)
        details.append(f"{analysis_count} AI analysis result(s) on record.")
    else:
        details.append("No AI analysis has been run.")

    flag = "EVIDENCE_PRESENT" if score >= 10 else "EVIDENCE_MISSING"
    return {
        "score": min(score, 25), "max": 25,
        "flag": flag,
        "detail": " ".join(details),
    }


def _score_metadata_coherence(case: dict) -> dict[str, Any]:
    """Do the case fields make logical sense together?"""
    score = 15
    issues = []

    priority = case.get("priority", "").upper()
    status   = case.get("status",   "").upper()
    case_type = case.get("type",    "").lower()
    logs     = case.get("logs", [])

    # HIGH/CRITICAL priority with no logs is suspicious
    if priority in ("HIGH", "CRITICAL") and not logs:
        score -= 8
        issues.append(f"{priority} priority case has no supporting logs.")

    # CLOSED case with no analysis is suspicious
    if status == "CLOSED" and case.get("analysis_count", 0) == 0:
        score -= 5
        issues.append("Case is closed but no AI analysis was performed.")

    # Type vs log content coherence
    if case_type == "phishing" and logs:
        log_str = str(logs).lower()
        if not any(kw in log_str for kw in ("email", "phish", "link", "url", "click", "smtp")):
            score -= 3
            issues.append("Phishing case but logs contain no email/URL indicators.")

    if case_type in ("malware", "ransomware") and logs:
        log_str = str(logs).lower()
        if not any(kw in log_str for kw in ("file", "process", "exec", "dll", "registry", "encrypt")):
            score -= 3
            issues.append("Malware case but logs contain no file/process indicators.")

    flag = "METADATA_COHERENT" if score >= 12 else "METADATA_INCONSISTENT"
    return {
        "score": max(score, 0), "max": 15,
        "flag": flag,
        "detail": "; ".join(issues) if issues else "Case metadata is internally consistent.",
    }


def _score_log_anomaly_alignment(logs: list[dict], risk_score: int) -> dict[str, Any]:
    """Does the AI risk score align with what the logs actually show?"""
    if not logs:
        return {"score": 5, "max": 15, "flag": "NO_LOGS_TO_ALIGN",
                "detail": "Cannot verify alignment without logs."}

    score = 15
    issues = []

    # If risk is HIGH but logs are minimal
    if risk_score >= 70 and len(logs) < 3:
        score -= 8
        issues.append("High risk score but very few log entries to support it.")

    # If risk is LOW but many failed attempts exist
    failed = sum(1 for l in logs if str(l.get("status", "")).lower() == "failed")
    if risk_score < 30 and failed > 10:
        score -= 5
        issues.append(f"Low risk score but {failed} failed attempts detected — possible miscalculation.")

    # Consistent IPs across logs (real incidents tend to have focused sources)
    ips = [l.get("ip") or l.get("src_ip") for l in logs if l.get("ip") or l.get("src_ip")]
    if ips:
        unique_ips = len(set(ips))
        if unique_ips == len(ips) and len(ips) > 5:
            score -= 3
            issues.append("Every log entry has a unique IP — unusual for real attacks.")

    flag = "ALIGNED" if score >= 12 else "MISALIGNED"
    return {
        "score": max(score, 0), "max": 15,
        "flag": flag,
        "detail": "; ".join(issues) if issues else "Log data aligns with risk assessment.",
    }


# ── master credibility function ───────────────────────────────────────────────

def assess_credibility(case: dict, evidence_count: int = 0, analysis_count: int = 0, risk_score: int = 0) -> dict[str, Any]:
    logs        = case.get("logs", []) if isinstance(case.get("logs"), list) else []
    title       = case.get("title", "")
    description = case.get("description", "")

    case["analysis_count"] = analysis_count

    r_log   = _score_log_quality(logs)
    r_desc  = _score_description_quality(title, description)
    r_evid  = _score_evidence_presence(evidence_count, analysis_count)
    r_meta  = _score_metadata_coherence(case)
    r_align = _score_log_anomaly_alignment(logs, risk_score)

    total = r_log["score"] + r_desc["score"] + r_evid["score"] + r_meta["score"] + r_align["score"]
    max_score = 100

    # Verdict
    if total >= 75:
        verdict = "TRUSTED"
        verdict_color = "green"
        summary = "This case appears credible and well-supported by evidence."
    elif total >= 50:
        verdict = "INCONCLUSIVE"
        verdict_color = "yellow"
        summary = "Case has some supporting evidence but gaps remain. Further review recommended."
    elif total >= 30:
        verdict = "SUSPICIOUS"
        verdict_color = "orange"
        summary = "Multiple credibility issues detected. This case may be exaggerated or incomplete."
    else:
        verdict = "FALSE_POSITIVE"
        verdict_color = "red"
        summary = "Case shows strong indicators of being fabricated, a test entry, or a false report."

    # Collect all flags
    flags = [r["flag"] for r in [r_log, r_desc, r_evid, r_meta, r_align]
             if "OK" not in r["flag"] and "PRESENT" not in r["flag"]
             and "COHERENT" not in r["flag"] and "ALIGNED" not in r["flag"]]

    return {
        "credibility_score": total,
        "max_score": max_score,
        "verdict": verdict,
        "verdict_color": verdict_color,
        "summary": summary,
        "flags": flags,
        "breakdown": {
            "log_quality":        r_log,
            "description_quality": r_desc,
            "evidence_presence":  r_evid,
            "metadata_coherence": r_meta,
            "anomaly_alignment":  r_align,
        },
        "assessed_at": datetime.utcnow().isoformat(),
    }
