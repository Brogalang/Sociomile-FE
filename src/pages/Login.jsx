import { useState } from "react";
import { login } from "../services/authService";

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    fontFamily: "'DM Sans', sans-serif",
    background: "#f3f4f6",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    border: "0.5px solid #e5e7eb",
    borderRadius: "20px",
    padding: "2.5rem 2rem 2rem",
    position: "relative",
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #378ADD, #1D9E75, #7F77DD)",
    borderRadius: "20px 20px 0 0",
  },
  brandMark: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "1.75rem",
  },
  brandIcon: {
    width: "36px",
    height: "36px",
    background: "#E6F1FB",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.3px",
  },
  heading: {
    fontSize: "22px",
    fontWeight: 500,
    color: "#111827",
    margin: "0 0 6px",
    letterSpacing: "-0.4px",
  },
  subheading: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 1.75rem",
  },
  field: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "#6b7280",
    marginBottom: "6px",
    letterSpacing: "0.2px",
  },
  inputWrap: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "16px",
    height: "16px",
    color: "#9ca3af",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    height: "42px",
    padding: "0 12px 0 38px",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    border: "0.5px solid #d1d5db",
    borderRadius: "10px",
    background: "#f9fafb",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  forgotWrap: {
    textAlign: "right",
    marginTop: "6px",
  },
  forgotLink: {
    fontSize: "12px",
    color: "#378ADD",
    textDecoration: "none",
  },
  errorMsg: {
    fontSize: "13px",
    color: "#b91c1c",
    margin: "-4px 0 12px",
    padding: "10px 12px",
    background: "#fef2f2",
    borderRadius: "8px",
    border: "0.5px solid #fca5a5",
  },
  btnLogin: {
    width: "100%",
    height: "44px",
    background: "#185FA5",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    marginTop: "1.25rem",
    letterSpacing: "0.1px",
    transition: "background 0.2s",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "1.25rem 0",
  },
  dividerLine: {
    flex: 1,
    border: "none",
    borderTop: "0.5px solid #e5e7eb",
    margin: 0,
  },
  dividerText: {
    fontSize: "12px",
    color: "#9ca3af",
    whiteSpace: "nowrap",
  },
  btnPublic: {
    width: "100%",
    height: "44px",
    background: "#f9fafb",
    color: "#111827",
    border: "0.5px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background 0.2s",
    boxSizing: "border-box",
  },
  publicBadge: {
    display: "inline-block",
    background: "#EAF3DE",
    color: "#3B6D11",
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 7px",
    borderRadius: "20px",
    letterSpacing: "0.4px",
  },
  registerRow: {
    textAlign: "center",
    marginTop: "1.25rem",
    fontSize: "13px",
    color: "#6b7280",
  },
  registerLink: {
    color: "#378ADD",
    textDecoration: "none",
    fontWeight: 500,
  },
};

function IconMail() {
  return (
    <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

function IconLock() {
  return (
    <svg style={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function IconLayers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch {
      setError("Email atau password salah. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublicChat = () => {
    window.location.href = "/chat-publik";
  };

  const focusStyle = {
    borderColor: "#378ADD",
    boxShadow: "0 0 0 3px rgba(55, 138, 221, 0.12)",
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700&display=swap" rel="stylesheet" />
      <div style={styles.root}>
        <div style={styles.card}>
          <div style={styles.accentBar} />

          <div style={styles.brandMark}>
            <div style={styles.brandIcon}>
              <IconLayers />
            </div>
            <span style={styles.brandName}>Workspace</span>
          </div>

          <h1 style={styles.heading}>Selamat datang kembali</h1>
          <p style={styles.subheading}>Masuk ke akun Anda untuk melanjutkan</p>

          <form onSubmit={handleLogin}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="email">Email</label>
              <div style={styles.inputWrap}>
                <IconMail />
                <input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  style={{ ...styles.input, ...(emailFocus ? focusStyle : {}) }}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label} htmlFor="password">Password</label>
              <div style={styles.inputWrap}>
                <IconLock />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  style={{ ...styles.input, ...(passwordFocus ? focusStyle : {}) }}
                />
              </div>
              {/* <div style={styles.forgotWrap}>
                <a href="/forgot-password" style={styles.forgotLink}>Lupa password?</a>
              </div> */}
            </div>

            {error && <p style={styles.errorMsg}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.btnLogin,
                background: loading ? "#9ca3af" : "#185FA5",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div style={styles.divider}>
            <hr style={styles.dividerLine} />
            <span style={styles.dividerText}>atau</span>
            <hr style={styles.dividerLine} />
          </div>

          <button style={styles.btnPublic} onClick={handlePublicChat}>
            <IconChat />
            Chat Publik
            <span style={styles.publicBadge}>GRATIS</span>
          </button>

          {/* <div style={styles.registerRow}>
            Belum punya akun?{" "}
            <a href="/register" style={styles.registerLink}>Daftar sekarang</a>
          </div> */}
        </div>
      </div>
    </>
  );
}