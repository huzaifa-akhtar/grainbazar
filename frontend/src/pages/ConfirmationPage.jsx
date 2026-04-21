/**
 * ConfirmationPage.jsx — Order Success Screen
 * Updated to use new single-order API response structure.
 * Shows order items from order.items[], total from order.total_amount.
 *
 * Place in: frontend/src/pages/ConfirmationPage.jsx
 */
import { useLocation, useNavigate } from "react-router-dom";

export default function ConfirmationPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  // If user navigated here directly with no order state
  if (!state?.order) {
    return (
      <div className="page empty-cart">
        <div className="empty-cart-icon">📦</div>
        <h2>No order found</h2>
        <p>It looks like you arrived here by mistake.</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Go to Home</button>
      </div>
    );
  }

  const { order, customerName } = state;

  return (
    <div className="page confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">✅</div>
        <h1>Order Placed!</h1>
        <p className="confirmation-message">
          Thank you, <strong>{customerName}</strong>!{" "}
          {order.payment_method === "cod"
            ? "Your order is confirmed. Please have cash ready on delivery."
            : "Your demo payment was accepted. We'll process your order shortly!"}
        </p>

        {/* Order summary box */}
        <div className="order-summary">
          <h2>Order #{order.id} — Summary</h2>

          {order.items && order.items.map((item, i) => (
            <div key={i} className="summary-item">
              <span>{item.product_name}</span>
              <span>{item.quantity} kg × PKR {parseFloat(item.price).toLocaleString()}</span>
              <span><strong>PKR {(parseFloat(item.price) * item.quantity).toLocaleString()}</strong></span>
            </div>
          ))}

          <div className="summary-total">
            <strong>Grand Total: PKR {parseFloat(order.total_amount).toLocaleString()}</strong>
          </div>
        </div>

        <p className="order-id-note">
          📧 Remember your Order ID: <strong>#{order.id}</strong> —
          go to "My Orders" with your email to track delivery status.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
          <button
            className="btn"
            style={{ border: "2px solid #4a7c59", color: "#4a7c59", background: "white", padding: "0.5rem 1.25rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
            onClick={() => navigate("/my-orders")}
          >
            Track My Orders
          </button>
        </div>
      </div>
    </div>
  );
}
