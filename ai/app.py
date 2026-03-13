
from flask import Flask, request, jsonify
import hashlib
from datetime import datetime

app = Flask(__name__)

def score_case(payload):
    flags = []
    score = 0.10

    delay_days = payload.get("delay_days", 0) or 0
    if delay_days > 30:
        flags.append("Unusual delay > 30 days")
        score += 0.25

    evidence_count = payload.get("evidence_count", 0) or 0
    if evidence_count == 0:
        flags.append("No evidence attached")
        score += 0.30

    reassignments = payload.get("reassignments", 0) or 0
    if reassignments >= 3:
        flags.append("High reassignment frequency")
        score += 0.25

    score = min(0.99, score)
    return score, flags

@app.route("/health", methods=["GET"])
def health():
    return "OK"

@app.route("/analyze", methods=["POST"])
def analyze():
    payload = request.get_json(force=True) or {}
    score, flags = score_case(payload)

    explanation = []
    for f in flags:
        if "delay" in f.lower():
            explanation.append("Long delays can indicate workflow issues or interference.")
        if "evidence" in f.lower():
            explanation.append("Cases without evidence are high-risk for integrity and prosecution.")
        if "reassignment" in f.lower():
            explanation.append("Frequent reassignment may indicate dispute, corruption risk, or mismanagement.")

    return jsonify({
        "case_id": payload.get("case_id"),
        "risk_score": score,
        "flags": flags,
        "explanation": explanation,
        "analyzed_at": datetime.utcnow().isoformat() + "Z"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
