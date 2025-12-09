import React, { useEffect, useState } from "react";
import axios from "../utils/axios.js";
import useAuth from "../context/context.jsx";
import "../styles/EditShopTab.css";

export default function EditShopTab() {
  const { userInfo } = useAuth();
  const [shop, setShop] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchShop = async () => {
    try {
        const res = await axios.get(`/shop/getShop/${userInfo.shopId}`);

        const s = res.data.shop;

        setShop({
        shopName: s.shopName || "",
        currency: s.currency || "",
        phone: s.contactInfo?.phone || "",
        email: s.contactInfo?.email || "",
        street: s.address?.street || "",
        city: s.address?.city || "",
        state: s.address?.state || "",
        pincode: s.address?.pincode || "",
        logLimit: s.logLimit || 1000,
        });
    } catch (err) {
        console.error("Failed to fetch shop details", err);
    }
  };

  useEffect(() => {
    if (userInfo?.shopId) fetchShop();
  }, [userInfo?.shopId]);

  const handleChange = (e) => {
    setShop({ ...shop, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSave = async () => {
    try {
        setSaving(true);

        const payload = {
            shopName: shop.shopName,
            currency: shop.currency,
            phone: shop.phone,
            email: shop.email,

            street: shop.street,
            city: shop.city,
            state: shop.state,
            pincode: shop.pincode,

            logLimit: shop.logLimit,
        };

        const res = await axios.put(`/shop/updateShop/${userInfo.shopId}`, payload);

        if (res.data.success) {
        setMessage("Shop updated successfully");
        } else {
        setMessage("Error updating shop");
        }
    } catch (err) {
        setMessage("Error saving changes");
    } finally {
        setSaving(false);
    }
  };

  if (!shop) return <p className="loading-container">Loading shop details...</p>;

  return (
    <div className="edit-shop-container">

        <h2 className="edit-shop-title">Edit Shop</h2>

        <div className="edit-shop-card">

        <div className="edit-shop-grid-2">
            <div className="edit-shop-form-group">
            <label>Shop Name *</label>
            <input type="text" name="shopName" value={shop.shopName} onChange={handleChange} />
            </div>

            <div className="edit-shop-form-group">
            <label>Currency *</label>
            <input type="text" name="currency" value={shop.currency} onChange={handleChange} />
            </div>
        </div>

        <h3 className="edit-shop-subtitle">Contact Information</h3>

        <div className="edit-shop-grid-2">
            <div className="edit-shop-form-group">
            <label>Phone *</label>
            <input type="text" name="phone" value={shop.phone} onChange={handleChange} />
            </div>

            <div className="edit-shop-form-group">
            <label>Email *</label>
            <input type="email" name="email" value={shop.email} onChange={handleChange} />
            </div>
        </div>

        <h3 className="edit-shop-subtitle">Address</h3>

        <div className="edit-shop-grid-3">
            <div className="edit-shop-form-group">
                <label>Street *</label>
                <input type="text" name="street" value={shop.street} onChange={handleChange} />
            </div>
            
            <div className="edit-shop-form-group">
                <label>City *</label>
                <input type="text" name="city" value={shop.city} onChange={handleChange} />
            </div>

            <div className="edit-shop-form-group">
                <label>State *</label>
                <input type="text" name="state" value={shop.state} onChange={handleChange} />
            </div>
        </div>

        <div className="edit-shop-grid-2">
            <div className="edit-shop-form-group">
                <label>Pincode *</label>
                <input type="text" name="pincode" value={shop.pincode} onChange={handleChange} />
            </div>

            <div className="edit-shop-form-group">
                <label>Log Limit *</label>
                <input type="number" name="logLimit" min="10" value={shop.logLimit} onChange={handleChange}/>
            </div>
        </div>

        {message && (
            <p className={`edit-shop-message ${message.includes("Error") ? "error" : ""}`}>
            {message}
            </p>
        )}

        <button
            className="edit-shop-save-btn"
            onClick={handleSave}
            disabled={saving}
        >
            {saving ? "Saving..." : "Save Changes"}
        </button>

        </div>
    </div>
    );
}