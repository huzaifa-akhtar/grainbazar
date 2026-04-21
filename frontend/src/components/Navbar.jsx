/**
 * Navbar.jsx — Top Navigation (FINAL VERSION)
 * Uses useState so login/logout state shows immediately without page reload.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const navigate      = useNavigate();

  // Read from localStorage into state so updates are reactive
  const [userName,  setUserName]  = useState(localStorage.getItem("gb_name")  || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("gb_email") || "");

  const handleLogout = () => {
    localStorage.removeItem("gb_name");
    localStorage.removeItem("gb_email");
    localStorage.removeItem("gb_phone");
    localStorage.removeItem("gb_address");
    setUserName("");
    setUserEmail("");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/")}>
        🌾 GrainBazar
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/my-orders">My Orders</Link>

        {userEmail ? (
          <div className="navbar-user">
            <span className="navbar-username">
              👤 {userName || userEmail.split("@")[0]}
            </span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Link to="/login">Login / Register</Link>
        )}

        <Link to="/cart" className="cart-link">
          🛒 Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
      </div>
    </nav>
  );
}
