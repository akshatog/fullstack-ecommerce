import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/wishlist");
      setWishlistItems(res.data);
    } catch (err) {
      console.error("Failed to load wishlist", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, []);

  const toggleWishlist = async (productId) => {
    try {
      const res = await api.post("/wishlist/toggle", { productId });
      
      if (res.data.wishlisted) {
        // Optimistically update if added
        setWishlistItems((prev) => [res.data.item, ...prev]);
      } else {
        // Optimistically update if removed
        setWishlistItems((prev) => prev.filter(item => item.productId !== productId));
      }
      return res.data;
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      throw err;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        fetchWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
