import React, { useEffect, useState } from 'react';
import axios from '../utils/axios.js';
import useAuth from '../context/context.js';

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
          <h3>➕ Add New Job Category</h3>
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
              <label htmlFor="hourlyRate">Hourly Rate (₹)</label>
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

function EditCategoryModal({ isVisible, onClose, onSubmit, jobData }) {
  const [formData, setFormData] = useState({
    name: '',
    hourlyRate: '',
  });

  // Populate the form when category data changes
  useEffect(() => {
    if (jobData) {
      setFormData({
        name: jobData.name || '',
        hourlyRate: jobData.hourlyRate || '',
      });
    }
  }, [jobData]);

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
          <h3>✏️ Edit Job Category</h3>
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
              <label htmlFor="edit-hourlyRate">Hourly Rate (₹)</label>
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

// --- Main Job Type Tab ---
function JobCategoryTab() {
  const { userInfo } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [jobCategory, setJobCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shopId = userInfo?.shopId;

  const fetchJobCategories = async () => {
    if (!shopId) return setError('Shop ID not found.');
    try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/shop/allCategories/${shopId}`);

        if (res.data.success) {
        console.log("Categories received", res.data.categories);
        setJobCategory(res.data.categories || []);
        if (res.data.categories.length === 0) {
            setError('No job categories found. Add your first one!');
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

  const handleAddJobCategory = async (categoryData) => {
    try {
        const payload = { categories: [categoryData] };
        const res = await axios.post(`/shop/addNewCategory/${shopId}`, payload);

        if (res.data.success) {
        console.log('✅ Job category added successfully');
        await fetchJobCategories();
        } else {
        alert(res.data.message || 'Failed to add job category.');
        }
    } catch (err) {
        console.error('❌ Error adding job category:', err);
        alert(err.response?.data?.message || 'Failed to add job category.');
    }
    };

  const handleEditJobCategory = async (categoryData) => {
    try {
        const payload = {
        name: categoryData.name,
        hourlyRate: Number(categoryData.hourlyRate)
        };

        const res = await axios.put(`/shop/updateCategory/${shopId}/${editingCategory._id}`, payload);

        if (res.data.success) {
        console.log('✅ Job category updated successfully');
        await fetchJobCategories();
        } else {
        alert(res.data.message || 'Failed to update job category.');
        }
    } catch (err) {
        console.error('❌ Error updating category:', err);
        alert(err.response?.data?.message || 'Failed to update job category.');
    }
    };

  const openEditModal = (job) => {
    setEditingCategory(job);
    setIsEditModalOpen(true);
  };

  const handleDeleteJobCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this job category?')) return;
    try {
        const res = await axios.delete(`/shop/deleteCategory/${shopId}/${categoryId}`);
        if (res.data.success) {
        console.log('🗑️ Job category deleted');
        await fetchJobCategories();
        } else {
        alert(res.data.message || 'Failed to delete job category.');
        }
    } catch (err) {
        console.error('❌ Error deleting category:', err);
        alert(err.response?.data?.message || 'Failed to delete job category.');
    }
    };

  useEffect(() => {
    if (shopId) fetchJobCategories();
  }, [shopId]);

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Job Category Management</h3>
        <button className="btn-add-new" onClick={() => setIsModalOpen(true)}>
          + Add Job Category
        </button>
      </div>

      {loading ? (
        <p>Loading job category...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : jobCategory.length === 0 ? (
        <p>No job category found. Click "Add Job Category" to get started!</p>
      ) : (
        <div className="data-grid">
          {jobCategory.map(cat => (
            <div key={cat._id} className="data-card">
                <div className="data-card-header">
                <h4>{cat.name}</h4>
                <span className="data-card-status status-available">₹{cat.hourlyRate}/hr</span>
                </div>
                <div className="data-card-footer">
                <button className="btn-card-action" onClick={() => openEditModal(cat)}>Edit</button>
                <button className="btn-card-action btn-danger" onClick={() => handleDeleteJobCategory(cat._id)}>Remove</button>
                </div>
            </div>
            ))}
        </div>
      )}

      <AddCategoryModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddJobCategory}
      />

      <EditCategoryModal
        isVisible={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleEditJobCategory}
        jobData={editingCategory}
      />
    </div>
  );
}

export default JobCategoryTab;