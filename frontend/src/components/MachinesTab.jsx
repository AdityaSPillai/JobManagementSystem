import React, { useState } from 'react';

// --- Add Machine Modal ---
function AddMachineModal({ isVisible, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Lift',
    status: 'Available',
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
      name: '', type: 'Lift', status: 'Available', purchaseDate: '',
      lastMaintenanceDate: '', nextMaintenanceDate: '', isActive: true,
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
              <select id="type" name="type" value={formData.type} onChange={handleChange}>
                <option value="Lift">Lift</option>
                <option value="Diagnostic Tool">Diagnostic Tool</option>
                <option value="Tire Changer">Tire Changer</option>
                <option value="Wheel Balancer">Wheel Balancer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Current Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Offline">Offline</option>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [machines, setMachines] = useState([
    {
      id: 1, name: 'Main Lift 1', type: 'Lift', status: 'Available',
      purchaseDate: '2022-01-15', lastMaintenanceDate: '2025-10-01', nextMaintenanceDate: '2026-04-01', isActive: true
    },
    {
      id: 2, name: 'OBD-II Scanner', type: 'Diagnostic Tool', status: 'In Use',
      purchaseDate: '2023-05-20', lastMaintenanceDate: '2025-09-15', nextMaintenanceDate: '2026-03-15', isActive: true
    },
  ]);

  const handleAddMachine = (machineData) => {
    const newMachine = { ...machineData, id: machines.length + 1 };
    setMachines(prev => [...prev, newMachine]);
    console.log("New Machine:", newMachine);
  };

  const getStatusClass = (status) => {
    if (status === 'Available') return 'status-available';
    if (status === 'In Use') return 'status-in-use';
    if (status === 'Maintenance') return 'status-maintenance';
    return 'status-offline';
  }

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Machinery Management</h3>
        <button className="btn-add-new" onClick={() => setIsModalOpen(true)}>
          + Add New Machine
        </button>
      </div>

      <div className="data-grid">
        {machines.map(machine => (
          <div key={machine.id} className="data-card">
            <div className="data-card-header">
              <h4>{machine.name}</h4>
              <span className={`data-card-status ${getStatusClass(machine.status)}`}>
                {machine.status}
              </span>
            </div>
            <div className="data-card-body">
              <p><strong>Type:</strong> {machine.type}</p>
              <p><strong>Purchased:</strong> {machine.purchaseDate}</p>
              <p><strong>Last Maintenance:</strong> {machine.lastMaintenanceDate}</p>
              <p><strong>Next Maintenance:</strong> {machine.nextMaintenanceDate}</p>
              <p><strong>Active:</strong> {machine.isActive ? 'Yes' : 'No'}</p>
            </div>
            <div className="data-card-footer">
              <button className="btn-card-action">Edit</button>
              <button className="btn-card-action btn-danger">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <AddMachineModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddMachine}
      />
    </div>
  );
}

export default MachinesTab;