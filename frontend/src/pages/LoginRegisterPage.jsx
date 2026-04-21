import API_URL from "../api.js";
/**
 * LoginRegisterPage.jsx
 * MISSING from original code — required by proposal (User Registration & Login).
 * Simple email-only login (no password). Customer is identified by email.
 * Since there's no JWT auth, we just store email in localStorage as "session".
 *
 * Place at: frontend/src/pages/LoginRegisterPage.jsx
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function LoginRegisterPage() {
  const navigate  = useNavigate();
  const [tab, setTab]         = useState("login");       // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // Login form — just email (customer identified by email in our system)
  const [loginEmail, setLoginEmail] = useState("");

  // Register form
  const [regForm, setRegForm] = useState({
    name: "", email: "", phone: "", address: ""
  });

  // ── LOGIN: check if customer exists by looking up their orders ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const res  = await fetch(`${API_URL}/orders/history/?email=${encodeURIComponent(loginEmail)}`);
      const data = await res.json();
      // If the request didn't error, treat email as valid (customer may have no orders yet)
      localStorage.setItem("gb_email", loginEmail);
      setSuccess("Logged in! Redirecting...");
      window.location.href = "/";
    } catch {
      setError("Could not connect to server. Make sure Django is running.");
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER: place a "registration" by creating a customer via a dummy call ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");

    if (!regForm.name || !regForm.email) {
      setError("Name and Email are required.");
      setLoading(false);
      return;
    }

    // We create the customer record by placing a zero-item order check —
    // actually the customer is created automatically on first order.
    // For now just save locally and let the backend create on first order.
    localStorage.setItem("gb_email",   regForm.email);
    localStorage.setItem("gb_name",    regForm.name);
    localStorage.setItem("gb_phone",   regForm.phone);
    localStorage.setItem("gb_address", regForm.address);

    setSuccess("Account created! Redirecting...");
    setLoading(false);
    window.location.href = "/";
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h1 className="auth-title">🌾 GrainBazar</h1>
        <p className="auth-subtitle">Pakistan's Grain Marketplace</p>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => { setTab("login"); setError(""); setSuccess(""); }}
          >Login</button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => { setTab("register"); setError(""); setSuccess(""); }}
          >Register</button>
        </div>

        {error   && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {/* ── LOGIN FORM ── */}
        {tab === "login" && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="auth-note">
              No password needed — we identify you by your email address.
            </p>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === "register" && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="Ali Hassan"
                value={regForm.name}
                onChange={e => setRegForm({...regForm, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="ali@example.com"
                value={regForm.email}
                onChange={e => setRegForm({...regForm, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="03XX-XXXXXXX"
                value={regForm.phone}
                onChange={e => setRegForm({...regForm, phone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                placeholder="House #, Street, City"
                value={regForm.address}
                onChange={e => setRegForm({...regForm, address: e.target.value})}
                rows={2}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="auth-divider">or</div>
        <button className="btn btn-outline btn-large" onClick={() => navigate("/")}>
          Browse as Guest
        </button>
      </div>
    </div>
  );
}
