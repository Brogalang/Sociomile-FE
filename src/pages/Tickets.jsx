import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getTickets, updateTicketStatus } from "../services/ticketService";

const statusColor = {
  open: { bg: "#fee2e2", text: "#b91c1c", dot: "#ef4444" },
  in_progress: { bg: "#fef9c3", text: "#f59e0b", dot: "#f59e0b" },
  resolved: { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
  closed: { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
};

function timeAgo(dateStr) {
  if (!dateStr || dateStr === "0001-01-01T00:00:00Z") return "-";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const FILTERS = ["All", "Open", "In_Progress", "Resolved", "Closed"];

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateTicketStatus(id, status);

      setTickets((prev) =>
        prev.map((t) =>
          t.ID === id ? { ...t, Status: status } : t
        )
      );

    } catch (err) {
      alert("Gagal update status");
    }
  };

  const filtered = tickets.filter((t) => {
    const matchSearch =
      !search ||
      String(t.ID).toLowerCase().includes(search.toLowerCase()) ||
      (t.Title || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.Description || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "All" ||
      (t.Status || "").toLowerCase() === activeFilter.toLowerCase();
    return matchSearch && matchFilter;
  });

  return (
    <div style={s.page}>
      <Navbar />

      <div style={s.container}>
        {/* Header Section */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>Support Tickets</h1>
            <p style={s.pageSub}>
              {filtered.length} ticket{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div style={s.headerActions}>
            <div style={s.searchWrap}>
              <span style={s.searchIcon}>🔍</span>
              <input
                style={s.searchInput}
                placeholder="Search by ID, title, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

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
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div style={s.tableCard}>
          {loading ? (
            <div style={s.emptyState}>
              <div style={s.spinner} />
              <p style={s.emptyText}>Loading tickets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <span style={{ fontSize: 40 }}>🎫</span>
              <p style={s.emptyText}>No tickets available</p>
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["Ticket Info", "Description", "Assigned To", "Status", "Updated"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const status = (t.Status || "open").toLowerCase();
                  const sc = statusColor[status] || statusColor.open;

                  return (
                    <tr key={t.ID} style={s.tr}>
                      {/* Ticket Info */}
                      <td style={s.td}>
                        <div style={s.ticketCell}>
                          <div style={s.ticketIcon}>#</div>
                          <div>
                            <p style={s.ticketTitle}>{t.Title || "Untitled Ticket"}</p>
                            <p style={s.ticketId}>ID: {t.ID}</p>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td style={s.td}>
                        <p style={s.descText}>{t.Description || "-"}</p>
                      </td>

                      {/* Agent */}
                      <td style={s.td}>
                        <span style={s.agentText}>{t.AssignedAgentID  || "Unassigned"}</span>
                      </td>

                      {/* Status Dropdown */}
                      <td style={s.td}>
                        <div style={{ ...s.statusBadge, background: sc.bg, padding: '4px 8px', borderRadius: '8px' }}>
                          <span style={{ ...s.statusDot, background: sc.dot }} />
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(t.ID, e.target.value)}
                            style={{ 
                              border: 'none', 
                              background: 'transparent', 
                              color: sc.text, 
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="open" style={{ color: "#000000" }}>Open</option>
                            <option value="in_progress" style={{ color: "#000000" }}>In Progress</option>
                            <option value="resolved" style={{ color: "#000000" }}>Resolved</option>
                            <option value="closed" style={{ color: "#000000" }}>Closed</option>
                          </select>
                        </div>
                      </td>

                      {/* Time */}
                      <td style={{ ...s.td, color: "#94a3b8", fontSize: "12px" }}>
                        {timeAgo(t.updated_at || t.CreatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    transition: "background 0.12s",
  },
  td: {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#1e293b",
    verticalAlign: "middle",
  },
  ticketCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  ticketIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },
  ticketTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "600",
    color: "#0f172a",
  },
  ticketId: {
    margin: 0,
    fontSize: "11px",
    color: "#94a3b8",
    fontFamily: "monospace",
  },
  descText: {
    margin: 0,
    fontSize: "13px",
    color: "#475569",
    maxWidth: "300px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  agentText: {
    fontSize: "12px",
    color: "#64748b",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
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