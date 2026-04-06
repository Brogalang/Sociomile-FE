import Navbar from "../components/Navbar";

const stats = [
  {
    label: "Total Conversations",
    value: "1,284",
    change: "+12%",
    up: true,
    icon: "💬",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    label: "Open Tickets",
    value: "47",
    change: "-5%",
    up: false,
    icon: "🎫",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    label: "Resolved Today",
    value: "93",
    change: "+8%",
    up: true,
    icon: "✅",
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    label: "Avg. Response Time",
    value: "3.2m",
    change: "-18%",
    up: true,
    icon: "⚡",
    color: "#d97706",
    bg: "#fffbeb",
  },
];

const recentTickets = [
  { id: "#TK-1041", customer: "Budi Santoso", subject: "Masalah login akun", status: "Open", priority: "High", time: "2 min ago" },
  { id: "#TK-1040", customer: "Siti Rahayu", subject: "Request refund pembelian", status: "Pending", priority: "Medium", time: "15 min ago" },
  { id: "#TK-1039", customer: "Ahmad Fauzi", subject: "Notifikasi tidak muncul", status: "Resolved", priority: "Low", time: "1 hr ago" },
  { id: "#TK-1038", customer: "Dewi Kusuma", subject: "Error saat checkout", status: "Open", priority: "High", time: "2 hr ago" },
  { id: "#TK-1037", customer: "Rizky Pratama", subject: "Update info profil", status: "Resolved", priority: "Low", time: "3 hr ago" },
];

const channels = [
  { name: "WhatsApp", count: 524, color: "#25d366", pct: 72 },
  { name: "Email", count: 318, color: "#2563eb", pct: 44 },
  { name: "Instagram", count: 241, color: "#e1306c", pct: 33 },
  { name: "Live Chat", count: 201, color: "#7c3aed", pct: 28 },
];

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
  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.greeting}>Good morning, Admin 👋</p>
            <h1 style={styles.title}>Omnichannel Dashboard</h1>
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

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} style={styles.statCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={styles.statLabel}>{s.label}</p>
                  <p style={styles.statValue}>{s.value}</p>
                </div>
                <div style={{ ...styles.statIcon, background: s.bg, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <div style={styles.statFooter}>
                <span
                  style={{
                    ...styles.statChange,
                    color: s.up ? "#059669" : "#dc2626",
                    background: s.up ? "#dcfce7" : "#fee2e2",
                  }}
                >
                  {s.up ? "▲" : "▼"} {s.change}
                </span>
                <span style={styles.statPeriod}>vs last week</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div style={styles.bottomGrid}>
          {/* Recent Tickets */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>🎫 Recent Tickets</h2>
              <button style={styles.viewAll}>View All →</button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["ID", "Customer", "Subject", "Status", "Priority", "Time"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => (
                  <tr key={t.id} style={styles.tr}>
                    <td style={{ ...styles.td, color: "#2563eb", fontWeight: "600", fontFamily: "monospace" }}>{t.id}</td>
                    <td style={styles.td}>{t.customer}</td>
                    <td style={{ ...styles.td, color: "#64748b", maxWidth: "160px" }}>{t.subject}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...statusColor[t.status] }}>{t.status}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...priorityColor[t.priority] }}>{t.priority}</span>
                    </td>
                    <td style={{ ...styles.td, color: "#94a3b8", fontSize: "12px" }}>{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Channel Overview */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>📡 Channel Overview</h2>
              <span style={styles.periodTag}>This month</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "8px" }}>
              {channels.map((ch) => (
                <div key={ch.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{ch.name}</span>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>{ch.count.toLocaleString()} msgs</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${ch.pct}%`,
                        background: ch.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div style={styles.quickStats}>
              <div style={styles.quickStat}>
                <p style={styles.qsVal}>98.2%</p>
                <p style={styles.qsLabel}>Uptime</p>
              </div>
              <div style={styles.qsDivider} />
              <div style={styles.quickStat}>
                <p style={styles.qsVal}>4.8⭐</p>
                <p style={styles.qsLabel}>Satisfaction</p>
              </div>
              <div style={styles.qsDivider} />
              <div style={styles.quickStat}>
                <p style={styles.qsVal}>12</p>
                <p style={styles.qsLabel}>Agents Online</p>
              </div>
            </div>
          </div>
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
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "32px 24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "12px",
  },
  greeting: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
    marginBottom: "4px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.5px",
  },
  dateChip: {
    fontSize: "13px",
    color: "#475569",
    background: "#fff",
    padding: "8px 16px",
    borderRadius: "999px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
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
    border: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  statLabel: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
    marginBottom: "6px",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "30px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-1px",
  },
  statIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  statFooter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statChange: {
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "999px",
  },
  statPeriod: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "20px",
    alignItems: "start",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  viewAll: {
    fontSize: "13px",
    color: "#2563eb",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    padding: 0,
  },
  periodTag: {
    fontSize: "12px",
    color: "#64748b",
    background: "#f8fafc",
    padding: "4px 10px",
    borderRadius: "999px",
    border: "1px solid #e2e8f0",
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
    letterSpacing: "0.06em",
    padding: "0 12px 10px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  tr: {
    borderBottom: "1px solid #f8fafc",
  },
  td: {
    padding: "12px 12px 12px 0",
    fontSize: "13px",
    color: "#1e293b",
    verticalAlign: "middle",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 9px",
    borderRadius: "999px",
  },
  barTrack: {
    height: "8px",
    background: "#f1f5f9",
    borderRadius: "999px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.6s ease",
  },
  quickStats: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "28px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
  },
  quickStat: {
    textAlign: "center",
  },
  qsVal: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    marginBottom: "2px",
  },
  qsLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "600",
  },
  qsDivider: {
    width: "1px",
    background: "#e2e8f0",
  },
};