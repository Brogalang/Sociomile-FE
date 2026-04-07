import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const TENANT_ID = "7e5e8a65-0b50-4d7b-afb5-1a3e1ec3e5ff";
const LS_KEY = "sociomile_guest"; // { name, conversationId }
const POLL_INTERVAL = 4000; // ms — auto-refresh messages

// ─── HELPERS ───────────────────────────────────────────────────────────────
function timeLabel(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateSeparatorLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupMessages(messages) {
  const items = [];
  let lastDate = null;
  for (const m of messages) {
    const dateKey = m.CreatedAt
      ? new Date(m.CreatedAt).toDateString()
      : "unknown";
    if (dateKey !== lastDate) {
      items.push({
        type: "sep",
        label: dateSeparatorLabel(m.CreatedAt),
        key: `sep-${dateKey}`,
      });
      lastDate = dateKey;
    }
    items.push({ type: "msg", data: m });
  }
  return items;
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSession(name, phone) {
  localStorage.setItem(LS_KEY, JSON.stringify({ name, phone }));
}

function clearSession() {
  localStorage.removeItem(LS_KEY);
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function PublicChat() {
  const [step, setStep] = useState("loading"); // loading | intro | chat
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(""); // normalized phone, used as external_user_id
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  // ── on mount: check localStorage ──────────────────────────────────────
  useEffect(() => {
    const session = loadSession();
    if (session?.name && session?.phone) {
      setName(session.name);
      setPhone(session.phone);
      setPhoneInput(session.phone);
      setStep("chat");
    } else {
      setStep("intro");
    }
  }, []);

  // ── start polling when entering chat ─────────────────────────────────
  useEffect(() => {
    if (!phone) return;

    fetchMessages(phone);

    pollRef.current = setInterval(() => {
      fetchMessages(phone);
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [phone]);

  // ── auto-scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (phoneNum) => {
    const p = phoneNum || phone;
    if (!p) return;
    try {
      const res = await api.get("/channel/messages", {
        params: { external_user_id: p },
      });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setMessages(data);
    } catch {
      /* silent */
    } finally {
      setMsgLoading(false);
    }
  };

  // ── start / resume conversation ────────────────────────────────────────
  const handleStart = async () => {
    const trimmedName = nameInput.trim();
    const trimmedPhone = phoneInput.trim().replace(/[\s\-]/g, "");

    let hasError = false;
    if (!trimmedName) {
      setNameError("Masukkan nama kamu dulu ya 😊");
      hasError = true;
    } else {
      setNameError("");
    }

    // Must start with 62, digits only, total 11-15 chars
    const phoneRegex = /^628[1-9][0-9]{7,11}$/;
    if (!trimmedPhone) {
      setPhoneError("Nomor telepon wajib diisi");
      hasError = true;
    } else if (!phoneRegex.test(trimmedPhone)) {
      setPhoneError("Format tidak valid. Harus diawali 62 — cth: 6281234567890");
      hasError = true;
    } else {
      setPhoneError("");
    }

    if (hasError) return;
    setStarting(true);

    try {
      // POST webhook — kirim pesan pertama sekaligus membuat conversation
      await api.post("/channel/webhook", {
        tenant_id: TENANT_ID,
        external_user_id: trimmedPhone,
        name: trimmedName,
        message: `Halo! Saya ${trimmedName}, ingin memulai percakapan.`,
      });

      saveSession(trimmedName, trimmedPhone);
      setName(trimmedName);
      setPhone(trimmedPhone);
      setMsgLoading(true);
      setStep("chat");
    } catch (err) {
      setPhoneError(
        "Gagal memulai percakapan. Pastikan server berjalan dan coba lagi."
      );
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);

    // Optimistic update
    const optimistic = {
      ID: `opt-${Date.now()}`,
      SenderType: "customer",
      Message: trimmed,
      CreatedAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");

    try {
      // Kirim lewat webhook (publik, tidak butuh auth)
      await api.post("/channel/webhook", {
        tenant_id: TENANT_ID,
        external_user_id: phone,
        message: trimmed,
      });
      await fetchMessages(phone);
    } catch {
      setMessages((prev) => prev.filter((m) => !m._optimistic));
      setText(trimmed);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewSession = () => {
    clearSession();
    setName("");
    setPhone("");
    setNameInput("");
    setPhoneInput("");
    setMessages([]);
    setText("");
    setStep("intro");
  };

  const grouped = groupMessages(messages);

  // ─── RENDER: loading ──────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div style={s.fullPage}>
        <div style={s.spinner} />
      </div>
    );
  }

  // ─── RENDER: intro / name screen ──────────────────────────────────────
  if (step === "intro") {
    return (
      <div style={s.fullPage}>
        <div style={s.introCard}>
          {/* Logo area */}
          <div style={s.introLogo}>
            <div style={s.logoCircle}>S</div>
            <h1 style={s.logoName}>Sociomile</h1>
            <p style={s.logoTagline}>Omnichannel Support</p>
          </div>

          <div style={s.introDivider} />

          <h2 style={s.introTitle}>Hai, ada yang bisa kami bantu? 👋</h2>
          <p style={s.introSub}>
            Masukkan nama kamu untuk memulai atau melanjutkan percakapan.
          </p>

          <div style={s.inputGroup}>
            <label style={s.inputLabel}>Nama kamu</label>
            <input
              style={{ ...s.nameInput, ...(nameError ? s.nameInputError : {}) }}
              placeholder="cth: Budi Santoso"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setNameError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.focus()}
              autoFocus
            />
            {nameError && <p style={s.errorMsg}>{nameError}</p>}
          </div>

          <div style={s.inputGroup}>
            <label style={s.inputLabel}>Nomor telepon (WhatsApp)</label>
            <div style={s.phoneWrap}>
              <span style={s.phonePrefix}>🇮🇩 62</span>
              <input
                ref={inputRef}
                style={{
                  ...s.nameInput,
                  ...s.phoneField,
                  ...(phoneError ? s.nameInputError : {}),
                }}
                placeholder="81234567890"
                value={phoneInput.replace(/^62/, "")}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setPhoneInput("62" + digits);
                  setPhoneError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                inputMode="numeric"
              />
            </div>
            {phoneError && <p style={s.errorMsg}>{phoneError}</p>}
            {!phoneError && (
              <p style={s.inputHintText}>
                Nomor ini digunakan untuk mengidentifikasi percakapan kamu
              </p>
            )}
          </div>

          <button
            style={{ ...s.startBtn, ...(starting ? s.startBtnDisabled : {}) }}
            onClick={handleStart}
            disabled={starting}
          >
            {starting ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={s.btnSpinner} /> Memulai...
              </span>
            ) : (
              "Mulai Chat →"
            )}
          </button>

          <p style={s.introNote}>
            💾 Percakapan kamu tersimpan otomatis di browser ini.
          </p>
        </div>
      </div>
    );
  }

  // ─── RENDER: chat screen ──────────────────────────────────────────────
  return (
    <div style={s.fullPage}>
      <div style={s.chatWindow}>
        {/* Header */}
        <div style={s.chatHeader}>
          <div style={s.headerLeft}>
            <div style={s.headerLogo}>S</div>
            <div>
              <p style={s.headerTitle}>Sociomile Support</p>
              <p style={s.headerSub}>
                <span style={s.onlineDot} /> Tim kami siap membantu
              </p>
            </div>
          </div>
          <div style={s.headerRight}>
            <div style={s.userChip}>
              <span style={s.userChipAvatar}>
                {name.charAt(0).toUpperCase()}
              </span>
              <span style={s.userChipName}>{name}</span>
            </div>
            <button
              style={s.newChatBtn}
              onClick={handleNewSession}
              title="Mulai percakapan baru"
            >
              + Baru
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.messagesArea}>
          {/* Welcome bubble */}
          <div style={s.welcomeBubble}>
            <span style={{ fontSize: 18 }}>👋</span>
            <span>
              Halo <strong>{name}</strong>! Tim support kami akan segera
              membalas pesan kamu.
            </span>
          </div>

          {msgLoading && messages.length === 0 ? (
            <div style={s.centered}>
              <div style={s.spinner} />
            </div>
          ) : (
            grouped.map((item) => {
              if (item.type === "sep") {
                return (
                  <div key={item.key} style={s.dateSep}>
                    <span style={s.dateSepLabel}>{item.label}</span>
                  </div>
                );
              }

              const m = item.data;
              const isMe =
                (m.SenderType || "").toLowerCase() === "customer";

              return (
                <div
                  key={m.ID}
                  style={{
                    ...s.msgRow,
                    justifyContent: isMe ? "flex-end" : "flex-start",
                  }}
                >
                  {!isMe && <div style={s.agentAvatar}>🎧</div>}

                  <div style={{ maxWidth: "70%" }}>
                    <p
                      style={{
                        ...s.senderLabel,
                        textAlign: isMe ? "right" : "left",
                      }}
                    >
                      {isMe ? name : "Support Agent"}
                    </p>
                    <div style={isMe ? s.bubbleMe : s.bubbleAgent}>
                      <p style={s.bubbleText}>{m.Message}</p>
                    </div>
                    <p
                      style={{
                        ...s.timestamp,
                        textAlign: isMe ? "right" : "left",
                      }}
                    >
                      {timeLabel(m.CreatedAt)}
                      {isMe && m._optimistic && (
                        <span style={{ color: "#cbd5e1" }}> ✓</span>
                      )}
                      {isMe && !m._optimistic && (
                        <span style={{ color: "#60a5fa" }}> ✓✓</span>
                      )}
                    </p>
                  </div>

                  {isMe && (
                    <div style={s.meAvatar}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={s.inputBar}>
          <div style={s.inputWrap}>
            <textarea
              ref={inputRef}
              style={s.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan... (Enter untuk kirim)"
              rows={1}
            />
            <button
              style={{
                ...s.sendBtn,
                ...(!text.trim() || sending ? s.sendBtnOff : {}),
              }}
              onClick={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? "⏳" : "➤"}
            </button>
          </div>
          <p style={s.poweredBy}>Powered by Sociomile</p>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const s = {
  fullPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
    padding: "20px",
  },

  // ── Intro card ──
  introCard: {
    background: "#fff",
    borderRadius: "24px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
  },
  introLogo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  logoCircle: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "26px",
    fontFamily: "'Georgia', serif",
    marginBottom: "10px",
    boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
  },
  logoName: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
    fontFamily: "'Georgia', serif",
  },
  logoTagline: {
    margin: "2px 0 0",
    fontSize: "12px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: "600",
  },
  introDivider: {
    height: "1px",
    background: "#f1f5f9",
    margin: "20px 0",
  },
  introTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px",
    textAlign: "center",
  },
  introSub: {
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center",
    margin: "0 0 24px",
    lineHeight: "1.6",
  },
  inputGroup: {
    marginBottom: "16px",
  },
  inputLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "6px",
  },
  nameInput: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "'Trebuchet MS', sans-serif",
    color: "#0f172a",
    boxSizing: "border-box",
    transition: "border 0.15s",
  },
  nameInputError: {
    border: "1.5px solid #ef4444",
  },
  errorMsg: {
    color: "#ef4444",
    fontSize: "12px",
    margin: "6px 0 0",
  },
  startBtn: {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Trebuchet MS', sans-serif",
    boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  btnSpinner: {
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  introNote: {
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center",
    margin: "16px 0 0",
  },
  phoneWrap: {
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#fff",
  },
  phonePrefix: {
    padding: "12px 10px 12px 14px",
    fontSize: "13px",
    color: "#475569",
    fontWeight: "600",
    background: "#f8fafc",
    borderRight: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  phoneField: {
    border: "none !important",
    borderRadius: 0,
    flex: 1,
  },
  inputHintText: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: "5px 0 0",
  },

  // ── Chat window ──
  chatWindow: {
    width: "100%",
    maxWidth: "520px",
    height: "85vh",
    maxHeight: "700px",
    background: "#fff",
    borderRadius: "24px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerLogo: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.2)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: "16px",
    fontFamily: "'Georgia', serif",
  },
  headerTitle: {
    margin: 0,
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
  },
  headerSub: {
    margin: "2px 0 0",
    color: "rgba(255,255,255,0.75)",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  onlineDot: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#4ade80",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "999px",
    padding: "4px 10px 4px 4px",
  },
  userChipAvatar: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#fff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  userChipName: {
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
  newChatBtn: {
    fontSize: "11px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "8px",
    padding: "5px 10px",
    cursor: "pointer",
    fontFamily: "'Trebuchet MS', sans-serif",
  },

  // ── Messages ──
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 16px 8px",
    background: "#fafbff",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  welcomeBubble: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "13px",
    color: "#1e40af",
    marginBottom: "12px",
    lineHeight: "1.5",
  },
  dateSep: {
    display: "flex",
    justifyContent: "center",
    margin: "10px 0",
  },
  dateSepLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "3px 12px",
    borderRadius: "999px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "7px",
    marginBottom: "8px",
  },
  agentAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    flexShrink: 0,
  },
  meAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "800",
    flexShrink: 0,
  },
  senderLabel: {
    margin: "0 0 3px",
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  bubbleMe: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    borderRadius: "16px 4px 16px 16px",
    padding: "10px 14px",
    boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
  },
  bubbleAgent: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "4px 16px 16px 16px",
    padding: "10px 14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  bubbleText: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "1.55",
    color: "inherit",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  timestamp: {
    margin: "4px 2px 0",
    fontSize: "10px",
    color: "#94a3b8",
  },
  centered: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },

  // ── Input bar ──
  inputBar: {
    padding: "12px 16px 10px",
    borderTop: "1px solid #f1f5f9",
    background: "#fff",
    flexShrink: 0,
  },
  inputWrap: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: "14px",
    padding: "8px 10px",
  },
  textarea: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "13px",
    fontFamily: "'Trebuchet MS', sans-serif",
    color: "#1e293b",
    resize: "none",
    lineHeight: "1.5",
    maxHeight: "100px",
    overflowY: "auto",
  },
  sendBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
  sendBtnOff: {
    opacity: 0.4,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  poweredBy: {
    margin: "6px 0 0",
    fontSize: "10px",
    color: "#cbd5e1",
    textAlign: "center",
    letterSpacing: "0.04em",
  },

  // ── Spinner ──
  spinner: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #2563eb",
    animation: "spin 0.8s linear infinite",
  },
};