import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import AddProductForm from "../components/AddProductForm";
import OrderTrackingModal from "../components/OrderTrackingModal";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import "./products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { fetchProducts } = useProducts();

  useEffect(() => {
    const adminFlag = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(adminFlag);

    async function load() {
      try {
        const response = await fetchProducts(1, 1000);
        setProducts(response.products || response);
      } catch (err) {
        console.error("❌ Products fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchProducts]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    setShowAddForm(false);
  };

  const handleProductDeleted = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleStockUpdated = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: newStock } : p
      )
    );
  };

  const handleOrderClick = useCallback(async (productId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      await api.post(
        "/orders",
        { userId: user.id, items: [{ productId, quantity }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order placed successfully!");
      const response = await fetchProducts(1, 1000);
      setProducts(response.products || response);
    } catch (err) {
      alert("Failed to place order: " + (err.response?.data?.error || err.message));
    }
  }, [fetchProducts]);

  if (loading) {
    return (
      <div className="ha-products-page">
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-500)' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="ha-products-page">
      <div className="page-title-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--gray-900)' }}>
              {isAdmin ? "Admin Dashboard" : "Products Showcase"}
            </h2>
            <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
              {isAdmin
                ? "Manage your product catalog and track orders."
                : "Discover our latest beautiful collection."}
            </p>
          </div>
          
          <button onClick={handleLogout} className="ha-btn-pill ha-btn-outline" style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}>
            Logout
          </button>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/admin/analytics" className="ha-btn-pill ha-btn-outline">
              📊 Analytics
            </Link>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="ha-btn-pill ha-btn-solid"
            >
              {showAddForm ? "✕ Close Form" : "➕ Add Product"}
            </button>
            <button
              onClick={() => setShowOrderModal(true)}
              className="ha-btn-pill ha-btn-outline"
            >
              📦 Track Orders
            </button>
          </div>
        )}
      </div>

      {isAdmin && showAddForm && (
        <div style={{ marginBottom: '2rem' }}>
          <AddProductForm onProductAdded={handleProductAdded} />
        </div>
      )}

      {isAdmin && (
        <OrderTrackingModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
        />
      )}

      <div className="ha-shop-layout">
        <div className="ha-shop-main-content">
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-500)', fontSize: '1.2rem' }}>
              {isAdmin
                ? "No products yet. Click 'Add Product' to get started!"
                : "No products found."}
            </div>
          ) : (
            <div className="ha-products-grid">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isAdmin={isAdmin}
                  loading={loading}
                  onOrderClick={handleOrderClick}
                  onProductDeleted={handleProductDeleted}
                  onStockUpdated={handleStockUpdated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
