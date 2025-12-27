import React, { useEffect, useState } from 'react';
import axios from '../utils/axios.js';
import useAuth from '../context/context.jsx';

// --- Add Service Modal ---
function AddServiceModal({ isVisible, onClose, onSubmit }) {

  const { userInfo } = useAuth();
  const [serviceCategories, setServiceCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    note: '',
    serviceCategory: '',
  });

  const shopId = userInfo?.shopId;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({ name: '', description: '', note: '', serviceCategory: '' });
  };



  const fetchServiceCategories = async () => {
    try {
      const res = await axios.get(`/shop/serviceCategories/${shopId}`)
      console.log(res.data.serviceCategory)
      setServiceCategories(res.data.serviceCategory || [])
    } catch (err) {
      console.error("Failed to fetch categories")
      console.error(err)
    }
  }

  useEffect(() => {
    if (shopId) {
      fetchServiceCategories()
    }
  }, [shopId])

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3 className="heading-h3"><img src="/plus.png" alt="Plus Icon" className="plus-icon" /> <span className="add-employee">Add New Service Type</span></h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label htmlFor="name">Service Type Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange}></textarea>
            </div>
            <div className="form-group full-width">
              <label htmlFor="note">Notes (optional)</label>
              <textarea id="note" name="note" value={formData.note} onChange={handleChange}></textarea>
            </div>
            <div className="form-group">
              <label>Service Category</label>
              <select
                name="serviceCategory"
                value={formData.serviceCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {serviceCategories.map(cat => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-submit">Add Service Type</button>
        </form>
      </div>
    </div>
  );
}

// --- Edit Service Modal ---
function EditServiceModal({ isVisible, onClose, onSubmit, serviceData }) {


  const { userInfo } = useAuth();
  const shopId = userInfo?.shopId;
  const [serviceCategories, setServiceCategories] = useState([])


  const fetchServiceCategories = async () => {
    try {
      const res = await axios.get(`/shop/serviceCategories/${shopId}`)
      console.log(res.data.serviceCategory)
      setServiceCategories(res.data.serviceCategory || [])
    } catch (err) {
      console.error("Failed to fetch categories")
      console.error(err)
    }
  }

  useEffect(() => {
    if (shopId) {
      fetchServiceCategories()
    }
  }, [shopId])



  const [formData, setFormData] = useState({
    name: '',
    description: '',
    note: '',
    serviceCategory: '',
  });





  // Update form when serviceData changes
  useEffect(() => {
    if (serviceData) {
      setFormData({
        name: serviceData.name || '',
        description: serviceData.description || '',
        note: serviceData.note || '',
        serviceCategory: serviceData.serviceCategory || '',
      });
    }
  }, [serviceData]);

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
          <h3 className="heading-h3"> <img src="/edit.png" alt="Edit Icon" className="edit-icon" /> <span className="add-employee">Edit Service Type</span> </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label htmlFor="edit-name">Service Type Name</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#666', fontSize: '0.75rem' }}>Service type name cannot be changed</small>
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
            <div className="form-group">
              <label>Service Category</label>
              <select
                name="serviceCategory"
                value={formData.serviceCategory}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {serviceCategories.map(cat => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-submit">Update Service Type</button>
        </form>
      </div>
    </div>
  );
}


// --- Main Service Type Tab ---
function ServiceTypeTab() {
  const { userInfo } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shopId = userInfo?.shopId;

  // Fetch all Service types
  const fetchServiceTypes = async () => {
    if (!shopId) return setError('Shop ID not found.');
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const res = await axios.get(`/shop/allServices/${shopId}`);

      // Handle both "success" and "succes" (typo in backend)
      if (res.data.success || res.data.succes) {
        console.log("Services received", res.data.shop.services);
        setServiceTypes(res.data.shop.services || []);
        if (res.data.shop.services.length === 0) {
          setError('No Service types found. Add your first one!');
        }
      } else {
        setError('Unexpected response format from server.');
      }
    } catch (err) {
      console.error('Error fetching Service types:', err);
      setError(err.response?.data?.message || 'Failed to fetch Service types.');
    } finally {
      setLoading(false);
    }
  };

  // Add new Service type
  const handleAddService = async (serviceData) => {
    try {
      const payload = { services: [serviceData] };

      console.log('Adding Service type with payload:', payload);
      const res = await axios.post(`/shop/addNewService/${shopId}`, payload);

      if (res.data.success || res.data.succes) {
        console.log('✅ Service type added successfully');
        await fetchServiceTypes();
      } else {
        alert(res.data.message || 'Failed to add Service type.');
      }
    } catch (err) {
      console.error('❌ Error adding Service type:', err);
      alert(err.response?.data?.message || 'Failed to add Service type.');
    }
  };

  // Edit Service type
  const handleEditService = async (serviceData) => {
    console.log('Editing Service type:', editingService._id, serviceData);
    try {
      // Format data according to backend requirements (only description)
      const payload = {
        description: serviceData.description,
        serviceCategory: serviceData.serviceCategory,
        ...(serviceData.note && { note: serviceData.note }) // Include note if it exists
      };

      const res = await axios.put(`/shop/updateShopServices/${shopId}/${editingService._id}`, payload);

      if (res.data.success || res.data.succes) {
        console.log('✅ Service type updated successfully');
        await fetchServiceTypes();
      } else {
        alert(res.data.message || 'Failed to update Service type.');
      }
    } catch (err) {
      console.error('❌ Error updating Service type:', err);
      alert(err.response?.data?.message || 'Failed to update Service type.');
    }
  };

  // Open edit modal
  const openEditModal = (Service) => {
    setEditingService(Service);
    setIsEditModalOpen(true);
  };

  // Remove Service type
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this Service type?')) return;
    try {
      const res = await axios.delete(`/shop/deleteShopService/${shopId}/${serviceId}`);
      if (res.data.success || res.data.succes) {
        console.log('🗑️ Service type deleted');
        await fetchServiceTypes();
      } else {
        alert(res.data.message || 'Failed to delete Service type.');
      }
    } catch (err) {
      console.error('❌ Error deleting Service type:', err);
      alert(err.response?.data?.message || 'Failed to delete Service type.');
    }
  };

  useEffect(() => {
    if (shopId) fetchServiceTypes();
  }, [shopId]);

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Service Type Management</h3>
        <button className="btn-add-new" onClick={() => setIsModalOpen(true)}>
          + Add Service Type
        </button>
      </div>

      {loading ? (
        <p>Loading Service types...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : serviceTypes.length === 0 ? (
        <p>No Service types found. Click "Add Service Type" to get started!</p>
      ) : (
        <div className="data-grid">
          {serviceTypes.map(Service => (
            <div key={Service._id} className="data-card">
              <div className="data-card-header">
                <h4>{Service.name}</h4>
              </div>
              <div className="data-card-body">
                <p><strong>Description:</strong> {Service.description || 'N/A'}</p>
                {Service.note && <p><strong>Note:</strong> {Service.note}</p>}
              </div>
              <div className="data-card-body">
                <p><strong>Service Category:</strong> {Service.serviceCategory || 'N/A'}</p>
              </div>
              <div className="data-card-footer">
                <button className="btn-card-action" onClick={() => openEditModal(Service)}>Edit</button>
                <button className="btn-card-action btn-danger" onClick={() => handleDeleteService(Service._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddServiceModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddService}

      />

      <EditServiceModal
        isVisible={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingService(null);
        }}
        onSubmit={handleEditService}
        serviceData={editingService}
      />
    </div>
  );
}

export default ServiceTypeTab;