import API_URL from "../api.js";
/**
 * MyOrders.jsx  — Order History Page
 * Proposal Use Case 3.3.7: "View Order History"
 * Customer enters email to see all their past orders + item breakdown.
 *
 * Place in: frontend/src/pages/MyOrders.jsx
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const STATUS_COLORS = {
  pending:   { background: "#fef3c7", color: "#92400e" },
  confirmed: { background: "#dbeafe", color: "#1e40af" },
  delivered: { background: "#d1fae5", color: "#065f46" },
  cancelled: { background: "#fee2e2", color: "#991b1b" },
};

export default function MyOrders() {
  const navigate = useNavigate();
  // Pre-fill from localStorage if they logged in / checked out before
  const [email,   setEmail]   = useState(localStorage.getItem("gb_email") || "");
  const [orders,  setOrders]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Auto-fetch on mount if email is already known
  useEffect(() => {
    if (email) fetchOrders(email);
  }, []);

  const fetchOrders = async (emailToSearch) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_URL}/orders/history/?email=${encodeURIComponent(emailToSearch)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not fetch orders.");
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (email.trim()) fetchOrders(email.trim());
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate("/")}>← Back to Shop</button>
      <h1 style={{ fontFamily: "'Playfair Display', serif", marginBottom: "0.5rem" }}>
        📦 My Orders
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
        Enter the email you used at checkout to see your order history.
      </p>

      {/* Email lookup form */}
      <form onSubmit={handleSubmit}
        style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <input
          type="email"
          className="search-input"
          style={{ borderRadius: "8px", maxWidth: "380px", flex: 1 }}
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" style={{ padding: "0.65rem 1.5rem" }}>
          {loading ? "Searching…" : "Find Orders"}
        </button>
      </form>

      {error && <div className="error">⚠️ {error}. Make sure Django backend is running!</div>}

      {/* No results */}
      {orders !== null && orders.length === 0 && !loading && (
        <div style={{ color: "#6b7280", padding: "2rem 0" }}>
          No orders found for <strong>{email}</strong>. Try placing your first order!
        </div>
      )}

      {/* Orders list */}
      {orders && orders.length > 0 && orders.map(order => {
        const sc = STATUS_COLORS[order.status] || {};
        return (
          <div key={order.id} className="cart-items" style={{ marginBottom: "1.25rem" }}>

            {/* Order header row */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem"
            }}>
              <div>
                <strong>Order #{order.id}</strong>
                <span style={{ color: "#6b7280", fontSize: "0.85rem", marginLeft: "0.75rem" }}>
                  {new Date(order.order_date).toLocaleDateString("en-PK", { dateStyle: "medium" })}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{
                  padding: "0.2rem 0.75rem", borderRadius: "50px",
                  fontSize: "0.8rem", fontWeight: 600, ...sc
                }}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {order.payment_method === "cod" ? "🚚 Cash on Delivery" : "💳 Online (Demo)"}
                </span>
              </div>
            </div>

            {/* Line items */}
            {order.items.map(item => (
              <div key={item.id} className="cart-item" style={{ padding: "0.6rem 0" }}>
                <div className="cart-item-info">
                  <h3 style={{ fontSize: "0.95rem" }}>{item.product_name}</h3>
                  <p style={{ fontSize: "0.82rem" }}>
                    {item.quantity} kg × PKR {parseFloat(item.price).toLocaleString()}
                  </p>
                </div>
                <strong>
                  PKR {(parseFloat(item.price) * item.quantity).toLocaleString()}
                </strong>
              </div>
            ))}

            {/* Order total */}
            <div className="cart-total">
              Order Total: <strong>PKR {parseFloat(order.total_amount).toLocaleString()}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}
