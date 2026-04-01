import pandas as pd
from datetime import datetime
from typing import Any


def _rule_confidence(triggered: bool, support: int, max_support: int) -> float:
    """Confidence for a single rule: 0.0 – 1.0."""
    if not triggered:
        return 0.0
    return round(min(support / max(max_support, 1), 1.0), 4)


def compute_accuracy_metrics(
    total: int,
    failed: int,
    suspicious_ip_count: int,
    unique_users: int,
) -> dict[str, Any]:
    """
    Rule-based accuracy metrics.
    Each detection rule gets a precision/recall/F1 estimate based on
    how strongly the evidence supports it.
    """
    rules: list[dict[str, Any]] = []

    # Rule 1: Brute-force / failed login detection
    bf_precision = round(min(failed / max(total, 1) * 2, 1.0), 4)
    bf_recall    = round(min(failed / max(total * 0.1, 1), 1.0), 4)
    bf_f1        = _f1(bf_precision, bf_recall)
    rules.append({
        "rule": "Brute-force Detection",
        "triggered": failed > 0,
        "precision": bf_precision,
        "recall": bf_recall,
        "f1": bf_f1,
        "confidence": _rule_confidence(failed > 0, failed, total),
    })

    # Rule 2: Suspicious IP frequency
    ip_precision = round(min(suspicious_ip_count / max(total * 0.05, 1), 1.0), 4)
    ip_recall    = round(min(suspicious_ip_count / max(total * 0.02, 1), 1.0), 4)
    ip_f1        = _f1(ip_precision, ip_recall)
    rules.append({
        "rule": "Suspicious IP Detection",
        "triggered": suspicious_ip_count > 0,
        "precision": ip_precision,
        "recall": ip_recall,
        "f1": ip_f1,
        "confidence": _rule_confidence(suspicious_ip_count > 0, suspicious_ip_count, 10),
    })

    # Rule 3: Insider threat (many unique users)
    it_triggered = unique_users > 10
    it_precision = round(min(unique_users / 50, 1.0), 4) if it_triggered else 0.0
    it_recall    = round(min(unique_users / 20, 1.0), 4) if it_triggered else 0.0
    it_f1        = _f1(it_precision, it_recall)
    rules.append({
        "rule": "Insider Threat Detection",
        "triggered": it_triggered,
        "precision": it_precision,
        "recall": it_recall,
        "f1": it_f1,
        "confidence": _rule_confidence(it_triggered, unique_users, 50),
    })

    triggered_rules = [r for r in rules if r["triggered"]]
    if triggered_rules:
        overall_precision = round(sum(r["precision"] for r in triggered_rules) / len(triggered_rules), 4)
        overall_recall    = round(sum(r["recall"]    for r in triggered_rules) / len(triggered_rules), 4)
        overall_f1        = _f1(overall_precision, overall_recall)
        overall_confidence = round(sum(r["confidence"] for r in triggered_rules) / len(triggered_rules), 4)
    else:
        overall_precision = overall_recall = overall_f1 = overall_confidence = 0.0

    return {
        "overall_precision": overall_precision,
        "overall_recall": overall_recall,
        "overall_f1": overall_f1,
        "overall_confidence": overall_confidence,
        "rules": rules,
    }


def _f1(precision: float, recall: float) -> float:
    if precision + recall == 0:
        return 0.0
    return round(2 * precision * recall / (precision + recall), 4)


def analyze_logs(data: dict) -> dict[str, Any]:
    logs = data.get("logs", [])

    if not logs:
        return {"error": "No logs provided"}

    df = pd.DataFrame(logs)
    df.columns = [c.lower() for c in df.columns]

    results: dict[str, Any] = {
        "total_logs": len(df),
        "analyzed_at": datetime.utcnow().isoformat(),
    }

    # Failed login detection
    if "status" in df.columns:
        failed = df[df["status"].str.lower() == "failed"]
        results["failed_attempts"] = len(failed)
        results["failed_logs"] = failed.to_dict(orient="records")
    else:
        results["failed_attempts"] = 0
        results["failed_logs"] = []

    # Suspicious IP detection
    if "ip" in df.columns:
        ip_counts = df["ip"].value_counts()
        suspicious_ips = ip_counts[ip_counts > 5].index.tolist()
        results["suspicious_ips"] = suspicious_ips
    else:
        results["suspicious_ips"] = []

    # Unique users
    if "user" in df.columns:
        results["unique_users"] = int(df["user"].nunique())
        results["users"] = df["user"].unique().tolist()
    else:
        results["unique_users"] = 0
        results["users"] = []

    # Risk score
    risk = 0
    risk += min(results["failed_attempts"] * 5, 50)
    risk += min(len(results["suspicious_ips"]) * 10, 30)
    risk += 20 if results["unique_users"] > 10 else 0
    results["risk_score"] = min(risk, 100)
    results["risk_level"] = (
        "HIGH" if results["risk_score"] >= 70
        else "MEDIUM" if results["risk_score"] >= 40
        else "LOW"
    )

    # Insights
    insights = []
    if results["failed_attempts"] > 0:
        insights.append(f"{results['failed_attempts']} failed login attempt(s) detected.")
    if results["suspicious_ips"]:
        insights.append(f"Suspicious IPs: {', '.join(results['suspicious_ips'])}.")
    if not insights:
        insights.append("No significant anomalies detected.")
    results["insights"] = insights

    # Accuracy metrics
    results["accuracy"] = compute_accuracy_metrics(
        total=results["total_logs"],
        failed=results["failed_attempts"],
        suspicious_ip_count=len(results["suspicious_ips"]),
        unique_users=results["unique_users"],
    )

    return results
