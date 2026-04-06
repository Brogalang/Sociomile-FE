import { useState } from "react";
import { login } from "../services/authService";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      await login(email, password);

      window.location.href = "/dashboard";

    } catch {

      setError("Email atau password salah");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div style={styles.container}>

      <div style={styles.card}>

        <h2 style={styles.title}>Login</h2>

        <form onSubmit={handleLogin}>

          <div style={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}

const styles = {

  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6"
  },

  card: {
    width: "350px",
    padding: "30px",
    borderRadius: "8px",
    background: "#fff",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
  },

  title: {
    textAlign: "center",
    marginBottom: "20px"
  },

  formGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column"
  },

  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginTop: "5px"
  },

  button: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer"
  },

  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px"
  }

};

export default Login;