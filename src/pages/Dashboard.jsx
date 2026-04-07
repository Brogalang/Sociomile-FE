import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

const statusColor = {
  Open: { bg: "#fee2e2", text: "#b91c1c" },
  Pending: { bg: "#fef9c3", text: "#92400e" },
  Resolved: { bg: "#dcfce7", text: "#166534" },
};

const priorityColor = {
  High: { bg: "#fee2e2", text: "#b91c1c" },
  Medium: { bg: "#fef3c7", text: "#b45309" },
  Low: { bg: "#f1f5f9", text: "#475569" },
};

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const statsRes = await api.get("/dashboard/stats");
      const ticketRes = await api.get("/tickets?limit=5");

      const data = statsRes.data;

      setStats([
        {
          label: "Total Conversations",
          value: data.total_conversations,
          icon: "💬",
          color: "#2563eb",
          bg: "#eff6ff",
        },
        {
          label: "Open Tickets",
          value: data.open_tickets,
          icon: "🎫",
          color: "#7c3aed",
          bg: "#f5f3ff",
        },
        {
          label: "Resolved",
          value: data.resolved,
          icon: "✅",
          color: "#059669",
          bg: "#ecfdf5",
        },
        // {
        //   label: "Avg. Response Time",
        //   value: data.avg_response_time,
        //   icon: "⚡",
        //   color: "#d97706",
        //   bg: "#fffbeb",
        // },
      ]);

      setRecentTickets(ticketRes.data.data || ticketRes.data);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.greeting}>Omnichannel Overview</p>
            <h1 style={styles.title}>Sociomile Dashboard</h1>
          </div>

          <div style={styles.dateChip}>
            📅{" "}
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={styles.statLabel}>{s.label}</p>
                  <p style={styles.statValue}>{s.value}</p>
                </div>
                <div style={{ ...styles.statIcon, background: s.bg, color: s.color }}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Tickets */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>🎫 Recent Tickets</h2>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                {["ID", "Customer", "Subject", "Status"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {recentTickets?.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ ...styles.td, textAlign: "center", color: "#94a3b8" }}>
                    No recent tickets
                  </td>
                </tr>
              )}

              {recentTickets?.map((t) => {
                const status = t.Status?.toLowerCase();
                const priority = t.Priority?.toLowerCase();

                return (
                  <tr key={t.ID} style={styles.tr}>
                    <td style={{ ...styles.td, fontFamily: "monospace", color: "#2563eb" }}>
                      {t.ID.slice(0, 8)}
                    </td>

                    <td style={styles.td}>
                      {t.Conversation?.Customer?.Name || "Customer"}
                    </td>

                    <td style={styles.td}>
                      {t.Title}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(statusColor[
                            status === "resolved"
                              ? "Resolved"
                              : status === "in_progress"
                              ? "Pending"
                              : "Open"
                          ] || {}),
                        }}
                      >
                        {status}
                      </span>
                    </td>

                    {/* <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(priorityColor[
                            priority === "high"
                              ? "High"
                              : priority === "medium"
                              ? "Medium"
                              : "Low"
                          ] || {}),
                        }}
                      >
                        {priority}
                      </span>
                    </td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
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

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
  },

  greeting: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },

  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
  },

  dateChip: {
    fontSize: "13px",
    color: "#475569",
    background: "#fff",
    padding: "8px 16px",
    borderRadius: "999px",
    border: "1px solid #e2e8f0",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  statCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },

  statLabel: {
    fontSize: "13px",
    color: "#64748b",
  },

  statValue: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#0f172a",
  },

  statIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },

  cardHeader: {
    marginBottom: "20px",
  },

  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    fontSize: "11px",
    color: "#94a3b8",
    paddingBottom: "10px",
  },

  tr: {
    borderBottom: "1px solid #f1f5f9",
  },

  td: {
    padding: "12px 0",
    fontSize: "13px",
  },

  badge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "999px",
  },
};