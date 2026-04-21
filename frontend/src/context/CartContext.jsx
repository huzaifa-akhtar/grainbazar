/**
 * CartContext.jsx
 * Global state for the shopping cart using React Context API.
 * Wrap your app with <CartProvider> to give all components access to cart data.
 */
import { createContext, useContext, useState } from "react";

// Create the context
const CartContext = createContext();

// Custom hook to use the cart from any component
export function useCart() {
  return useContext(CartContext);
}

// Provider component - wraps the whole app
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]); // Array of { grain, quantity }

  // Add a grain to cart (or increase quantity if already in cart)
  const addToCart = (grain, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.grain.id === grain.id);
      if (existing) {
        // Item already in cart - update quantity
        return prev.map((item) =>
          item.grain.id === grain.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // New item - add to cart
      return [...prev, { grain, quantity }];
    });
  };

  // Remove an item completely from cart
  const removeFromCart = (grainId) => {
    setCartItems((prev) => prev.filter((item) => item.grain.id !== grainId));
  };

  // Update quantity of an item in cart
  const updateQuantity = (grainId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(grainId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.grain.id === grainId ? { ...item, quantity } : item
      )
    );
  };

  // Clear entire cart (after order is placed)
  const clearCart = () => setCartItems([]);

  // Calculate total price of all items in cart
  const cartTotal = cartItems.reduce(
    (total, item) => total + parseFloat(item.grain.price) * item.quantity,
    0
  );

  // Total number of items in cart (for badge on nav icon)
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
}
