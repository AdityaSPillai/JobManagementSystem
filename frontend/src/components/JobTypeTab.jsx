import React, { useEffect, useState } from 'react';
import axios from '../utils/axios.js';
import useAuth from '../context/context.js';

// --- Add Job Modal ---
function AddJobModal({ isVisible, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    note: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({ name: '', description: '', price: '', note: '' });
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3>➕ Add New Job Type</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label htmlFor="name">Job Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price (₹)</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange}></textarea>
            </div>
            <div className="form-group full-width">
              <label htmlFor="note">Notes (optional)</label>
              <textarea id="note" name="note" value={formData.note} onChange={handleChange}></textarea>
            </div>
          </div>
          <button type="submit" className="btn-submit">Add Job Type</button>
        </form>
      </div>
    </div>
  );
}

// --- Edit Job Modal ---
function EditJobModal({ isVisible, onClose, onSubmit, jobData }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    note: '',
  });

  // Update form when jobData changes
  useEffect(() => {
    if (jobData) {
      setFormData({
        name: jobData.name || '',
        description: jobData.description || '',
        price: jobData.price || '',
        note: jobData.note || '',
      });
    }
  }, [jobData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          <h3>✏️ Edit Job Type</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label htmlFor="edit-name">Job Name</label>
              <input 
                type="text" 
                id="edit-name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                disabled 
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#666', fontSize: '0.75rem' }}>Job name cannot be changed</small>
            </div>
            <div className="form-group">
              <label htmlFor="edit-price">Price (₹)</label>
              <input 
                type="number" 
                id="edit-price" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="edit-description">Description</label>
              <textarea 
                id="edit-description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="form-group full-width">
              <label htmlFor="edit-note">Notes (optional)</label>
              <textarea 
                id="edit-note" 
                name="note" 
                value={formData.note} 
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          <button type="submit" className="btn-submit">Update Job Type</button>
        </form>
      </div>
    </div>
  );
}


// --- Main Job Type Tab ---
function JobTypeTab() {
  const { userInfo } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobTypes, setJobTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shopId = userInfo?.shopId;

  // Fetch all job types
  const fetchJobTypes = async () => {
    if (!shopId) return setError('Shop ID not found.');
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const res = await axios.get(`/shop/allServices/${shopId}`);
      
      // Handle both "success" and "succes" (typo in backend)
      if (res.data.success || res.data.succes) {
        console.log("Services received", res.data.shop.services);
        setJobTypes(res.data.shop.services || []);
        if (res.data.shop.services.length === 0) {
          setError('No job types found. Add your first one!');
        }
      } else {
        setError('Unexpected response format from server.');
      }
    } catch (err) {
      console.error('Error fetching job types:', err);
      setError(err.response?.data?.message || 'Failed to fetch job types.');
    } finally {
      setLoading(false);
    }
  };

  // Add new job type
  const handleAddJob = async (jobData) => {
    try {
      const payload = { services: [jobData] };
      const res = await axios.post(`/shop/addNewService/${shopId}`, payload);

      if (res.data.success || res.data.succes) {
        console.log('✅ Job type added successfully');
        await fetchJobTypes();
      } else {
        alert(res.data.message || 'Failed to add job type.');
      }
    } catch (err) {
      console.error('❌ Error adding job type:', err);
      alert(err.response?.data?.message || 'Failed to add job type.');
    }
  };

  // Edit job type
  const handleEditJob = async (jobData) => {
    try {
      // Format data according to backend requirements (only price and description)
      const payload = {
        price: Number(jobData.price),
        description: jobData.description,
        ...(jobData.note && { note: jobData.note }) // Include note if it exists
      };

      const res = await axios.put(`/shop/updateShopServices/${shopId}/${editingJob._id}`, payload);

      if (res.data.success || res.data.succes) {
        console.log('✅ Job type updated successfully');
        await fetchJobTypes();
      } else {
        alert(res.data.message || 'Failed to update job type.');
      }
    } catch (err) {
      console.error('❌ Error updating job type:', err);
      alert(err.response?.data?.message || 'Failed to update job type.');
    }
  };

  // Open edit modal
  const openEditModal = (job) => {
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  // Remove job type
  const handleDeleteJob = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this job type?')) return;
    try {
      const res = await axios.delete(`/shop/deleteShopService/${shopId}/${serviceId}`);
      if (res.data.success || res.data.succes) {
        console.log('🗑️ Job type deleted');
        await fetchJobTypes();
      } else {
        alert(res.data.message || 'Failed to delete job type.');
      }
    } catch (err) {
      console.error('❌ Error deleting job type:', err);
      alert(err.response?.data?.message || 'Failed to delete job type.');
    }
  };

  useEffect(() => {
    if (shopId) fetchJobTypes();
  }, [shopId]);

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Job Type Management</h3>
        <button className="btn-add-new" onClick={() => setIsModalOpen(true)}>
          + Add Job Type
        </button>
      </div>

      {loading ? (
        <p>Loading job types...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : jobTypes.length === 0 ? (
        <p>No job types found. Click "Add Job Type" to get started!</p>
      ) : (
        <div className="data-grid">
          {jobTypes.map(job => (
            <div key={job._id} className="data-card">
              <div className="data-card-header">
                <h4>{job.name}</h4>
                <span className="data-card-status status-available">₹{job.price}</span>
              </div>
              <div className="data-card-body">
                <p><strong>Description:</strong> {job.description || 'N/A'}</p>
                {job.note && <p><strong>Note:</strong> {job.note}</p>}
              </div>
              <div className="data-card-footer">
                <button className="btn-card-action" onClick={() => openEditModal(job)}>Edit</button>
                <button className="btn-card-action btn-danger" onClick={() => handleDeleteJob(job._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddJobModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddJob}
      />

      <EditJobModal
        isVisible={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleEditJob}
        jobData={editingJob}
      />
    </div>
  );
}

export default JobTypeTab;