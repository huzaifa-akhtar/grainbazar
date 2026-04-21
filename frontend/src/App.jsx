/**
 * App.jsx — Root Component (FINAL VERSION)
 * Sets up all routes for GrainBazar.
 * CartProvider wraps everything so any page can access the cart.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider }      from "./context/CartContext";
import Navbar                from "./components/Navbar";
import ProductCatalog        from "./pages/ProductCatalog";       // Home - browse all grains
import ProductDetailPage     from "./pages/ProductDetailPage";    // Single grain + reviews
import CartCheckout          from "./pages/CartCheckout";         // Cart + COD / fake pay
import ConfirmationPage      from "./pages/ConfirmationPage";     // Order success
import MyOrders              from "./pages/MyOrders";             // Order history by email
import LoginRegisterPage     from "./pages/LoginRegisterPage";    // Register / Login
import "./App.css";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"              element={<ProductCatalog />} />
          <Route path="/products/:id"  element={<ProductDetailPage />} />
          <Route path="/cart"          element={<CartCheckout />} />
          <Route path="/confirmation"  element={<ConfirmationPage />} />
          <Route path="/my-orders"     element={<MyOrders />} />
          <Route path="/login"         element={<LoginRegisterPage />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
