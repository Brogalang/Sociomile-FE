import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import {
  getMessages,
  sendMessage,
} from "../services/conversationService";

function timeLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function dateSeparator(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  for (const m of messages) {
    const dateKey = m.CreatedAt ? new Date(m.CreatedAt).toDateString() : "unknown";
    if (dateKey !== lastDate) {
      groups.push({ type: "separator", label: dateSeparator(m.CreatedAt), key: `sep-${dateKey}` });
      lastDate = dateKey;
    }
    groups.push({ type: "message", data: m });
  }
  return groups;
}

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showEscalate, setShowEscalate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadMessages(true); // hanya pertama kali loading

    const interval = setInterval(() => {
      loadMessages(false); // polling tanpa loading
    }, 4000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!bottomRef.current) return;

    bottomRef.current.scrollIntoView({
      behavior: messages.length < 2 ? "auto" : "smooth",
    });
  }, [messages.length]);

  const loadMessages = async (initial = false) => {
    if (initial) setLoading(true);

    try {
      const data = await getMessages(id);
      const list = Array.isArray(data?.messages) ? data.messages : [];

      setMessages(list);
      setCustomer(data?.customer || null);

    } catch (err) {
      console.error(err);
    } finally {
      if (initial) setLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText("");

    try {
      await sendMessage(id, trimmed);
      await loadMessages(); // reload message dari server
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const loadAgents = async () => {
    try {
      const res = await api.get("/users/agents");
      // Karena response Anda { "data": [...] }, maka ambil res.data.data
      setAgents(res.data.data || []); 
    } catch (err) {
      console.error("Failed to load agents", err);
      alert("Gagal mengambil daftar agent");
    }
  };


  const handleEscalate = async () => {
    await api.post(`/conversations/${id}/escalate`, {
      title,
      description,
      agent_id: selectedAgent
    });

    alert("Ticket created!");
    setShowEscalate(false);
  };

  const handleCloseConversation = async () => {
    try {

      const confirmClose = window.confirm(
        "Are you sure you want to close this conversation?"
      );

      if (!confirmClose) return;

      await api.put(`/conversations/${id}/status`, {
        status: "closed"
      });

      alert("Conversation closed");

      navigate("/conversations");

    } catch (err) {
      console.error(err);
      alert("Failed to close conversation");
    }
  };

  const grouped = groupByDate(messages);

  return (
    <div style={s.page}>
      <Navbar />

      <div style={s.chatLayout}>
        {/* Chat header */}
        <div style={s.chatHeader}>
          <button style={s.backBtn} onClick={() => navigate("/conversations")}>
            ← Back
          </button>
          <div style={s.headerInfo}>
            <div style={s.headerAvatar}>
              {customer?.Name?.slice(0,2).toUpperCase() || "CU"}
            </div>
            <div>
              <p style={s.headerTitle}>
                {customer?.Name || `Conversation #${id}`}
              </p>
              <p style={s.headerSub}>
                {customer?.ExternalID}
              </p>
              <p style={s.headerSub}>
                <span style={s.onlineDot} /> Active now
              </p>
            </div>
          </div>
          <div style={s.headerActions}>
            {/* <button style={s.actionBtn} title="Refresh" onClick={loadMessages}>⟳</button> */}
            <button
              style={s.escalateBtn} // Gunakan style baru yang lebih spesifik
              onClick={async () => {
                await loadAgents();
                setShowEscalate(true);
              }}
            >
              <span style={{ marginRight: '6px' }}></span> Escalate
            </button>
            <button
              style={s.closedBtn} // Gunakan style baru yang lebih spesifik
              onClick={handleCloseConversation}
            >
              <span style={{ marginRight: '6px' }}></span> Closed
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div style={s.messagesArea}>
          {loading ? (
            <div style={s.centered}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={s.centered}>
              <span style={{ fontSize: 44 }}>💬</span>
              <p style={s.loadingText}>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {grouped.map((item) => {
                if (item.type === "separator") {
                  return (
                    <div key={item.key} style={s.dateSep}>
                      <span style={s.dateSepLabel}>{item.label}</span>
                    </div>
                  );
                }

                const m = item.data;
                const isAgent = (m.SenderType || "").toLowerCase() === "agent";
                const isCustomer = (m.SenderType || "").toLowerCase() === "customer";

                return (
                  <div
                    key={m.ID}
                    style={{
                      ...s.messageRow,
                      justifyContent: isAgent ? "flex-end" : "flex-start",
                    }}
                  >
                    {/* Avatar for customer */}
                    {isCustomer && (
                      <div style={s.msgAvatar}>
                        {isCustomer ? "👤" : "🤖"}
                      </div>
                    )}

                    <div style={{ maxWidth: "60%" }}>
                      {/* Sender label */}
                      <p style={{
                        ...s.senderLabel,
                        textAlign: isAgent ? "right" : "left",
                      }}>
                        {isAgent ? "You (Agent)" : isCustomer ? "Customer" : m.SenderType}
                      </p>

                      {/* Bubble */}
                      <div style={isAgent ? s.bubbleAgent : s.bubbleCustomer}>
                        <p style={s.bubbleText}>{m.Message}</p>
                      </div>

                      {/* Timestamp */}
                      <p style={{
                        ...s.timestamp,
                        textAlign: isAgent ? "right" : "left",
                      }}>
                        {timeLabel(m.CreatedAt)}
                        {isAgent && <span style={s.readTick}> ✓✓</span>}
                      </p>
                    </div>

                    {/* Avatar for agent */}
                    {isAgent && (
                      <div style={{ ...s.msgAvatar, background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                        🎧
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input bar */}
        <div style={s.inputBar}>
          <div style={s.inputWrap}>
            <textarea
              ref={inputRef}
              style={s.input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
              rows={1}
            />
            <button
              style={{
                ...s.sendBtn,
                ...((!text.trim() || sending) ? s.sendBtnDisabled : {}),
              }}
              onClick={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? "⏳" : "➤"}
            </button>
          </div>
          <p style={s.inputHint}>Press Enter to send · Shift+Enter for new line</p>

          {showEscalate && (
            <div style={s.modalOverlay}>
              <div style={s.modalContent}>
                <h3 style={{ margin: "0 0 4px", fontSize: "18px" }}>Escalate to Ticket</h3>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b" }}>
                  Create a formal ticket and assign it to an available agent.
                </p>

                <div style={s.formGroup}>
                  <label style={s.label}>Ticket Title</label>
                  <input
                    placeholder="e.g. Kendala Pembayaran PDAM"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={s.modalInput}
                  />
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Description</label>
                  <textarea
                    placeholder="Detail masalah..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ ...s.modalInput, minHeight: "80px", resize: "vertical" }}
                  />
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Select Agent</label>
                  <select
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    style={s.modalInput}
                  >
                    <option value="">-- Choose Agent --</option>
                    {agents.map((a) => (
                      <option key={a.ID} value={a.ID}>
                        {a.Email} ({a.Role})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button onClick={handleEscalate} style={s.btnPrimary}>
                    Create Ticket
                  </button>
                  <button onClick={() => setShowEscalate(false)} style={s.btnSecondary}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  chatLayout: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    maxWidth: "900px",
    width: "100%",
    margin: "24px auto",
    background: "#fff",
    borderRadius: "20px",
    boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
    overflow: "hidden",
    height: "calc(100vh - 112px)",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px 24px",
    borderBottom: "1px solid #f1f5f9",
    background: "#fff",
    flexShrink: 0,
  },
  backBtn: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
    background: "#eff6ff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Trebuchet MS', sans-serif",
    flexShrink: 0,
  },
  headerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  headerAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "13px",
  },
  headerTitle: {
    margin: 0,
    fontWeight: "700",
    fontSize: "15px",
    color: "#0f172a",
  },
  headerSub: {
    margin: "2px 0 0",
    fontSize: "12px",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  onlineDot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
  },
  headerActions: {
    display: "flex",
    gap: "8px",
  },
  actionBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    background: "#fafbff",
  },
  dateSep: {
    display: "flex",
    justifyContent: "center",
    margin: "12px 0",
  },
  dateSepLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "4px 14px",
    borderRadius: "999px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    marginBottom: "8px",
  },
  msgAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },
  senderLabel: {
    margin: "0 0 3px",
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  bubbleCustomer: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "4px 16px 16px 16px",
    padding: "10px 14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  bubbleAgent: {
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    borderRadius: "16px 4px 16px 16px",
    padding: "10px 14px",
    boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
  bubbleText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: "1.5",
    color: "inherit",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  timestamp: {
    margin: "4px 2px 0",
    fontSize: "11px",
    color: "#94a3b8",
  },
  readTick: {
    color: "#60a5fa",
    fontWeight: "600",
  },
  inputBar: {
    padding: "16px 24px",
    borderTop: "1px solid #f1f5f9",
    background: "#fff",
    flexShrink: 0,
  },
  inputWrap: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
    background: "#f8fafc",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    padding: "10px 12px",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "14px",
    fontFamily: "'Trebuchet MS', sans-serif",
    color: "#1e293b",
    resize: "none",
    lineHeight: "1.5",
    maxHeight: "120px",
    overflowY: "auto",
  },
  sendBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
    transition: "opacity 0.15s",
  },
  sendBtnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  inputHint: {
    margin: "6px 2px 0",
    fontSize: "11px",
    color: "#cbd5e1",
    textAlign: "center",
  },
  centered: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "40px",
  },
  spinner: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #2563eb",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(15, 23, 42, 0.6)", // overlay gelap transparan
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    background: "#fff",
    padding: "28px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
  },
  modalInput: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
  },
  btnPrimary: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnSecondary: {
    flex: 1,
    padding: "12px",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  escalateBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",        // Beri ruang di kiri-kanan teks
    height: "36px",           // Tinggi yang proporsional
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #f59e0b, #d97706)", // Warna Amber/Orange agar kontras dengan warna biru Agent
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(217, 119, 6, 0.2)",
    transition: "transform 0.1s, box-shadow 0.1s",
    fontFamily: "inherit",
    whiteSpace: "nowrap",      // Mencegah teks turun ke bawah
  },
  closedBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 16px",        // Beri ruang di kiri-kanan teks
    height: "36px",           // Tinggi yang proporsional
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #798482, #cecac7)", // Warna Amber/Orange agar kontras dengan warna biru Agent
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(217, 119, 6, 0.2)",
    transition: "transform 0.1s, box-shadow 0.1s",
    fontFamily: "inherit",
    whiteSpace: "nowrap",      // Mencegah teks turun ke bawah
  },
};