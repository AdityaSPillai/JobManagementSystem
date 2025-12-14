import React, { useEffect, useState } from 'react';
import axios from '../utils/axios.js';
import useAuth from '../context/context.jsx';

function AddMachineCategoryModal({ isVisible, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', hourlyRate: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({ name: '', hourlyRate: '' });
  };

  if (!isVisible) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3 className="heading-h3"><img src="/plus.png" alt="Plus Icon" className="plus-icon"/> <span className="add-employee">Add Machine Category</span></h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label>Category Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              {/* <label>Hourly Rate ($)</label> */}
              <label>Hourly Rate</label>
              <input name="hourlyRate" type="number" value={formData.hourlyRate} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn-submit">Add Category</button>
        </form>
      </div>
    </div>
  );
}

function EditMachineCategoryModal({ isVisible, onClose, onSubmit, categoryData }) {
  const [hourlyRate, setHourlyRate] = useState('');

  useEffect(() => {
    if (categoryData) setHourlyRate(categoryData.hourlyRate || '');
  }, [categoryData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ hourlyRate });
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3 className="heading-h3"> <img src="/edit.png" alt="Edit Icon" className="edit-icon"/> <span className="add-employee">Edit Machine Category</span> </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label>Category Name</label>
              <input type="text" value={categoryData?.name || ''} disabled />
            </div>
            <div className="form-group">
              {/* <label>Hourly Rate ($)</label> */}
              <label>Hourly Rate</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-submit">Update Rate</button>
        </form>
      </div>
    </div>
  );
}

function MachineCategoryTab() {
  const { userInfo } = useAuth();
  const shopId = userInfo?.shopId;
  const [machineCategory, setMachineCategory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/shop/allMachineCategory/${shopId}`);
      if (res.data.success) setMachineCategory(res.data.machineCategory);
    } catch {
      alert("Failed to load machine categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (data) => {
    try {
      const res = await axios.post(`/shop/addMachineCategory/${shopId}`, { machineCategory: [data] });
      if (res.data.success) fetchCategories();
    } catch {
      alert("Failed to add machine category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await axios.delete(`/shop/deleteMachineCategory/${shopId}/${id}`);
    fetchCategories();
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleEditCategory = async (updatedData) => {
    try {
      const res = await axios.put(
        `/shop/updateMachineCategory/${shopId}/${editingCategory._id}`,
        { hourlyRate: Number(updatedData.hourlyRate) }
      );

      if (res.data.success) {
        alert("Hourly rate updated successfully!");
        fetchCategories();
      } else {
        alert(res.data.message || "Failed to update hourly rate");
      }
    } catch (err) {
      console.error("Error updating category:", err);
      alert("Error updating hourly rate");
    }
  };

  useEffect(() => { if (shopId) fetchCategories(); }, [shopId]);

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Machine Category Management</h3>
        <button className="btn-add-new" onClick={() => setIsModalOpen(true)}>+ Add Machine Category</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : machineCategory.length === 0 ? (
        <p className="error-text">No machine categories found</p>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Machine Category</th>
                <th>Hourly Rate</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {machineCategory.map((mt) => (
                <tr key={mt._id}>
                  <td>
                    <span className="table-primary-text">{mt.name}</span>
                  </td>
                  <td>
                    <span className="badge-rate">${mt.hourlyRate}/hr</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="table-cta"
                        onClick={() => openEditModal(mt)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="table-cta table-cta-danger"
                        onClick={() => handleDeleteCategory(mt._id)}
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

      <AddMachineCategoryModal isVisible={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddCategory} />
      <EditMachineCategoryModal
        isVisible={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleEditCategory}
        categoryData={editingCategory}
      />
    </div>
  );
}

export default MachineCategoryTab;
