import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { useWishlist } from "../context/WishlistContext";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const { wishlistItems } = useWishlist();

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (user && token) {
      fetchAddresses();
      fetchOrders();
    }
  }, [user, token]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get("/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(res.data);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    navigate("/login", { replace: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.email ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      setError("All fields are required");
      return;
    }

    try {
      if (editingAddress) {
        await api.put(
          `/addresses/${editingAddress.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await api.post("/addresses", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });
    } catch (err) {
      setError("Failed to save address");
      console.error(err);
    }
  };

  const handleEdit = (addr) => {
    setEditingAddress(addr);
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      email: addr.email,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setShowAddressForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAddresses();
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  // Dashboard Calculations
  const totalSpent = useMemo(() => {
    // Include all statuses EXCEPT "pending" and "cancelled"
    const validStatuses = ["placed", "ready", "out_for_delivery", "delivered"];
    const validOrders = orders.filter(o => validStatuses.includes(o.status.toLowerCase()));
    
    return validOrders.reduce((sum, order) => {
      const orderTotal = order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      return sum + orderTotal;
    }, 0);
  }, [orders]);

  const recentOrders = useMemo(() => {
    // Orders are already sorted by updatedAt desc from backend, just take top 3
    return orders.slice(0, 3);
  }, [orders]);

  const recentWishlist = useMemo(() => {
    return wishlistItems.slice(0, 4);
  }, [wishlistItems]);

  if (!user) {
    return <div className="ha-profile-loading">Loading profile...</div>;
  }

  return (
    <div className="ha-dashboard-page">
      <div className="ha-dashboard-container">
        <div className="ha-dashboard-header">
          <h1>My Account</h1>
          <p>Manage your orders, wishlist, addresses, and personal details.</p>
        </div>

        {/* STAT CARDS */}
        <div className="ha-dashboard-stats">
          <div className="ha-stat-card">
            <div className="ha-stat-icon" style={{ backgroundColor: '#e8f3ee', color: '#5C6B47' }}>₹</div>
            <div className="ha-stat-info">
              <h4>Total Spent</h4>
              <p>₹{totalSpent.toLocaleString()}</p>
            </div>
          </div>
          <div className="ha-stat-card">
            <div className="ha-stat-icon" style={{ backgroundColor: '#f3e8e8', color: '#8a4b4b' }}>📦</div>
            <div className="ha-stat-info">
              <h4>Total Orders</h4>
              <p>{orders.length}</p>
            </div>
          </div>
          <div className="ha-stat-card">
            <div className="ha-stat-icon" style={{ backgroundColor: '#e8ecf3', color: '#4b618a' }}>♡</div>
            <div className="ha-stat-info">
              <h4>Wishlist Items</h4>
              <p>{wishlistItems.length}</p>
            </div>
          </div>
        </div>

        <div className="ha-dashboard-grid">
          
          {/* LEFT COLUMN */}
          <div className="ha-dashboard-left">
            
            {/* PERSONAL INFO */}
            <section className="ha-dashboard-card ha-personal-info">
              <div className="ha-card-header">
                <h2>Personal Information</h2>
              </div>
              <div className="ha-card-body">
                <div className="ha-info-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="ha-info-details">
                  <h3>{user.name || "User"}</h3>
                  <p>{user.email}</p>
                </div>
                <button className="ha-btn-outline ha-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </section>

            {/* ACCOUNT SETTINGS */}
            <section className="ha-dashboard-card">
              <div className="ha-card-header">
                <h2>Account Settings</h2>
              </div>
              <div className="ha-card-body ha-settings-list">
                <a href="#" className="ha-settings-link" onClick={(e) => e.preventDefault()}>
                  <span>Change Password</span>
                  <span className="arrow">→</span>
                </a>
                <a href="#" className="ha-settings-link ha-danger-link" onClick={(e) => e.preventDefault()}>
                  <span>Delete Account</span>
                  <span className="arrow">→</span>
                </a>
              </div>
            </section>

            {/* ADDRESSES */}
            <section className="ha-dashboard-card">
              <div className="ha-card-header ha-flex-between">
                <h2>Saved Addresses</h2>
                <button
                  className="ha-btn-text"
                  onClick={() => {
                    setShowAddressForm(!showAddressForm);
                    setEditingAddress(null);
                    setFormData({
                      fullName: "", phone: "", email: "", address: "", city: "", state: "", pincode: "",
                    });
                  }}
                >
                  {showAddressForm ? "Cancel" : "+ Add New"}
                </button>
              </div>
              
              <div className="ha-card-body">
                {showAddressForm && (
                  <form className="ha-address-form" onSubmit={handleSubmitAddress}>
                    <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
                    {error && <p className="ha-error-msg">{error}</p>}
                    <div className="ha-form-grid">
                      <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} />
                      <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} />
                      <input name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
                      <input name="address" placeholder="Address (House No, Street)" value={formData.address} onChange={handleInputChange} />
                      <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
                      <input name="state" placeholder="State" value={formData.state} onChange={handleInputChange} />
                      <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleInputChange} />
                    </div>
                    <button type="submit" className="ha-btn-primary">
                      {editingAddress ? "Update Address" : "Save Address"}
                    </button>
                  </form>
                )}

                <div className="ha-address-list">
                  {loadingAddresses ? (
                    <p>Loading addresses...</p>
                  ) : addresses.length === 0 ? (
                    <p className="ha-no-data">No saved addresses found.</p>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr.id} className="ha-address-card">
                        <div className="ha-address-content">
                          <h4>{addr.fullName}</h4>
                          <p>{addr.address}</p>
                          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p>Phone: {addr.phone}</p>
                        </div>
                        <div className="ha-address-actions">
                          <button onClick={() => handleEdit(addr)} className="ha-btn-outline-small">Edit</button>
                          <button onClick={() => handleDelete(addr.id)} className="ha-btn-danger-small">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN */}
          <div className="ha-dashboard-right">
            
            {/* RECENT ORDERS */}
            <section className="ha-dashboard-card">
              <div className="ha-card-header ha-flex-between">
                <h2>Recent Orders</h2>
                <Link to="/orders" className="ha-view-all-link">View All →</Link>
              </div>
              <div className="ha-card-body">
                {loadingOrders ? (
                  <p>Loading orders...</p>
                ) : recentOrders.length === 0 ? (
                  <p className="ha-no-data">You haven't placed any orders yet.</p>
                ) : (
                  <div className="ha-recent-orders-list">
                    {recentOrders.map(order => {
                      const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      const firstItemImage = order.items[0]?.product?.imageUrl;
                      
                      return (
                        <div key={order.id} className="ha-compact-preview-card">
                          <div className="ha-preview-img-wrapper">
                            {firstItemImage ? (
                              <img src={firstItemImage} alt="Order item" className="ha-preview-img" />
                            ) : (
                              <div className="ha-preview-placeholder">📦</div>
                            )}
                          </div>
                          <div className="ha-preview-info">
                            <h4>Order #{order.id}</h4>
                            <p className="ha-preview-price">₹{orderTotal.toLocaleString()}</p>
                          </div>
                          <div className="ha-preview-status">
                            <span className={`ha-status-badge ha-status-${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* WISHLIST PREVIEW */}
            <section className="ha-dashboard-card">
              <div className="ha-card-header ha-flex-between">
                <h2>My Wishlist</h2>
                <Link to="/wishlist" className="ha-view-all-link">View Full Wishlist →</Link>
              </div>
              <div className="ha-card-body">
                {recentWishlist.length === 0 ? (
                  <p className="ha-no-data">Your wishlist is empty.</p>
                ) : (
                  <div className="ha-wishlist-preview-row">
                    {recentWishlist.map(item => (
                      <Link to={`/products/${item.product.id}`} key={item.id} className="ha-wishlist-preview-item">
                        <img src={item.product.imageUrl} alt={item.product.name} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
