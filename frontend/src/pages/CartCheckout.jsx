import API_URL from "../api.js";
/**
 * CartCheckout.jsx  (replaces CartPage.jsx)
 * UPDATED — Uses new Order API structure (one Order with multiple OrderItems).
 * Adds Cash on Delivery + Fake "Pay Online" button.
 * Pre-fills form from localStorage if customer is "logged in".
 *
 * Place at: frontend/src/pages/CartCheckout.jsx
 * Then update App.jsx to import this instead of CartPage.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";


export default function CartCheckout() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  // Pre-fill from localStorage if user registered/logged in
  const [formData, setFormData] = useState({
    customer_name:    localStorage.getItem("gb_name")    || "",
    customer_email:   localStorage.getItem("gb_email")   || "",
    customer_phone:   localStorage.getItem("gb_phone")   || "",
    customer_address: localStorage.getItem("gb_address") || "",
    payment_method:   "cod",
    notes:            "",
  });

  const [loading,     setLoading]    = useState(false);
  const [error,       setError]      = useState(null);
  const [fakePayStep, setFakePayStep] = useState(false);  // fake payment modal

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── Submit order to Django API ──
  const submitOrder = async (paymentMethod) => {
    setLoading(true); setError(null);

    // Build the payload matching PlaceOrderSerializer
    const payload = {
      customer_name:    formData.customer_name,
      customer_email:   formData.customer_email,
      customer_phone:   formData.customer_phone,
      customer_address: formData.customer_address,
      payment_method:   paymentMethod,
      notes:            formData.notes,
      items: cartItems.map(item => ({
        product_id: item.grain.id,  // note: 'grain' is our cart object's product field
        quantity:   item.quantity,
      })),
    };

    try {
      const res  = await fetch(`${API_URL}/orders/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || JSON.stringify(data));
      }

      // Save customer email for order history
      localStorage.setItem("gb_email",   formData.customer_email);
      localStorage.setItem("gb_name",    formData.customer_name);
      localStorage.setItem("gb_phone",   formData.customer_phone);
      localStorage.setItem("gb_address", formData.customer_address);

      clearCart();
      navigate("/confirmation", {
        state: { order: data, customerName: formData.customer_name }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setFakePayStep(false);
    }
  };

  const handleCOD     = e => { e.preventDefault(); submitOrder("cod"); };
  const handleFakePay = () => submitOrder("paid");

  // ── Empty cart state ──
  if (cartItems.length === 0) {
    return (
      <div className="page empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Go browse our grains and add something!</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 style={{ fontFamily: "'Playfair Display', serif", marginBottom: "1.5rem" }}>
        🛒 Your Cart & Checkout
      </h1>

      {/* Fake Payment Modal */}
      {fakePayStep && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>💳 Online Payment</h2>
            <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
              (Demo — no real payment processed)
            </p>
            <div className="form-group">
              <label>Card Number</label>
              <input type="text" placeholder="4111 1111 1111 1111" maxLength={19} />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Expiry</label>
                <input type="text" placeholder="MM/YY" maxLength={5} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>CVV</label>
                <input type="text" placeholder="123" maxLength={3} />
              </div>
            </div>
            <button className="btn btn-primary btn-large" onClick={handleFakePay} disabled={loading}>
              {loading ? "Processing..." : `Pay PKR ${cartTotal.toLocaleString()}`}
            </button>
            <button className="btn btn-outline btn-large" onClick={() => setFakePayStep(false)}
              style={{ marginTop: "0.5rem" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="cart-layout">
        {/* ── Cart Items ── */}
        <div className="cart-items">
          <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
            Items ({cartItems.length})
          </h2>

          {cartItems.map(item => (
            <div key={item.grain.id} className="cart-item">
              <img
                src={item.grain.image_url || `https://placehold.co/80x80/4a7c59/white?text=G`}
                alt={item.grain.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3>{item.grain.name}</h3>
                <p>PKR {parseFloat(item.grain.price).toLocaleString()} / kg</p>
              </div>
              <div className="cart-item-controls">
                <div className="quantity-controls small">
                  <button onClick={() => updateQuantity(item.grain.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity} kg</span>
                  <button onClick={() => updateQuantity(item.grain.id, item.quantity + 1)}>+</button>
                </div>
                <strong>PKR {(parseFloat(item.grain.price) * item.quantity).toLocaleString()}</strong>
                <button className="remove-btn" onClick={() => removeFromCart(item.grain.id)}>🗑️</button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <strong>Total: PKR {cartTotal.toLocaleString()}</strong>
          </div>
        </div>

        {/* ── Checkout Form ── */}
        <div className="checkout-form">
          <h2>Your Details</h2>
          {error && <div className="error">⚠️ {error}</div>}

          <form onSubmit={handleCOD}>
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="customer_name" placeholder="Ali Hassan"
                value={formData.customer_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" name="customer_email" placeholder="ali@example.com"
                value={formData.customer_email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="customer_phone" placeholder="03XX-XXXXXXX"
                value={formData.customer_phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Delivery Address</label>
              <textarea name="customer_address" placeholder="House #, Street, City"
                value={formData.customer_address} onChange={handleChange} rows={2} />
            </div>
            <div className="form-group">
              <label>Special Instructions</label>
              <textarea name="notes" placeholder="Any delivery notes..."
                value={formData.notes} onChange={handleChange} rows={2} />
            </div>

            {/* Payment buttons */}
            <div className="payment-buttons">
              <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                {loading ? "Placing Order..." : `🚚 Cash on Delivery (PKR ${cartTotal.toLocaleString()})`}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-large"
                style={{ marginTop: "0.5rem" }}
                onClick={() => setFakePayStep(true)}
                disabled={loading}
              >
                💳 Pay Online (Demo)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
