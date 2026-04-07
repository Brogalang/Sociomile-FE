import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getConversations, markAsRead } from "../services/conversationService";

const channelIcon = {
  whatsapp: "💬",
  email: "✉️",
  instagram: "📸",
  livechat: "🖥️",
};

const channelColor = {
  whatsapp: { bg: "#dcfce7", text: "#15803d" },
  email: { bg: "#dbeafe", text: "#1d4ed8" },
  instagram: { bg: "#fce7f3", text: "#be185d" },
  livechat: { bg: "#ede9fe", text: "#6d28d9" },
};

const statusColor = {
  open: { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
  pending: { bg: "#fef9c3", text: "#92400e", dot: "#f59e0b" },
  resolved: { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
  closed: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const FILTERS = ["All", "Open", "Escalated", "Closed"];

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations(); // pertama kali loading

    const interval = setInterval(() => {
      loadConversations(true); // silent refresh
    }, 5000);

    return () => clearInterval(interval);
  }, [page]);

  const loadConversations = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const data = await getConversations(page, 15);

      setConversations((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
        return data;
      });

    } catch {
      setConversations([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleOpen = async (conv) => {
    if (conv.unread_count > 0) {
      await markAsRead(conv.id).catch(() => {});
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
      );
    }
    navigate(`/conversations/${conv.id}`);
  };

  const filtered = conversations.filter((c) => {
    const matchSearch =
      !search ||
      String(c.customer_id).toLowerCase().includes(search.toLowerCase()) ||
      String(c.id).toLowerCase().includes(search.toLowerCase()) ||
      (c.last_message || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "All" ||
      (c.status || "").toLowerCase() === activeFilter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <div style={s.page}>
      <Navbar />

      <div style={s.container}>
        {/* Page header */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>Conversations</h1>
            <p style={s.pageSub}>
              {filtered.length} conversation{filtered.length !== 1 ? "s" : ""}
              {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
            </p>
          </div>

          <div style={s.headerActions}>
            {/* Search */}
            <div style={s.searchWrap}>
              <span style={s.searchIcon}>🔍</span>
              <input
                style={s.searchInput}
                placeholder="Search by customer, ID, message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter pills */}
            <div style={s.filterRow}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  style={{
                    ...s.filterBtn,
                    ...(activeFilter === f ? s.filterBtnActive : {}),
                  }}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={s.tableCard}>
          {loading ? (
            <div style={s.emptyState}>
              <div style={s.spinner} />
              <p style={s.emptyText}>Loading conversations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <span style={{ fontSize: 40 }}>📭</span>
              <p style={s.emptyText}>No conversations found</p>
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["Customer", "Channel", "Last Message", "Status", "Unread", "Updated"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const channel = (c.channel || "livechat").toLowerCase();
                  const status = (c.status || "open").toLowerCase();
                  const sc = statusColor[status] || statusColor.open;
                  const cc = channelColor[channel] || channelColor.livechat;
                  const hasUnread = c.unread_count > 0;

                  return (
                    <tr
                      key={c.id}
                      style={{
                        ...s.tr,
                        ...(hasUnread ? s.trUnread : {}),
                      }}
                      onClick={() => handleOpen(c)}
                    >
                      {/* Customer */}
                      <td style={s.td}>
                        <div style={s.customerCell}>
                          <div style={s.avatar}>
                            {getInitials(c.customer_name || String(c.customer_id))}
                          </div>
                          <div>
                            <p style={{ ...s.customerName, fontWeight: hasUnread ? "700" : "500" }}>
                              {c.customer_name || `Customer`}
                            </p>
                            <p style={s.convId}>#{c.customer_id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Channel */}
                      <td style={s.td}>
                        <span style={{ ...s.badge, ...cc }}>
                          {channelIcon[channel] || "💬"} {channel}
                        </span>
                      </td>

                      {/* Last message */}
                      <td style={s.td}>
                        <p style={{ ...s.lastMsg, fontWeight: hasUnread ? "600" : "400" }}>
                          {c.last_message || "No messages yet"}
                        </p>
                      </td>

                      {/* Status */}
                      <td style={s.td}>
                        <span style={{ ...s.statusBadge }}>
                          <span style={{ ...s.statusDot, background: sc.dot }} />
                          <span style={{ color: sc.text, fontWeight: "600" }}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </span>
                      </td>

                      {/* Unread */}
                      <td style={s.td}>
                        {hasUnread ? (
                          <span style={s.unreadBadge}>{c.unread_count}</span>
                        ) : (
                          <span style={s.readCheck}>✓</span>
                        )}
                      </td>

                      {/* Time */}
                      <td style={{ ...s.td, color: "#94a3b8", fontSize: "12px" }}>
                        {timeAgo(c.updated_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div style={s.pagination}>
          <button
            style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span style={s.pageNum}>Page {page}</span>
          <button
            style={{ ...s.pageBtn, ...(filtered.length < 15 ? s.pageBtnDisabled : {}) }}
            onClick={() => setPage((p) => p + 1)}
            disabled={filtered.length < 15}
          >
            Next →
          </button>
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
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.5px",
  },
  pageSub: {
    fontSize: "13px",
    color: "#64748b",
    margin: "4px 0 0",
  },
  headerActions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "flex-end",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "0 14px",
    gap: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  searchIcon: { fontSize: "14px", color: "#94a3b8" },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#1e293b",
    padding: "10px 0",
    width: "280px",
    background: "transparent",
    fontFamily: "'Trebuchet MS', sans-serif",
  },
  filterRow: {
    display: "flex",
    gap: "6px",
  },
  filterBtn: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "6px 14px",
    borderRadius: "999px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Trebuchet MS', sans-serif",
  },
  filterBtnActive: {
    background: "#1e3a8a",
    color: "#fff",
    border: "1px solid #1e3a8a",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "14px 16px",
    background: "#f8fafc",
    borderBottom: "1px solid #f1f5f9",
  },
  tr: {
    borderBottom: "1px solid #f8fafc",
    cursor: "pointer",
    transition: "background 0.12s",
  },
  trUnread: {
    background: "#fafbff",
  },
  td: {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#1e293b",
    verticalAlign: "middle",
  },
  customerCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
    flexShrink: 0,
  },
  customerName: {
    margin: 0,
    fontSize: "13px",
    color: "#0f172a",
  },
  convId: {
    margin: 0,
    fontSize: "11px",
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 10px",
    borderRadius: "999px",
    textTransform: "capitalize",
  },
  lastMsg: {
    margin: 0,
    color: "#475569",
    fontSize: "13px",
    maxWidth: "240px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  unreadBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "22px",
    height: "22px",
    borderRadius: "999px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    padding: "0 6px",
  },
  readCheck: {
    color: "#22c55e",
    fontSize: "14px",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginTop: "20px",
  },
  pageBtn: {
    fontSize: "13px",
    fontWeight: "600",
    padding: "8px 18px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#1e293b",
    cursor: "pointer",
    fontFamily: "'Trebuchet MS', sans-serif",
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  pageNum: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "12px",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
  },
  spinner: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #2563eb",
    animation: "spin 0.8s linear infinite",
  },
};