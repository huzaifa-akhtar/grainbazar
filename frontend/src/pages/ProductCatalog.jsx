import API_URL from "../api.js";
/**
 * ProductCatalog.jsx  (replaces HomePage.jsx)
 * UPDATED — Now uses /api/products/ and /api/categories/ endpoints,
 * matching the new models (Product + Category instead of Grain).
 * Adds search, category filter, and star ratings display.
 *
 * Place at: frontend/src/pages/ProductCatalog.jsx
 * Then update App.jsx to import this instead of HomePage.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";


function StarRating({ rating, count }) {
  if (!rating) return <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>No reviews yet</span>;
  return (
    <span style={{ fontSize: "0.85rem", color: "#f59e0b" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      <span style={{ color: "#6b7280", marginLeft: "4px" }}>({count})</span>
    </span>
  );
}

function ProductCard({ product }) {
  const navigate      = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  const imageUrl = product.image_url || `https://placehold.co/300x200/4a7c59/white?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="grain-card" onClick={() => navigate(`/products/${product.id}`)}>
      <img src={imageUrl} alt={product.name} className="grain-card-image" />
      <div className="grain-card-body">
        <span className="grain-category">{product.category_name || "Grain"}</span>
        <h3 className="grain-name">{product.name}</h3>
        <StarRating rating={product.avg_rating} count={product.review_count} />
        <p className="grain-description" style={{ marginTop: "0.4rem" }}>
          {product.description.substring(0, 80)}...
        </p>
        <div className="grain-footer">
          <div>
            <span className="grain-price">PKR {parseFloat(product.price).toLocaleString()}/kg</span>
            <span className={`grain-stock ${product.stock_quantity === 0 ? "out-of-stock" : ""}`}>
              {product.stock_quantity > 0 ? `${product.stock_quantity} kg in stock` : "Out of Stock"}
            </span>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
          >
            {product.stock_quantity > 0 ? "Add to Cart" : "Sold Out"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductCatalog() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [selectedCat, setSelectedCat] = useState("");   // empty = all
  const [searchTerm,  setSearchTerm]  = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input by 400ms so we don't hammer the API
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch categories once
  useEffect(() => {
    fetch(`${API_URL}/categories/`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Fetch products when filter/search changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCat, debouncedSearch]);

  const fetchProducts = async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCat)      params.set("category", selectedCat);
      if (debouncedSearch)  params.set("search",   debouncedSearch);

      const res  = await fetch(`${API_URL}/products/?${params}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <h1>🌾 Fresh Grains, Direct to You</h1>
        <p>Quality grains sourced directly from farmers across Pakistan</p>
        <input
          type="text"
          className="search-input"
          placeholder="Search grains (e.g. Basmati, Wheat)..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="category-filters">
        <button
          className={`filter-btn ${selectedCat === "" ? "active" : ""}`}
          onClick={() => setSelectedCat("")}
        >All</button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-btn ${selectedCat === String(cat.id) ? "active" : ""}`}
            onClick={() => setSelectedCat(String(cat.id))}
          >{cat.name}</button>
        ))}
      </div>

      {/* Grid */}
      {loading && <div className="loading">Loading products...</div>}
      {error   && (
        <div className="error">
          ⚠️ {error}. <br />
          Make sure Django backend is running: <code>python manage.py runserver</code>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="results-count">{products.length} product{products.length !== 1 ? "s" : ""} found</p>
          <div className="grain-grid">
            {products.length > 0
              ? products.map(p => <ProductCard key={p.id} product={p} />)
              : <div className="no-results">No products found. Try a different search.</div>
            }
          </div>
        </>
      )}
    </div>
  );
}
