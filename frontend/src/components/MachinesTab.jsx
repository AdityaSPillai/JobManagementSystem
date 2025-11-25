import React, { useEffect, useState } from 'react';
import axios from '../utils/axios.js';
import useAuth from '../context/context.jsx';

// --- Add Machine Modal ---
function AddMachineModal({ isVisible, onClose, onSubmit, machineCategories }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    hourlyRate:0,
    status: 'true',  // Fixed: matches dropdown options
    purchaseDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    isActive: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      const selectedCategory = machineCategories.find(cat => cat.name === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        hourlyRate: selectedCategory?.hourlyRate || 0 
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

 const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); 
    onClose();
    setFormData({
      name: '',
      type: '',
      status: 'true',
      purchaseDate: '',
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      isActive: true,
      hourlyRate: 0
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
                <option value="">-- Select Category --</option>
                {machineCategories.map(cat => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name} (₹{cat.hourlyRate}/hr)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Hourly Rate (auto-filled)</label>
              <input 
                type="number" 
                value={formData.hourlyRate || 0} 
                readOnly 
                style={{ backgroundColor: "#f3f3f3" }}
              />
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
          <button type="submit" className="btn-submit">Add Machine</button>
        </form>
      </div>
    </div>
  );
}

function EditMachineModal({ isVisible, onClose, onSubmit, machine, machineCategories }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: true,
    purchaseDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    isActive: true,
  });

  useEffect(() => {
    if (machine) {
      setFormData({
        name: machine.name || '',
        type: machine.type || '',
        status: machine.status || true,
        purchaseDate: machine.purchaseDate ? machine.purchaseDate.split('T')[0] : '',
        lastMaintenanceDate: machine.lastMaintenanceDate ? machine.lastMaintenanceDate.split('T')[0] : '',
        nextMaintenanceDate: machine.nextMaintenanceDate ? machine.nextMaintenanceDate.split('T')[0] : '',
        isActive: machine.isActive ?? true,
      });
    }
  }, [machine]);

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
          <h3>✏️ Edit Machine</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label>Machine Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Machine Category</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="">-- Select Category --</option>
                {machineCategories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name} (₹{cat.hourlyRate}/hr)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value={true}>Available</option>
                <option value={false}>Offline</option>
              </select>
            </div>

            <div className="form-group">
              <label>Purchase Date</label>
              <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Last Maintenance</label>
              <input type="date" name="lastMaintenanceDate" value={formData.lastMaintenanceDate} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Next Maintenance</label>
              <input type="date" name="nextMaintenanceDate" value={formData.nextMaintenanceDate} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="btn-submit">Save Changes</button>
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  const shopId = userInfo?.shopId;
  const userId = userInfo?._id;
  const [machineCategories, setMachineCategories] = useState([]);

  const handleEditClick = (machine) => {
    setSelectedMachine(machine);
    setIsEditModalOpen(true);
  };

  const handleEditMachine = async (updatedData) => {
    try {
      const res = await axios.put(`/machine/updateMachine/${selectedMachine._id}`, updatedData);
      if (res.data.success) {
        alert("Machine updated successfully!");
        fetchMachines();
      } else {
        alert(res.data.message || "Failed to update machine.");
      }
    } catch (err) {
      console.error("Error updating machine:", err);
      alert(err.response?.data?.message || "Error updating machine.");
    }
  };

  // 🗑️ Handle delete
  const handleDeleteMachine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this machine?")) return;

    try {
      const res = await axios.delete(`/machine/deleteMachine/${id}`);
      if (res.data.success) {
        alert("Machine deleted successfully!");
        fetchMachines();
      } else {
        alert(res.data.message || "Failed to delete machine.");
      }
    } catch (err) {
      console.error("Error deleting machine:", err);
      alert(err.response?.data?.message || "Error deleting machine.");
    }
  };

  const fetchMachineCategories = async () => {
    try {
      const res = await axios.get(`/shop/allMachineCategory/${shopId}`);
      if (res.data.success) {
        setMachineCategories(res.data.machineCategory || []);
      }
    } catch (error) {
      console.error("Error fetching machine categories:", error);
    }
  };

  // Fetch machine categories whenever shopId is available
  useEffect(() => {
    if (shopId) {
      fetchMachineCategories();
    }
  }, [shopId]);

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
      const payload = { ...machineData, userId, shopId };
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
                <button className="btn-card-action" onClick={() => handleEditClick(machine)}>Edit</button>
                <button className="btn-card-action btn-danger" onClick={() => handleDeleteMachine(machine._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddMachineModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMachine}
        machineCategories={machineCategories}
      />
      <EditMachineModal
        isVisible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditMachine}
        machine={selectedMachine}
        machineCategories={machineCategories}
      />
    </div>
  );
}

export default MachinesTab;