import os
from datetime import datetime

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)


def read_env(name: str, fallback: str = "") -> str:
    direct = os.getenv(name, "").strip()
    if direct:
        return direct

    file_path = os.getenv(f"{name}_FILE", "").strip()
    if file_path:
        with open(file_path, "r", encoding="utf-8") as handle:
            return handle.read().strip()

    return fallback


HF_MODEL_ID = read_env("HF_MODEL_ID", "google/flan-t5-base")
HF_API_TOKEN = read_env("HF_API_TOKEN", "")
HF_API_URL = read_env("HF_API_URL", f"https://api-inference.huggingface.co/models/{HF_MODEL_ID}")


def summarize_items(items):
    values = [str(item).strip() for item in (items or []) if str(item).strip()]
    if not values:
        return "No structured facts were supplied."
    return " ".join(f"- {item}" for item in values[:12])


def build_prompt(payload):
    articles = payload.get("constitutional_articles") or []
    article_text = " ".join(
        f"{item.get('section', '')} {item.get('title', '')}: {item.get('principle', '')}. Relevance: {item.get('relevance', '')}."
        for item in articles[:8]
    )
    facts_text = summarize_items(payload.get("facts") or [])

    return (
        "You are a judicial decision-support model for Lesotho. "
        "You must not replace the judge. Produce a cautious, non-binding recommendation grounded in the Constitution of Lesotho. "
        "State fair-trial and defence-participation concerns first. Then state whether the matter appears ready for ruling, should be adjourned, "
        "or needs more evidence or submissions. Use plain English.\n\n"
        f"Case number: {payload.get('case_number', '')}\n"
        f"Charge: {payload.get('charge', '')}\n"
        f"Status: {payload.get('status', '')}\n"
        f"Defence summary: {payload.get('defense_summary', '') or 'Not supplied.'}\n"
        f"Prosecution summary: {payload.get('prosecution_summary', '') or 'Not supplied.'}\n"
        f"Requested relief: {payload.get('requested_relief', '') or 'Not supplied.'}\n"
        f"Judge question: {payload.get('judge_question', '') or 'Not supplied.'}\n"
        f"Facts: {facts_text}\n"
        f"Constitutional anchors: {article_text}\n"
    )


def local_fallback(payload):
    defense = str(payload.get("defense_summary", "")).strip()
    prosecution = str(payload.get("prosecution_summary", "")).strip()
    requested_relief = str(payload.get("requested_relief", "")).strip()

    concerns = []
    if not defense:
        concerns.append("The defence position is missing, so Section 12 fair-trial safeguards suggest caution before a final ruling.")
    if not prosecution:
        concerns.append("The prosecution basis is not fully summarized, so the evidential foundation should be confirmed on the record.")
    if "bail" in requested_relief.lower():
        concerns.append("Any bail or remand outcome should be checked against Section 6 liberty protections and the effect of delay.")

    posture = (
        "The matter appears better suited to an adjournment, reserved ruling, or targeted supplementary submissions."
        if concerns
        else "On the supplied summary, the matter may be ready for a reasoned ruling if the evidence on record supports the requested order."
    )

    return (
        "Local constitutional fallback analysis was used. "
        + posture
        + " "
        + " ".join(concerns)
        + " The judge should expressly address constitutional supremacy, presumption of innocence, defence participation, and equality before the law."
    ).strip()


def call_hugging_face(prompt):
    if not HF_API_TOKEN:
        return None

    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}",
        "Content-Type": "application/json",
    }
    body = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 300,
            "return_full_text": False,
            "temperature": 0.2,
        },
        "options": {
            "wait_for_model": True,
        },
    }

    response = requests.post(HF_API_URL, headers=headers, json=body, timeout=45)
    response.raise_for_status()
    data = response.json()

    if isinstance(data, list) and data:
        first = data[0]
        if isinstance(first, dict):
            generated = first.get("generated_text")
            if isinstance(generated, str) and generated.strip():
                return generated.strip()
    if isinstance(data, dict):
        generated = data.get("generated_text")
        if isinstance(generated, str) and generated.strip():
            return generated.strip()
    return None


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "ok": True,
            "service": "judge-ai",
            "model_id": HF_MODEL_ID,
            "huggingface_configured": bool(HF_API_TOKEN),
            "time": datetime.utcnow().isoformat() + "Z",
        }
    )


@app.route("/analyze", methods=["POST"])
def analyze():
    payload = request.get_json(force=True) or {}
    facts = payload.get("facts") or []
    risk_score = 0.1
    flags = []

    if len(facts) < 4:
        flags.append("Sparse fact record")
        risk_score += 0.2
    if not payload.get("defense_summary"):
        flags.append("No defence summary supplied")
        risk_score += 0.25
    if not payload.get("prosecution_summary"):
        flags.append("No prosecution summary supplied")
        risk_score += 0.15

    return jsonify(
        {
            "case_id": payload.get("case_id"),
            "risk_score": min(0.99, risk_score),
            "flags": flags,
            "analyzed_at": datetime.utcnow().isoformat() + "Z",
        }
    )


@app.route("/judge-support", methods=["POST"])
def judge_support():
    payload = request.get_json(force=True) or {}
    prompt = build_prompt(payload)
    mode = "local-fallback"
    analysis_text = local_fallback(payload)

    try:
        hf_text = call_hugging_face(prompt)
        if hf_text:
            mode = "huggingface"
            analysis_text = hf_text
    except Exception as error:
        analysis_text = f"{analysis_text} Hugging Face inference was unavailable, so the service returned the local fallback. Error: {error}"

    return jsonify(
        {
            "case_id": payload.get("case_id"),
            "mode": mode,
            "model_id": HF_MODEL_ID if mode == "huggingface" else None,
            "analysis_text": analysis_text,
            "generated_at": datetime.utcnow().isoformat() + "Z",
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
