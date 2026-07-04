import React from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import ProductCardUser from "../components/ProductCardUser";
import "./Wishlist.css";

export default function Wishlist() {
  const { wishlistItems, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="ha-wishlist-page">
        <div className="ha-wishlist-container">
          <p style={{ textAlign: "center", padding: "4rem", color: "var(--color-primary)" }}>
            Loading your wishlist...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ha-wishlist-page">
      <div className="ha-wishlist-container">
        <div className="ha-wishlist-header">
          <h1 className="ha-wishlist-title">My Wishlist</h1>
          <p className="ha-wishlist-subtitle">
            {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved for later
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="ha-wishlist-empty">
            <div className="ha-wishlist-empty-icon">♡</div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love to your wishlist and they will show up here.</p>
            <button className="ha-btn-primary" onClick={() => navigate("/shop")}>
              Explore Products
            </button>
          </div>
        ) : (
          <div className="ha-wishlist-grid">
            {wishlistItems.map((item) => (
              <div key={item.id} className="ha-wishlist-item-wrapper">
                <ProductCardUser
                  product={item.product}
                  onProductClick={(id) => navigate(`/products/${id}`, { state: { product: item.product } })}
                  onAddToCart={() => addToCart(item.product)}
                  onViewDetails={(id) => navigate(`/products/${id}`, { state: { product: item.product } })}
                />
                <button 
                  className="ha-btn-outline ha-wishlist-remove-btn" 
                  onClick={() => toggleWishlist(item.product.id)}
                >
                  Remove from Wishlist
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
