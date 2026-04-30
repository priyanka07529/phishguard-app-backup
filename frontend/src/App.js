import { useState } from "react";
import axios from "axios";
import "./App.css";

const FAMILY_PHONE = "919876543210"; // Change to real family number

const EXAMPLES = {
  kyc: "URGENT: Dear Customer, Your SBI account KYC has expired. Your account will be blocked in 24 hours. Click here to update: bit.ly/sbi-kyc and enter your Aadhar and PAN details immediately.",
  lottery: "Congratulations! You won Rs 25,00,000 in Government lottery. Call 9876543210 and share your bank account details to claim prize money.",
  safe: "Hi, this is Priya from your daughter school. Parent teacher meeting is on Saturday 10am. Please confirm attendance.",
  otp: "Your OTP for HDFC Bank transaction of Rs 15,000 is 847362. NEVER share this OTP with anyone including bank officials."
};

const mockMessages = [
  {
    id: 1,
    from: "SBI Bank Alert",
    preview: "URGENT: Your KYC has expired...",
    full: "URGENT: Dear Customer, Your SBI account KYC has expired. Click here: bit.ly/sbi-kyc",
    time: "10:23 AM",
    scanned: "danger"
  },
  {
    id: 2,
    from: "Mom",
    preview: "Hi beta, are you coming home...",
    full: "Hi beta, are you coming home for dinner today? Let me know.",
    time: "11:45 AM",
    scanned: "safe"
  },
  {
    id: 3,
    from: "HDFC Bank",
    preview: "Congratulations! You won Rs 25 lakhs...",
    full: "Congratulations! You won Rs 25,00,000 in lottery. Call 9876543210 to claim.",
    time: "12:10 PM",
    scanned: "danger"
  },
  {
    id: 4,
    from: "Priya School",
    preview: "Parent teacher meeting Saturday...",
    full: "Parent teacher meeting is on Saturday 10am. Please confirm attendance.",
    time: "1:30 PM",
    scanned: "safe"
  }
];

