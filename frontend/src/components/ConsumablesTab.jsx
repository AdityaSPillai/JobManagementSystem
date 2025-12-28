import React, { useState, useEffect } from "react";
import axios from "../utils/axios.js";
import useAuth from "../context/context.jsx";
import Switch from "./Switch.jsx";

// Add Consumable Modal
function AddConsumableModal({ isVisible, onClose, onSubmit }) {
  const { userInfo } = useAuth();
  const initialFormState = {
    name: "",
    price: "",
    unitOfMeasure: "",
    quantity: "",
    available: true,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currency, setCurrency] = useState('$');

  const getCurrency = async () => {
    try {
      const res = await axios.get(`/shop/getCurrency/${userInfo?.shopId}`);
      if (res.data?.currency) {
        setCurrency(res.data.currency);
      }
    } catch (error) {
      console.error("Error fetching currency:", error);
    }
  };

  useEffect(() => {
    getCurrency();
  }, []);

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
        setFormData(initialFormState);
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
          <h3 className="heading-h3"><img src="/plus.png" alt="Plus Icon" className="plus-icon" /> <span className="add-employee">Add Consumable</span></h3>
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
              <label>Price ({currency}) *</label>
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
              <label>Unit of Measure </label>
              <input
                type="text"
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
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
              <div className="available-button">
                <label>Available</label>
                <Switch
                  name="available"
                  checked={formData.available || false}
                  onChange={handleChange}
                />
              </div>
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
  const [currency, setCurrency] = useState('$');

  const getCurrency = async () => {
    try {
      const res = await axios.get(`/shop/getCurrency/${userInfo?.shopId}`);
      if (res.data?.currency) {
        setCurrency(res.data.currency);
      }
    } catch (error) {
      console.error("Error fetching currency:", error);
    }
  };

  useEffect(() => {
    setFormData(consumable || {});
    getCurrency();
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
          <h3 className="heading-h3"> <img src="/edit.png" alt="Edit Icon" className="edit-icon" /> <span className="add-employee">Edit Consumable</span> </h3>
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
              <label>Price ({currency}) *</label>
              <input
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Unit of Measure </label>
              <input
                type="text"
                name="unitOfMeasure"
                value={formData.unitOfMeasure || ""}
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
              <div className="available-button">
                <label>Available</label>
                <Switch
                  name="available"
                  checked={formData.available || false}
                  onChange={handleChange}
                />
              </div>
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

  const [currency, setCurrency] = useState('$');

  const getCurrency = async () => {
    try {
      const res = await axios.get(`/shop/getCurrency/${userInfo?.shopId}`);
      if (res.data?.currency) {
        setCurrency(res.data.currency);
      }
    } catch (error) {
      console.error("Error fetching currency:", error);
    }
  };

  useEffect(() => {
    if (userInfo?.shopId) fetchConsumables(); getCurrency();
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
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Unit of Measure</th>
                <th>Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>

            <tbody>
              {consumables.map((item) => (
                <tr key={item._id}>
                  <td>
                    <span className="table-primary-text">{item.name}</span>
                  </td>

                  <td>
                    <span className="badge-rate">{currency}{item.price}</span>
                  </td>

                  <td>
                    <span className="quantity-consumables">{item.quantity}</span>
                  </td>
                  <td>
                    <span className="quantity-consumables">{item.unitOfMeasure}</span>
                  </td>

                  <td>
                    {item.available ? (
                      <span className="badge-rate" style={{ background: "#c6f6d5", color: "#22543d" }}>
                        Available
                      </span>
                    ) : (
                      <span className="badge-rate" style={{ background: "#fed7d7", color: "#c53030" }}>
                        Not Available
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="table-cta"
                        onClick={() => {
                          setSelectedConsumable(item);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="table-cta table-cta-danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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