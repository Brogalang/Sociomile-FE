import { logout } from "../services/authService";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const initials = getInitials(user?.email);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", roles: ["admin", "agent", "developer"] },
    { label: "Conversations", path: "/conversations", roles: ["admin", "agent"] },
    { label: "Tickets", path: "/tickets", roles: ["admin", "agent", "developer"] },
  ];
  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );
  return (
    <nav style={styles.navbar}>
      <div style={styles.brand}>
        <div style={styles.brandIcon}>S</div>
        <span style={styles.brandName}>Sociomile</span>
      </div>

      <div style={styles.menu}>
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              }}
            >
              <span style={styles.linkIcon}>{item.icon}</span>
              {item.label}
              {isActive && <span style={styles.activeDot} />}
            </Link>
          );
        })}
      </div>

      <div style={styles.right}>
        <div style={styles.avatar}>{initials}</div>
        <button onClick={logout} style={styles.logout}>
          <span>↩</span> Logout
        </button>
      </div>
    </nav>
  );
}
const getInitials = (email) => {
  if (!email) return "U";

  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);

  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 32px",
    height: "64px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    boxShadow: "0 4px 24px rgba(37, 99, 235, 0.35)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "16px",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
  },
  brandName: {
    fontFamily: "'Georgia', serif",
    fontWeight: "700",
    fontSize: "20px",
    color: "#fff",
    letterSpacing: "0.02em",
  },
  menu: {
    display: "flex",
    gap: "4px",
  },
  link: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "rgba(255,255,255,0.75)",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'Trebuchet MS', sans-serif",
    transition: "all 0.2s ease",
    letterSpacing: "0.02em",
  },
  linkActive: {
    color: "#fff",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(4px)",
  },
  linkIcon: {
    fontSize: "15px",
  },
  activeDot: {
    position: "absolute",
    bottom: "4px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: "#93c5fd",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#fff",
    border: "2px solid rgba(255,255,255,0.3)",
  },
  logout: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(239,68,68,0.85)",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "7px 14px",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'Trebuchet MS', sans-serif",
    backdropFilter: "blur(4px)",
    transition: "all 0.2s ease",
  },
};

export default Navbar;