# phishguard-app-backup
AI-Powered Phishing Email and SMS Detector for Senior Citizens
# 🛡️ PhishGuard
### AI-Powered Phishing Email and SMS Detector for Senior Citizens



![Problem Statement](https://img.shields.io/badge/PS--27-Mind2i%20Hackathon-blue)




![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20Groq%20AI-purple)




![Status](https://img.shields.io/badge/Status-Working%20Prototype-green)



---

## 🎯 Problem Statement

Cyber fraud targeting senior citizens costs India over 
**₹11,000 crore annually**. KYC update scams, fake account 
suspension notices, and lottery fraud all follow recognizable 
patterns — but senior citizens are rarely equipped to identify 
them before it is too late.

**PS-27 | Mind2i Hackathon | Difficulty: Medium**

---

## 💡 Our Solution

PhishGuard is an AI-powered scam detector that:

- Scans any SMS or email message in real time
- Displays a bold warning banner explaining in plain language
  exactly why it looks like a scam
- Has a one-button **"I Am Not Sure About This"** interface
  for seniors to ask AI to review any message
- Automatically alerts a nominated family member when a
  suspicious link is detected
- Supports **Hindi and English** explanations
- Has **voice readout** of AI explanation
- Senior-friendly large button UI

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 AI Explanation | Groq AI explains why message is dangerous in simple words |
| 🚨 Real-time Detection | Instant scam pattern detection |
| 📱 SMS Inbox Simulation | Shows auto-scanned inbox with SCAM/SAFE badges |
| 🔊 Voice Readout | Reads AI explanation aloud in Hindi or English |
| 📞 Family Alert | Sends WhatsApp alert when suspicious link detected |
| 🇮🇳 Hindi Support | Full Hindi language AI explanations |
| 🔗 Link Detection | Detects and highlights suspicious links |
| 👴 Senior Friendly | Large fonts, big buttons, simple UI |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | FastAPI (Python) |
| AI Model | Groq API (Llama 3) |
| Styling | CSS-in-JS |
| Notifications | WhatsApp Web API |
| Voice | Web Speech API |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API Key (free at console.groq.com)

### Backend Setup

```bash
# Go to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install packages
pip install fastapi uvicorn python-dotenv groq

# Create .env file
echo PORT=8000 > .env
echo GROQ_API_KEY=your_key_here >> .env

# Run backend
uvicorn main:app --reload
