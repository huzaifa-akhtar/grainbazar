import API_URL from "../api.js";
/**
 * ProductDetailPage.jsx  (replaces GrainDetailPage.jsx)
 * UPDATED — Fetches from /api/products/<id>/, shows reviews + review form.
 * Proposal Use Case 3.3.8 — Customer Reviews & Ratings.
 *
 * Place at: frontend/src/pages/ProductDetailPage.jsx
 * Then update App.jsx route.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";


function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "4px", fontSize: "1.5rem", cursor: "pointer" }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onClick={() => onChange(n)}
          style={{ color: n <= value ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { addToCart } = useCart();

  const [product,  setProduct]  = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Review form
  const [reviewForm, setReviewForm] = useState({
    customer_email: localStorage.getItem("gb_email") || "",
    rating:         5,
    comment:        "",
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg,     setReviewMsg]     = useState("");

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res  = await fetch(`${API_URL}/products/${id}/`);
      if (!res.ok) throw new Error("Product not found");
      setProduct(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res  = await fetch(`${API_URL}/products/${id}/reviews/`);
      setReviews(await res.json());
    } catch {}
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${quantity} kg of ${product.name} added to cart!`);
    navigate("/cart");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true); setReviewMsg("");
    try {
      const res  = await fetch(`${API_URL}/products/${id}/reviews/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit review");
      setReviewMsg("✅ Review submitted!");
      setReviews(prev => [data, ...prev]);
      setReviewForm({ ...reviewForm, comment: "" });
    } catch (err) {
      setReviewMsg(`❌ ${err.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading product...</div>;
  if (error)   return <div className="error page">⚠️ {error}</div>;
  if (!product) return null;

  const imageUrl = product.image_url || `https://placehold.co/600x300/4a7c59/white?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {/* Product Info */}
      <div className="detail-container">
        <img src={imageUrl} alt={product.name} className="detail-image" />
        <div className="detail-info">
          <span className="grain-category">{product.category_name}</span>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>

          <div className="detail-price">PKR {parseFloat(product.price).toLocaleString()} / kg</div>

          {/* Rating summary */}
          {product.avg_rating && (
            <p style={{ marginBottom: "0.5rem", color: "#f59e0b" }}>
              {"★".repeat(Math.round(product.avg_rating))}{"☆".repeat(5 - Math.round(product.avg_rating))}
              {" "}<span style={{ color: "#6b7280" }}>({product.review_count} reviews)</span>
            </p>
          )}

          <div className={`detail-stock ${product.stock_quantity === 0 ? "out-of-stock" : ""}`}>
            {product.stock_quantity > 0 ? `✅ ${product.stock_quantity} kg available` : "❌ Out of Stock"}
          </div>

          {product.stock_quantity > 0 && (
            <div className="quantity-section">
              <label>Quantity (kg):</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input type="number" value={quantity} min="1" max={product.stock_quantity}
                  onChange={e => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))} />
                <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}>+</button>
              </div>
              <div className="subtotal">
                Subtotal: <strong>PKR {(parseFloat(product.price) * quantity).toLocaleString()}</strong>
              </div>
              <button className="btn btn-primary btn-large" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Customer Reviews</h2>

        {/* Submit review form */}
        <div className="review-form-card">
          <h3>Leave a Review</h3>
          {reviewMsg && (
            <div className={reviewMsg.startsWith("✅") ? "success" : "error"} style={{ marginBottom: "1rem" }}>
              {reviewMsg}
            </div>
          )}
          <form onSubmit={handleReviewSubmit}>
            <div className="form-group">
              <label>Your Email *</label>
              <input type="email" placeholder="your@email.com"
                value={reviewForm.customer_email}
                onChange={e => setReviewForm({...reviewForm, customer_email: e.target.value})}
                required />
              <small style={{ color: "#6b7280" }}>You must have placed an order to leave a review.</small>
            </div>
            <div className="form-group">
              <label>Rating *</label>
              <StarPicker value={reviewForm.rating}
                onChange={r => setReviewForm({...reviewForm, rating: r})} />
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea rows={3} placeholder="Share your experience..."
                value={reviewForm.comment}
                onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={reviewLoading}>
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        {/* Reviews list */}
        {reviews.length === 0
          ? <p style={{ color: "#6b7280" }}>No reviews yet. Be the first!</p>
          : reviews.map(r => (
            <div key={r.id} className="review-card">
              <div className="review-header">
                <strong>{r.customer_name}</strong>
                <span style={{ color: "#f59e0b" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.comment && <p className="review-comment">{r.comment}</p>}
            </div>
          ))
        }
      </div>
    </div>
  );
}
