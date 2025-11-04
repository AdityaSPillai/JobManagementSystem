import React, { useEffect, useState } from 'react';
import axios from '../utils/axios.js';
import useAuth from '../context/context.js';

// --- Add Machine Modal ---
function AddMachineModal({ isVisible, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'true',  // Fixed: matches dropdown options
    purchaseDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      name: '',
      type: '',
      status: 'true',
      purchaseDate: '',
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      isActive: true,
    });
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3>➕ Add New Machine</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label htmlFor="name">Machine Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="type">Machine Type</label>
             <select id="type" name="type" value={formData.type} onChange={handleChange} required>
                <option value="">-- Select Type --</option>
                <option value="lift">Lift</option>
                <option value="diagnostic">Diagnostic Tool</option>
                <option value="repair">Repair</option>
                <option value="cleaning">Cleaning</option>
                <option value="painting">Painting</option>
                <option value="welding">Welding</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Current Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value={true}>Available</option>
                <option value={false}>Offline</option>
               
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date</label>
              <input type="date" id="purchaseDate" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="lastMaintenanceDate">Last Maintenance</label>
              <input type="date" id="lastMaintenanceDate" name="lastMaintenanceDate" value={formData.lastMaintenanceDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="nextMaintenanceDate">Next Maintenance</label>
              <input type="date" id="nextMaintenanceDate" name="nextMaintenanceDate" value={formData.nextMaintenanceDate} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group-checkbox">
            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} />
            <label htmlFor="isActive">Machine is Active</label>
          </div>
          <button type="submit" className="btn-submit">Add Machine</button>
        </form>
      </div>
    </div>
  );
}


// --- Main Machines Tab Component ---
function MachinesTab() {
  const { userInfo } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shopId = userInfo?.shopId;
  const userId = userInfo?._id;


  // Fetch all machines
  const fetchMachines = async () => {
    if (!shopId) {
      console.log('⚠️ No shopId available');
      setError('Shop ID not found.');
      return;
    }
    
    try {
      console.log('🔄 Fetching machines for shopId:', shopId);
      setLoading(true);
      setError('');
      
      const res = await axios.get(`/shop/getAllMachines/${shopId}`);
      
      // Debug logging
    
      
      if (res.data.success && Array.isArray(res.data.machines)) {
        setMachines(res.data.machines);
        
        if (res.data.machines.length === 0) {
          setError('No machines found. Add your first machine!');
        }
      } else {
        setError('Unexpected response format from server.');
      }
    } catch (err) {

      setError(err.response?.data?.message || 'Failed to fetch machines.');
    } finally {
      setLoading(false);
    }
  };

  // Add new machine
  const handleAddMachine = async (machineData) => {
    try {
      const payload = { ...machineData, userId };
      const res = await axios.post('/machine/create-machiene', payload);
      
      
      if (res.data.success) {
        console.log('✅ Machine added successfully');
        await fetchMachines(); // refresh list
      } else {
        alert(res.data.message || 'Failed to add machine.');
      }
    } catch (err) {
      console.error('❌ Error adding machine:', err);
      alert(err.response?.data?.message || 'Failed to add machine.');
    }
  };

  // Fetch machines when shopId is available
  useEffect(() => {
 
    if (shopId) {
      fetchMachines();
    }
  }, [shopId]); // Fixed: use shopId instead of userInfo.shopId

  const getStatusClass = (status) => {
    if (status === 'Available') return 'status-available';
    if (status === 'In Use') return 'status-in-use';
    if (status === 'Maintenance') return 'status-maintenance';
    return 'status-offline';
  };

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Machinery Management</h3>
        <button className="btn-add-new" onClick={() => setIsModalOpen(true)}>
          + Add New Machine
        </button>
      </div>

      {loading ? (
        <p>Loading machines...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : machines.length === 0 ? (
        <p>No machines found. Click "Add New Machine" to get started!</p>
      ) : (
        <div className="data-grid">
          {machines.map(machine => (
            <div key={machine._id} className="data-card">
              <div className="data-card-header">
                <h4>{machine.name}</h4>
              </div>
              <div className="data-card-body">
                <p><strong>Type:</strong> {machine.type}</p>
                <p><strong>Purchased:</strong> {machine.purchaseDate?.split('T')[0] || 'N/A'}</p>
                <p><strong>Last Maintenance:</strong> {machine.lastMaintenanceDate?.split('T')[0] || 'N/A'}</p>
                <p><strong>Next Maintenance:</strong> {machine.nextMaintenanceDate?.split('T')[0] || 'N/A'}</p>
                <p><strong>Active:</strong> {machine.isActive ? 'Yes' : 'No'}</p>
              </div>
              <div className="data-card-footer">
                <button className="btn-card-action">Edit</button>
                <button className="btn-card-action btn-danger">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddMachineModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMachine}
      />
    </div>
  );
}

export default MachinesTab;