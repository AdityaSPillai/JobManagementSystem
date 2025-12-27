import React, { useEffect, useState } from 'react';
import axios from '../utils/axios.js';
import useAuth from '../context/context.jsx';

// --- Add Machine Modal ---
function AddMachineModal({ isVisible, onClose, onSubmit, machineCategories }) {
  const [formData, setFormData] = useState({
    name: '',
    machineId: '',
    type: '',
    hourlyRate: 0,
    status: 'true',  // Fixed: matches dropdown options
    purchaseDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    isActive: true,
    supplier: '',
    hsCode: '',
    brand: '',
    countryOfOrigin: '',
    modelNumber: '',
    modelYear: '',
    assetType: '',
    assetValue: 0,
    landedCost: 0,
    installationCost: 0,
    capitalizedValue: 0,
    limeTime: 0,
    depreciationPeriod: 0
  });

  const [currency, setCurrency] = useState("$");
  const { userInfo } = useAuth();

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
      machineId: '',
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
          <h3 className="heading-h3"><img src="/plus.png" alt="Plus Icon" className="plus-icon" /> <span className="add-employee">Add New Machine</span></h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-3">
            <div className="form-group">
              <label htmlFor="name">Machine Name *</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="type">Machine Type *</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} required>
                <option value="">-- Select Category --</option>
                {machineCategories.map(cat => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name} ({currency}{cat.hourlyRate}/hr)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Hourly Rate (auto-filled) *</label>
              <input
                type="number"
                value={formData.hourlyRate || 0}
                readOnly
                style={{ backgroundColor: "#f3f3f3" }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="machineId">Machine ID *</label>
              <input type="text" id="machineId" name="machineId" value={formData.machineId} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="status">Current Status *</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} required>
                <option value={true}>Available</option>
                <option value={false}>Offline</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date * </label>
              <input type="date" id="purchaseDate" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="lastMaintenanceDate">Last Maintenance *</label>
              <input type="date" id="lastMaintenanceDate" name="lastMaintenanceDate" value={formData.lastMaintenanceDate} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="nextMaintenanceDate">Next Maintenance *</label>
              <input type="date" id="nextMaintenanceDate" name="nextMaintenanceDate" value={formData.nextMaintenanceDate} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="supplier">Supplier *</label>
              <input type="text" id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="hsCode">HS Code</label>
              <input type="text" id="hsCode" name="hsCode" value={formData.hsCode} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="brand">Brand *</label>
              <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="countryOfOrigin">Country of Origin *</label>
              <input type="date" id="countryOfOrigin" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="modelNumber">Model Number *</label>
              <input type="text" id="modelNumber" name="modelNumber" value={formData.modelNumber} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="modelYear">Model Year *</label>
              <input type="date" id="modelYear" name="modelYear" value={formData.modelYear} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="assetType">Asset Type *</label>
              <input type="text" id="assetType" name="assetType" value={formData.assetType} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="assetValue">Asset Value *</label>
              <input type="number" id="assetValue" name="assetValue" value={formData.assetValue} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="landedCost">Landed Cost</label>
              <input type="number" id="landedCost" name="landedCost" value={formData.landedCost} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="installationCost">Installation Cost</label>
              <input type="number" id="installationCost" name="installationCost" value={formData.installationCost} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="capitalizedValue">Capitalized Value</label>
              <input type="number" id="capitalizedValue" name="capitalizedValue" value={formData.capitalizedValue} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="limeTime">Lime Time</label>
              <input type="number" id="limeTime" name="limeTime" value={formData.limeTime} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="depreciationPeriod">Depreciation Period</label>
              <input type="number" id="depreciationPeriod" name="depreciationPeriod" value={formData.depreciationPeriod} onChange={handleChange} />
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
    machineId: '',
    type: '',
    hourlyRate: 0,
    status: 'true',  // Fixed: matches dropdown options
    purchaseDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    isActive: true,
    supplier: '',
    hsCode: '',
    brand: '',
    countryOfOrigin: '',
    modelNumber: '',
    modelYear: '',
    assetType: '',
    assetValue: 0,
    landedCost: 0,
    installationCost: 0,
    capitalizedValue: 0,
    limeTime: 0,
    depreciationPeriod: 0
  });

  const [currency, setCurrency] = useState("$");

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
    if (machine) {
      setFormData({
        name: machine.name || '',
        type: machine.type || '',
        machineId: machine.machineId || '',
        status: machine.status || true,
        purchaseDate: machine.purchaseDate ? machine.purchaseDate.split('T')[0] : '',
        lastMaintenanceDate: machine.lastMaintenanceDate ? machine.lastMaintenanceDate.split('T')[0] : '',
        nextMaintenanceDate: machine.nextMaintenanceDate ? machine.nextMaintenanceDate.split('T')[0] : '',
        isActive: machine.isActive ?? true,
        supplier: machine.supplier || '',
        hsCode: machine.hsCode || '',
        brand: machine.brand || '',
        countryOfOrigin: machine.countryOfOrigin || '',
        modelNumber: machine.modelNumber || '',
        modelYear: machine.modelYear ? machine.modelYear.split('T')[0] : '',
        assetType: machine.assetType || '',
        assetValue: machine.assetValue || 0,
        landedCost: machine.landedCost || 0,
        installationCost: machine.installationCost || 0,
        capitalizedValue: machine.capitalizedValue || 0,
        limeTime: machine.limeTime || 0,
        depreciationPeriod: machine.depreciationPeriod || 0

      });
    }
    getCurrency();
  }, [machine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      type: '',
      machineId: '',
      status: true,
      purchaseDate: '',
      lastMaintenanceDate: '',
      nextMaintenanceDate: '',
      isActive: true,
      supplier: '',
      hsCode: '',
      brand: '',
      countryOfOrigin: '',
      modelNumber: '',
      modelYear: '',
      assetType: '',
      assetValue: 0,
      landedCost: 0,
      installationCost: 0,
      capitalizedValue: 0,
      limeTime: 0,
      depreciationPeriod: 0
    })
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3 className="heading-h3"> <img src="/edit.png" alt="Edit Icon" className="edit-icon" /> <span className="add-employee">Edit Machine</span> </h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-3">
            <div className="form-group">
              <label>Machine Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Machine Id *</label>
              <input name="machineId" value={formData.machineId} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Machine Category *</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="">-- Select Category --</option>
                {machineCategories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name} ({currency}{cat.hourlyRate}/hr)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value={true}>Available</option>
                <option value={false}>Offline</option>
              </select>
            </div>

            <div className="form-group">
              <label>Purchase Date *</label>
              <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Last Maintenance *</label>
              <input type="date" name="lastMaintenanceDate" value={formData.lastMaintenanceDate} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Next Maintenance *</label>
              <input type="date" name="nextMaintenanceDate" value={formData.nextMaintenanceDate} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="supplier">Supplier *</label>
              <input type="text" id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="hsCode">HS Code </label>
              <input type="text" id="hsCode" name="hsCode" value={formData.hsCode} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="brand">Brand *</label>
              <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="countryOfOrigin">Country of Origin* </label>
              <input type="text" id="countryOfOrigin" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="modelNumber">Model Number *</label>
              <input type="text" id="modelNumber" name="modelNumber" value={formData.modelNumber} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="modelYear">Model Year *</label>
              <input type="text" id="modelYear" name="modelYear" value={formData.modelYear} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="assetType">Asset Type *</label>
              <input type="text" id="assetType" name="assetType" value={formData.assetType} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="assetValue">Asset Value *</label>
              <input type="number" id="assetValue" name="assetValue" value={formData.assetValue} onChange={handleChange} required />
            </div>
            <div className='form-group'>
              <label htmlFor="landedCost">Landed Cost</label>
              <input type="number" id="landedCost" name="landedCost" value={formData.landedCost} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="installationCost">Installation Cost</label>
              <input type="number" id="installationCost" name="installationCost" value={formData.installationCost} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="capitalizedValue">Capitalized Value</label>
              <input type="number" id="capitalizedValue" name="capitalizedValue" value={formData.capitalizedValue} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="limeTime">Lime Time</label>
              <input type="number" id="limeTime" name="limeTime" value={formData.limeTime} onChange={handleChange} />
            </div>
            <div className='form-group'>
              <label htmlFor="depreciationPeriod">Depreciation Period</label>
              <input type="number" id="depreciationPeriod" name="depreciationPeriod" value={formData.depreciationPeriod} onChange={handleChange} />
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
  const [currency, setCurrency] = useState('$');

  const shopId = userInfo?.shopId;
  const userId = userInfo?._id;
  const [machineCategories, setMachineCategories] = useState([]);

  const handleEditClick = (machine) => {
    setSelectedMachine(machine);
    setIsEditModalOpen(true);
  };

  const handleEditMachine = async (updatedData) => {

    console.log("Editing machine with data:", updatedData);
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

  // Fetch machines when shopId is available
  useEffect(() => {

    if (shopId) {
      fetchMachines(); getCurrency();

      console.log("Fetching machines for shopId:", machines);
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
        <div
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            borderRadius: "12px"
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Machine Name</th>
                  <th>Machine ID</th>
                  <th>Category</th>
                  <th>Hourly Rate</th>
                  <th>Supplier</th>
                  <th>Brand</th>
                  <th>Status</th>
                  <th>Purchase Date</th>
                  <th>Last Maintenance</th>
                  <th>Next Maintenance</th>
                  <th>COF</th>
                  <th>Model No.</th>
                  <th>Model Year</th>
                  <th>Asset Type</th>
                  <th>Asset Value</th>
                  <th>Landed Cost</th>
                  <th>Installation Cost</th>
                  <th>Capitalized Value</th>
                  <th>Lime Time</th>
                  <th>Depreciation Period</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>

              <tbody>
                {machines.map((machine) => (
                  <tr key={machine._id}>
                    <td>
                      <span className="table-primary-text">{machine.name}</span>
                    </td>

                    <td>{machine.machineId || "N/A"}</td>

                    <td>
                      <span className="badge-rate">
                        {machine.type}
                      </span>
                    </td>

                    <td>
                      <span className="badge-rate">
                        {currency}{machine.hourlyRate || 0}/hr
                      </span>
                    </td>

                    <td>{machine.supplier || "—"}</td>

                    <td>{machine.brand || "—"}</td>

                    <td>
                      {machine.status ? (
                        <span
                          className="badge-rate"
                          style={{ background: "#c6f6d5", color: "#22543d" }}
                        >
                          Available
                        </span>
                      ) : (
                        <span
                          className="badge-rate"
                          style={{ background: "#fed7d7", color: "#c53030" }}
                        >
                          Offline
                        </span>
                      )}
                    </td>

                    <td>
                      {machine.purchaseDate
                        ? machine.purchaseDate.split("T")[0]
                        : "N/A"}
                    </td>

                    <td>
                      {machine.lastMaintenanceDate
                        ? machine.lastMaintenanceDate.split("T")[0]
                        : "N/A"}
                    </td>

                    <td>
                      {machine.nextMaintenanceDate
                        ? machine.nextMaintenanceDate.split("T")[0]
                        : "N/A"}
                    </td>
                    <td>{machine.countryOfOrigin || "—"}</td>
                    <td>{machine.modelNumber || "—"}</td>
                    <td>
                      {machine.modelYear
                        ? machine.modelYear.split("T")[0]
                        : "N/A"}
                    </td>
                    <td>{machine.assetType || "—"}</td>
                    <td>{currency}{machine.assetValue || 0}</td>
                    <td>{currency}{machine.landedCost || 0}</td>
                    <td>{currency}{machine.installationCost || 0}</td>
                    <td>{currency}{machine.capitalizedValue || 0}</td>
                    <td>{machine.limeTime || 0}</td>
                    <td>{machine.depreciationPeriod || 0}</td>


                    <td>
                      <div className="table-actions">
                        <button
                          className="table-cta"
                          onClick={() => handleEditClick(machine)}
                        >
                          Edit
                        </button>

                        <button
                          className="table-cta table-cta-danger"
                          onClick={() => handleDeleteMachine(machine._id)}
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