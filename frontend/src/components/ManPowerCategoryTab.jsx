import React, { useEffect, useState } from 'react';
import axios from '../utils/axios.js';
import useAuth from '../context/context.jsx';

function AddCategoryModal({ isVisible, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    hourlyRate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
          <h3 className="heading-h3"><img src="/plus.png" alt="Plus Icon" className="plus-icon"/> <span className="add-employee">Add New Man Power Category</span></h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label htmlFor="name">Category Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hourlyRate">Hourly Rate ($)</label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="Enter hourly rate"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit">Add Category</button>
        </form>
      </div>
    </div>
  );
}

function EditCategoryModal({ isVisible, onClose, onSubmit, manPowerData }) {
  const [formData, setFormData] = useState({
    name: '',
    hourlyRate: '',
  });

  // Populate the form when category data changes
  useEffect(() => {
    if (manPowerData) {
      setFormData({
        name: manPowerData.name || '',
        hourlyRate: manPowerData.hourlyRate || '',
      });
    }
  }, [manPowerData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3 className="heading-h3"> <img src="/edit.png" alt="Edit Icon" className="edit-icon"/> <span className="add-employee">Edit Man Power Category</span> </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label htmlFor="edit-name">Category Name</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-hourlyRate">Hourly Rate ($)</label>
              <input
                type="number"
                id="edit-hourlyRate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit">Update Category</button>
        </form>
      </div>
    </div>
  );
}

// --- Main Man Power Type Tab ---
function manPowerCategoryTab() {
  const { userInfo } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [manPowerCategory, setmanPowerCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shopId = userInfo?.shopId;

  const fetchmanPowerCategories = async () => {
    if (!shopId) return setError('Shop ID not found.');
    try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/shop/allCategories/${shopId}`);

        if (res.data.success) {
        console.log("Categories received", res.data.categories);
        setmanPowerCategory(res.data.categories || []);
        if (res.data.categories.length === 0) {
            setError('No Man Power categories found. Add your first one!');
        }
        } else {
        setError('Unexpected response format from server.');
        }
    } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.response?.data?.message || 'Failed to fetch categories.');
    } finally {
        setLoading(false);
    }
    };

  const handleAddmanPowerCategory = async (categoryData) => {
    try {
        const payload = { categories: [categoryData] };
        const res = await axios.post(`/shop/addNewCategory/${shopId}`, payload);

        if (res.data.success) {
        console.log('✅ Man Power category added successfully');
        await fetchmanPowerCategories();
        } else {
        alert(res.data.message || 'Failed to add Man Power category.');
        }
    } catch (err) {
        console.error('❌ Error adding Man Power category:', err);
        alert(err.response?.data?.message || 'Failed to add Man Power category.');
    }
    };

  const handleEditmanPowerCategory = async (categoryData) => {
    try {
        const payload = {
        name: categoryData.name,
        hourlyRate: Number(categoryData.hourlyRate)
        };

        const res = await axios.put(`/shop/updateCategory/${shopId}/${editingCategory._id}`, payload);

        if (res.data.success) {
        console.log('✅ Man Power category updated successfully');
        await fetchmanPowerCategories();
        } else {
        alert(res.data.message || 'Failed to update Man Power category.');
        }
    } catch (err) {
        console.error('❌ Error updating category:', err);
        alert(err.response?.data?.message || 'Failed to update Man Power category.');
    }
    };

  const openEditModal = (manPower) => {
    setEditingCategory(manPower);
    setIsEditModalOpen(true);
  };

  const handleDeletemanPowerCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this Man Power category?')) return;
    try {
        const res = await axios.delete(`/shop/deleteCategory/${shopId}/${categoryId}`);
        if (res.data.success) {
        console.log('🗑️ Man Power category deleted');
        await fetchmanPowerCategories();
        } else {
        alert(res.data.message || 'Failed to delete Man Power category.');
        }
    } catch (err) {
        console.error('❌ Error deleting category:', err);
        alert(err.response?.data?.message || 'Failed to delete Man Power category.');
    }
    };

  useEffect(() => {
    if (shopId) fetchmanPowerCategories();
  }, [shopId]);

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Man Power Category Management</h3>
        <button className="btn-add-new" onClick={() => setIsModalOpen(true)}>
          + Add Man Power Category
        </button>
      </div>

      {loading ? (
        <p>Loading Man Power category...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : manPowerCategory.length === 0 ? (
        <p>No Man Power category found. Click "Add Man Power Category" to get started!</p>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Hourly Rate</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {manPowerCategory.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <span className="table-primary-text">{cat.name}</span>
                  </td>
                  <td>
                    <span className="badge-rate">${cat.hourlyRate}/hr</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="table-cta"
                        onClick={() => openEditModal(cat)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="table-cta table-cta-danger"
                        onClick={() => handleDeletemanPowerCategory(cat._id)}
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

      <AddCategoryModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddmanPowerCategory}
      />

      <EditCategoryModal
        isVisible={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleEditmanPowerCategory}
        manPowerData={editingCategory}
      />
    </div>
  );
}

export default manPowerCategoryTab;