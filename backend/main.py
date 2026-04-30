from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="PhishGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageInput(BaseModel):
    text: str
    lang: str = "en"

SCAM_PATTERNS = [
    {"pattern": r"kyc", "flag": "KYC Scam", "weight": 3},
    {"pattern": r"account.{0,15}(suspend|block|expir)", "flag": "Account Threat", "weight": 3},
    {"pattern": r"\botp\b", "flag": "OTP Request", "weight": 2},
    {"pattern": r"(lottery|winner|won|prize)", "flag": "Lottery Fraud", "weight": 3},
    {"pattern": r"(click here|tap here|visit now)", "flag": "Suspicious Link", "weight": 2},
    {"pattern": r"(urgent|immediately|24 hours|limited time)", "flag": "Urgency Tactic", "weight": 2},
    {"pattern": r"(aadhar|pan card|bank account details)", "flag": "Personal Data Request", "weight": 3},
    {"pattern": r"bit\.ly|tinyurl", "flag": "Shortened URL", "weight": 2},
    {"pattern": r"income.tax.refund", "flag": "Tax Refund Scam", "weight": 3},
    {"pattern": r"(share|send|enter).{0,20}(otp|password|pin|cvv)", "flag": "Credential Theft", "weight": 3},
]

def analyse_patterns(text: str):
    text_lower = text.lower()
    score = 0
    triggered = []
    for item in SCAM_PATTERNS:
        if re.search(item["pattern"], text_lower):
            score += item["weight"]
            triggered.append(item["flag"])
    ratio = min(score / 12, 1.0)
    if ratio >= 0.45:
        level = "danger"
    elif ratio >= 0.2:
        level = "medium"
    else:
        level = "safe"
    return level, ratio, triggered

def get_ai_explanation(text, level, flags, lang):
    try:
        lang_note = (
            "Reply ONLY in simple Hindi Devanagari script. Use words a 65 year old Indian understands."
            if lang == "hi"
            else "Reply in simple English. Like explaining to a 65 year old grandparent. No jargon."
        )

        level_map = {
            "danger": "This is a SCAM message.",
            "medium": "This message is suspicious.",
            "safe": "This message appears safe."
        }

        prompt = f"""You help senior citizens in India stay safe from scams.

Message received: "{text[:400]}"
Result: {level_map[level]}
Flags found: {', '.join(flags) if flags else 'none'}

{lang_note}
Write 2-3 short sentences:
1. Is it safe or dangerous?
2. What trick is the scammer using if scam?
3. What should the person do right now?
Be warm and caring like a trusted family member."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"AI explanation unavailable: {str(e)}"

@app.get("/")
def home():
    return {"status": "PhishGuard API Running"}

@app.post("/api/scan")
async def scan_message(data: MessageInput):
    level, ratio, triggered = analyse_patterns(data.text)
    explanation = get_ai_explanation(
        data.text, level, triggered, data.lang
    )
    return {
        "risk_level": level,
        "risk_score": round(ratio * 100),
        "triggered_flags": triggered,
        "explanation": explanation,
        "lang": data.lang
    }