export default function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("scanner");
  const [speaking, setSpeaking] = useState(false);

  const scanMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);
    setAiText("");
    try {
      const res = await axios.post(
        "http://localhost:8000/api/scan",
        { text: message, lang }
      );
      setResult(res.data);
      typeText(res.data.explanation, setAiText);
    } catch (err) {
      alert("Error! Is backend running?");
    }
    setLoading(false);
  };

  function typeText(text, setter) {
    let i = 0;
    setter("");
    const timer = setInterval(() => {
      if (i < text.length) {
        setter(prev => prev + text[i]);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 15);
  }

  const speakText = (text) => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.85;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const sendFamilyAlert = (suspiciousLink) => {
    const alertMsg = `🚨 PHISHGUARD ALERT!

Your family member received a suspicious message.

🔗 Suspicious Link: ${suspiciousLink}

This may be a SCAM. Please check on them immediately.

Sent by PhishGuard 🛡️`;

    const whatsappURL = `https://wa.me/${FAMILY_PHONE}?text=${encodeURIComponent(alertMsg)}`;
    alert("🚨 Suspicious link detected!\nSending alert to your family member...");
    window.open(whatsappURL, "_blank");
  };

  const getLinks = (text) => {
    const matches = text.match(
      /https?:\/\/\S+|bit\.ly\/\S+|tinyurl\.com\/\S+/g
    );
    return matches || [];
  };

  const colors = {
    safe: {
      bg: "#00e5a015",
      border: "#00e5a0",
      text: "#00e5a0",
      label: "✅ This Looks Safe"
    },
    medium: {
      bg: "#ffb80015",
      border: "#ffb800",
      text: "#ffb800",
      label: "⚠️ Be Careful!"
    },
    danger: {
      bg: "#ff3a5c15",
      border: "#ff3a5c",
      text: "#ff3a5c",
      label: "🚨 DANGER — This is a SCAM!"
    }
  };

  const c = result ? colors[result.risk_level] : null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoPill}>🛡️ PhishGuard</div>
          <h1 style={styles.h1}>
            Is this message a{" "}
            <span style={styles.accent}>scam?</span>
          </h1>
          <p style={styles.subtitle}>
            AI reads and explains exactly why a message
            is dangerous — in plain words.
          </p>
        </div>

        {/* Tabs */}
        <div style={styles.tabRow}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "scanner" ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab("scanner")}
          >
            🔍 Scan Message
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "inbox" ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab("inbox")}
          >
            📱 SMS Inbox
          </button>
        </div>

        {/* INBOX TAB */}
        {activeTab === "inbox" && (
          <div>
            <p style={{
              color: "#7070a0",
              fontSize: 13,
              marginBottom: 16,
              textAlign: "center"
            }}>
              ⚡ Messages scanned automatically in real-time
            </p>
            {mockMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  ...styles.inboxCard,
                  borderColor: msg.scanned === "danger"
                    ? "#ff3a5c" : "#00e5a0",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setMessage(msg.full);
                  setActiveTab("scanner");
                  setResult(null);
                  setAiText("");
                }}
              >
                <div style={styles.inboxRow}>
                  <div style={styles.inboxAvatar}>
                    {msg.from[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.inboxTopRow}>
                      <span style={styles.inboxFrom}>
                        {msg.from}
                      </span>
                      <span style={styles.inboxTime}>
                        {msg.time}
                      </span>
                    </div>
                    <div style={styles.inboxPreview}>
                      {msg.preview}
                    </div>
                  </div>
                  <div style={{
                    ...styles.inboxBadge,
                    background: msg.scanned === "danger"
                      ? "#ff3a5c20" : "#00e5a020",
                    color: msg.scanned === "danger"
                      ? "#ff3a5c" : "#00e5a0",
                    borderColor: msg.scanned === "danger"
                      ? "#ff3a5c" : "#00e5a0"
                  }}>
                    {msg.scanned === "danger" ? "🚨 SCAM" : "✅ SAFE"}
                  </div>
                </div>
              </div>
            ))}
            <p style={{
              color: "#7070a0",
              fontSize: 12,
              textAlign: "center",
              marginTop: 16
            }}>
              Tap any message to see full AI analysis
            </p>
          </div>
        )}

        {/* SCANNER TAB */}
        {activeTab === "scanner" && (
          <div>
            <div style={styles.card}>
              <label style={styles.label}>
                PASTE YOUR MESSAGE
              </label>
              <textarea
                style={styles.textarea}
                placeholder="Paste any SMS, email or WhatsApp message here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <div style={styles.chips}>
                <span style={styles.chipLabel}>Try:</span>
                <button
                  style={styles.chip}
                  onClick={() => setMessage(EXAMPLES.kyc)}
                >KYC Scam</button>
                <button
                  style={styles.chip}
                  onClick={() => setMessage(EXAMPLES.lottery)}
                >Lottery Fraud</button>
                <button
                  style={styles.chip}
                  onClick={() => setMessage(EXAMPLES.safe)}
                >Safe Message</button>
                <button
                  style={styles.chip}
                  onClick={() => setMessage(EXAMPLES.otp)}
                >OTP Fraud</button>
              </div>
            </div>

            {/* Language Toggle */}
            <div style={styles.langRow}>
              <span style={styles.langLabel}>
                Explanation in:
              </span>
              <button
                style={{
                  ...styles.langBtn,
                  ...(lang === "en" ? styles.langActive : {})
                }}
                onClick={() => setLang("en")}
              >English</button>
              <button
                style={{
                  ...styles.langBtn,
                  ...(lang === "hi" ? styles.langActive : {})
                }}
                onClick={() => setLang("hi")}
              >हिंदी</button>
            </div>

            {/* Main Button */}
            <button
              style={{
                ...styles.scanBtn,
                opacity: loading ? 0.7 : 1
              }}
              onClick={scanMessage}
              disabled={loading}
            >
              {loading
                ? "⏳ Checking with AI..."
                : "🤔 I Am Not Sure About This"}
            </button>

            {/* Result Card */}
            {result && c && (
              <div style={{
                ...styles.resultCard,
                background: c.bg,
                borderColor: c.border
              }}>

                {/* Title */}
                <h2 style={{
                  ...styles.resultTitle,
                  color: c.text
                }}>
                  {c.label}
                </h2>

                {/* Risk Bar */}
                <div style={styles.riskRow}>
                  <span style={styles.riskLabel}>
                    Risk Score
                  </span>
                  <span style={{
                    color: c.text,
                    fontWeight: 600
                  }}>
                    {result.risk_score}%
                  </span>
                </div>
                <div style={styles.barBg}>
                  <div style={{
                    ...styles.barFill,
                    width: `${result.risk_score}%`,
                    background: c.border
                  }}/>
                </div>

                {/* AI Explanation */}
                <div style={styles.aiBox}>
                  <div style={styles.aiTopRow}>
                    <div style={styles.aiLabel}>
                      🤖 AI EXPLANATION
                    </div>
                    <button
                      style={{
                        ...styles.speakBtn,
                        background: speaking
                          ? "rgba(124,109,250,0.3)"
                          : "rgba(124,109,250,0.1)"
                      }}
                      onClick={() => speakText(aiText)}
                    >
                      {speaking ? "⏹ Stop" : "🔊 Read Aloud"}
                    </button>
                  </div>
                  <p style={styles.aiText}>{aiText}</p>
                </div>

                {/* Flags */}
                <div style={styles.flagsRow}>
                  {result.triggered_flags.length > 0
                    ? result.triggered_flags.map(f => (
                        <span key={f} style={{
                          ...styles.flag,
                          borderColor: c.border,
                          color: c.text
                        }}>⚡ {f}</span>
                      ))
                    : <span style={{
                        ...styles.flag,
                        borderColor: c.border,
                        color: c.text
                      }}>✓ No red flags</span>
                  }
                </div>

                {/* Danger only features */}
                {result.risk_level === "danger" && (
                  <div>

                    {/* Family Alert Button */}
                    <button
                      style={styles.alertBtn}
                      onClick={() =>
                        sendFamilyAlert(
                          "Suspicious scam message detected"
                        )
                      }
                    >
                      📞 Alert My Family Member
                    </button>

                    {/* Suspicious Links Found */}
                    {getLinks(message).length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <p style={{
                          color: "#ff3a5c",
                          fontSize: 13,
                          marginBottom: 10,
                          fontWeight: 600
                        }}>
                          ⚠️ Suspicious links found:
                        </p>
                        {getLinks(message).map((link, i) => (
                          <div key={i} style={styles.linkCard}>
                            <span style={styles.linkText}>
                              🔗 {link}
                            </span>
                            <button
                              style={styles.linkAlertBtn}
                              onClick={() => sendFamilyAlert(link)}
                            >
                              🚨 Alert Family
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#0a0a0f",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    color: "#f0f0f8"
  },
  container: {
    maxWidth: 660,
    margin: "0 auto",
    padding: "48px 20px 80px"
  },
  header: {
    textAlign: "center",
    marginBottom: 40
  },
  logoPill: {
    display: "inline-block",
    background: "#13131a",
    border: "1px solid #2a2a3d",
    borderRadius: 100,
    padding: "8px 20px",
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 24
  },
  h1: {
    fontSize: 42,
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: 14
  },
  accent: {
    background: "linear-gradient(135deg,#7c6dfa,#e879f9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  subtitle: {
    fontSize: 17,
    color: "#7070a0",
    lineHeight: 1.6
  },
  tabRow: {
    display: "flex",
    gap: 8,
    marginBottom: 24
  },
  tab: {
    flex: 1,
    padding: "12px",
    background: "#13131a",
    border: "1px solid #2a2a3d",
    borderRadius: 12,
    fontSize: 15,
    color: "#7070a0",
    cursor: "pointer",
    fontWeight: 600
  },
  tabActive: {
    borderColor: "#7c6dfa",
    color: "#f0f0f8",
    background: "rgba(124,109,250,0.1)"
  },
  inboxCard: {
    background: "#13131a",
    border: "1px solid",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  inboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  inboxAvatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#2a2a3d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
    flexShrink: 0
  },
  inboxTopRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4
  },
  inboxFrom: {
    fontSize: 15,
    fontWeight: 600,
    color: "#f0f0f8"
  },
  inboxTime: {
    fontSize: 12,
    color: "#7070a0"
  },
  inboxPreview: {
    fontSize: 13,
    color: "#7070a0"
  },
  inboxBadge: {
    padding: "4px 10px",
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid",
    flexShrink: 0
  },
  card: {
    background: "#13131a",
    border: "1px solid #2a2a3d",
    borderRadius: 20,
    padding: 28,
    marginBottom: 14
  },
  label: {
    fontSize: 12,
    color: "#7070a0",
    letterSpacing: 1,
    textTransform: "uppercase",
    display: "block",
    marginBottom: 12
  },
  textarea: {
    width: "100%",
    background: "#1c1c28",
    border: "1px solid #2a2a3d",
    borderRadius: 12,
    padding: 18,
    fontSize: 17,
    color: "#f0f0f8",
    resize: "none",
    height: 150,
    fontFamily: "inherit",
    outline: "none",
    lineHeight: 1.6
  },
  chips: {
    display: "flex",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
    alignItems: "center"
  },
  chipLabel: {
    fontSize: 12,
    color: "#7070a0"
  },
  chip: {
    background: "#1c1c28",
    border: "1px solid #2a2a3d",
    borderRadius: 100,
    padding: "6px 14px",
    fontSize: 12,
    color: "#7070a0",
    cursor: "pointer"
  },
  langRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 14
  },
  langLabel: {
    fontSize: 13,
    color: "#7070a0"
  },
  langBtn: {
    background: "#13131a",
    border: "1px solid #2a2a3d",
    borderRadius: 100,
    padding: "7px 18px",
    fontSize: 13,
    color: "#7070a0",
    cursor: "pointer"
  },
  langActive: {
    borderColor: "#7c6dfa",
    color: "#f0f0f8",
    background: "rgba(124,109,250,0.1)"
  },
  scanBtn: {
    width: "100%",
    padding: 20,
    background: "linear-gradient(135deg,#7c6dfa,#a855f7)",
    border: "none",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: 700,
    color: "white",
    cursor: "pointer",
    marginBottom: 16
  },
  resultCard: {
    borderRadius: 20,
    padding: 28,
    border: "1px solid",
    marginTop: 8
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: 800,
    marginBottom: 18
  },
  riskRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#7070a0",
    marginBottom: 8
  },
  riskLabel: {},
  barBg: {
    height: 8,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 100,
    marginBottom: 20,
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    borderRadius: 100,
    transition: "width 1s ease"
  },
  aiBox: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 20,
    marginBottom: 18
  },
  aiTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  aiLabel: {
    fontSize: 11,
    color: "#7c6dfa",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: 600
  },
  speakBtn: {
    background: "rgba(124,109,250,0.1)",
    border: "1px solid #7c6dfa",
    borderRadius: 8,
    padding: "5px 12px",
    fontSize: 12,
    color: "#7c6dfa",
    cursor: "pointer",
    fontWeight: 600
  },
  aiText: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "#f0f0f8"
  },
  flagsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18
  },
  flag: {
    padding: "6px 14px",
    borderRadius: 100,
    fontSize: 13,
    border: "1px solid",
    fontWeight: 500
  },
  alertBtn: {
    width: "100%",
    padding: 16,
    background: "transparent",
    border: "1.5px solid #ff3a5c",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    color: "#ff3a5c",
    cursor: "pointer",
    marginBottom: 12
  },
  linkCard: {
    background: "rgba(255,58,92,0.08)",
    border: "1px solid",
    fontWeight: 500
  },
  alertBtn: {
    width: "100%",
    padding: 16,
    background: "transparent",
    border: "1.5px solid #ff3a5c",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    color: "#ff3a5c",
    cursor: "pointer",
    marginBottom: 12
  },
  linkCard: {
    background: "rgba(255,58,92,0.08)",
    border: "1px solid #ff3a5c",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  linkText: {
    color: "#ff3a5c",
    fontSize: 13,
    fontFamily: "monospace",
    wordBreak: "break-all"
  },
  linkAlertBtn: {
    background: "#ff3a5c",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0
  }
};