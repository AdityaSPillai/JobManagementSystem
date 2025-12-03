import React, { useState, useEffect } from "react";
import axios from "../utils/axios.js";
import useAuth from "../context/context.jsx";

// Add Consumable Modal
function AddConsumableModal({ isVisible, onClose, onSubmit }) {
  const { userInfo } = useAuth();
  const [formData, setFormData] = useState({ name: "", price: "", available: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.quantity) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`/shop/addConsumables/${userInfo.shopId}`, {
        consumables: [formData],
      });
      if (res.data.success) {
        onSubmit();
        onClose();
      } else {
        setError("Error adding consumable");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding consumable");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3>➕ Add Consumable</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
             <div className="form-group">
              <label>Quanity </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group form-group-checkbox">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
              />
              <label>Available</label>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Adding..." : "Add Consumable"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Edit Consumable Modal
function EditConsumableModal({ isVisible, onClose, consumable, onUpdate }) {
  const { userInfo } = useAuth();
  const [formData, setFormData] = useState(consumable || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(consumable || {});
  }, [consumable]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consumable?._id) return;

    try {
      setLoading(true);
      const res = await axios.put(
        `/shop/updateConsumable/${userInfo.shopId}/${consumable._id}`,
        formData
      );
      if (res.data.success) {
        onUpdate();
        onClose();
      } else {
        setError("Error updating consumable");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating consumable");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3>✏️ Edit Consumable</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Quanity </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group form-group-checkbox">
              <input
                type="checkbox"
                name="available"
                checked={formData.available || false}
                onChange={handleChange}
              />
              <label>Available</label>
            </div>
             
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Updating..." : "Update Consumable"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Main Component
function ConsumablesTab() {
  const { userInfo } = useAuth();
  const [consumables, setConsumables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedConsumable, setSelectedConsumable] = useState(null);

  const fetchConsumables = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/shop/allConsumables/${userInfo.shopId}`);
      if (res.data.success) {
        setConsumables(res.data.consumables || []);
      } else {
        setError("No consumables found.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load consumables.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.shopId) fetchConsumables();
  }, [userInfo?.shopId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this consumable?")) return;
    try {
      const res = await axios.delete(`/shop/deleteConsumable/${userInfo.shopId}/${id}`);
      if (res.data.success) fetchConsumables();
    } catch (err) {
      alert("Error deleting consumable.");
    }
  };

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Consumables Management</h3>
        <button className="btn-add-new" onClick={() => setIsAddModalOpen(true)}>
          + Add Consumable
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading consumables...</p>
        </div>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : consumables.length === 0 ? (
        <p className="error-text">No consumables found. Add one to get started!</p>
      ) : (
        <div className="data-grid">
          {consumables.map((item) => (
            <div key={item._id} className="data-card">
              <div className="data-card-header">
                <h4>{item.name}</h4>
                <span
                  className={`data-card-role ${
                    item.available ? "status-available" : "status-offline"
                  }`}
                >
                  {item.available ? "Available" : "Not Available"}
                </span>
              </div>

              <div className="data-card-body">
                <p><strong>Price:</strong> ₹{item.price}</p>
              </div>
              <div className="data-card-body">
                <p><strong>Quantity:</strong> {item.quantity}</p>
              </div>

              <div className="data-card-footer">
                <button
                  className="btn-card-action"
                  onClick={() => {
                    setSelectedConsumable(item);
                    setIsEditModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn-card-action btn-danger"
                  onClick={() => handleDelete(item._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add and Edit Modals */}
      <AddConsumableModal
        isVisible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={fetchConsumables}
      />
      <EditConsumableModal
        isVisible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        consumable={selectedConsumable}
        onUpdate={fetchConsumables}
      />
    </div>
  );
}

export default ConsumablesTab;