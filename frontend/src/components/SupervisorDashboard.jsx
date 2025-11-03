import { useState, useEffect } from 'react';
import Header from './Header';
import '../styles/SupervisorDashboard.css'; // Use the supervisor CSS
import useAuth from '../context/context.js';
// Import all necessary icons
import clipboardIcon from '../assets/clipboard.svg';
import workerIcon from '../assets/worker.svg';
import userIcon from '../assets/user.svg';
import calendarIcon from '../assets/calendar.svg';
import editIcon from '../assets/edit.svg';
// --- NEW ICON IMPORTS ---
import refreshIcon from '../assets/refresh.svg';
import infoIcon from '../assets/info.svg';
import tickIcon from '../assets/tick.svg'; // Already imported, used for ✅
import deleteIcon from '../assets/delete.svg'; // For the bin/trash icon
import axios from "../utils/axios.js"
// --- END NEW ICON IMPORTS ---

// --- Edit Job Modal Component (Updated with Delete Icon) ---
function EditJobModal({ isOpen, onClose, jobs, initialJobData, onSave, onDelete }) {
  const [selectedJobIdInternal, setSelectedJobIdInternal] = useState('');
  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    if (isOpen && initialJobData) {
      setSelectedJobIdInternal(initialJobData.id);
      setEditFormData(JSON.parse(JSON.stringify(initialJobData)));
    } else if (isOpen && !initialJobData) {
      setSelectedJobIdInternal('');
      setEditFormData(null);
    }
  }, [isOpen, initialJobData]);

  const handleJobSelect = (id) => {
    setSelectedJobIdInternal(id);
    if (id) {
      const jobToEdit = jobs.find(job => job.id === id);
      setEditFormData(JSON.parse(JSON.stringify(jobToEdit)));
    } else {
      setEditFormData(null);
    }
  };

  const handleClose = () => {
    setSelectedJobIdInternal('');
    setEditFormData(null);
    onClose();
  };

  const handleFormChange = (field, value) => setEditFormData(prev => ({ ...prev, [field]: value }));
  const handleItemChange = (index, field, value, type) => {
    setEditFormData(prev => {
      const newItems = [...prev[type]];
      if (field === 'estimatedPrice' || field === 'quantity' || field === 'perPiecePrice') {
        newItems[index][field] = parseFloat(value) || 0;
      } else {
        newItems[index][field] = value;
      }
      return { ...prev, [type]: newItems };
    });
  };
  const addItem = (type) => {
    setEditFormData(prev => {
      let newItem;
      if (type === 'items') newItem = { jobType: '', description: '', estimatedPrice: 0, itemStatus: 'stopped' };
      else if (type === 'machines') newItem = { machineType: '', description: '', estimatedPrice: 0 };
      else newItem = { name: '', quantity: 1, perPiecePrice: 0 };
      return { ...prev, [type]: [...prev[type], newItem] };
    });
  };
  const removeItem = (index, type) => {
    if (type === 'items' && editFormData.items.length <= 1) return;
    setEditFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
  };
  
  const handleStatusChange = (e) => setEditFormData(prev => ({ ...prev, status: e.target.value }));
  const handleResetTimers = () => {
    if (window.confirm('Are you sure you want to reset all task statuses to "stopped" for this job?')) {
      setEditFormData(prev => ({ ...prev, items: prev.items.map(item => ({ ...item, itemStatus: 'stopped' })) }));
      alert('Task statuses reset. Save changes to apply.');
    }
  };
  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to permanently delete Job ${editFormData.id}? This action cannot be undone.`)) {
      onDelete(editFormData.id);
      handleClose();
    }
  };
  const handleSubmit = (e) => { e.preventDefault(); onSave(editFormData); handleClose(); };
  const calculateTotal = () => {
    if (!editFormData) return 0;
    const itemsTotal = editFormData.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const machinesTotal = editFormData.machines.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const consumablesTotal = editFormData.consumables.reduce((sum, item) => sum + ((item.quantity || 0) * (item.perPiecePrice || 0)), 0);
    return itemsTotal + machinesTotal + consumablesTotal;
   };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content create-job-form large">
        <div className="form-header">
          <h3><img src={editIcon} alt="Edit" className="inline-icon" /> Edit Job Card</h3>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {!initialJobData && !editFormData && (
          <div className="job-selection-step">
            <p className="form-subtitle">Please select a job to edit:</p>
            <div className="form-group">
              <label>Select Job ID</label>
              <select className="employee-select" value={selectedJobIdInternal} onChange={(e) => handleJobSelect(e.target.value)}>
                <option value="">-- Select a Job --</option>
                {jobs.map(job => (<option key={job.id} value={job.id}>{job.id} - {job.customer_name} ({job.vehicle_number})</option>))}
              </select>
            </div>
          </div>
        )}

        {editFormData && (
          <form onSubmit={handleSubmit}>
            {!initialJobData && (<button type="button" className="btn-back" onClick={() => handleJobSelect('')}>&larr; Back to Job Selection</button>)}
            
            {/* Customer Fields */}
            <div className="form-row">
              <div className="form-group"><label>Customer Name *</label><input type="text" value={editFormData.customer_name} onChange={(e) => handleFormChange('customer_name', e.target.value)} /></div>
              <div className="form-group"><label>Contact Number *</label><input type="tel" value={editFormData.contact_number} onChange={(e) => handleFormChange('contact_number', e.target.value)} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Vehicle Number *</label><input type="text" value={editFormData.vehicle_number} onChange={(e) => handleFormChange('vehicle_number', e.target.value)} /></div>
              <div className="form-group"><label>Vehicle Model</label><input type="text" value={editFormData.vehicle_model} onChange={(e) => handleFormChange('vehicle_model', e.target.value)} /></div>
            </div>
            <div className="form-group"><label>Engine Number</label><input type="text" value={editFormData.engine_number} onChange={(e) => handleFormChange('engine_number', e.target.value)} /></div>

            {/* Supervisor Actions */}
            <div className="job-items-section supervisor-actions">
              <div className="section-title"><h4>Supervisor Actions</h4></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Status</label>
                  <select className="employee-select" value={editFormData.status} onChange={handleStatusChange}>
                    <option value="Not Assigned">Not Assigned</option><option value="Assigned">Assigned</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Task Statuses</label>
                  <button type="button" className="btn-reset-timer" onClick={handleResetTimers}>Reset All Task Statuses</button>
                </div>
              </div>
            </div>

            {/* Job Tasks */}
            <div className="job-items-section">
              <div className="section-title"><h4>Job Tasks</h4><button type="button" className="btn-add-job" onClick={() => addItem('items')}>+ Add Task</button></div>
              {editFormData.items.map((item, index) => (
                <div key={index} className="job-item-row job-item-row-tasks">
                   <div className="job-item-field"><label>Task #{index + 1}</label></div>
                   <div className="job-item-field"><label>Job Type</label><input type="text" value={item.jobType} onChange={(e) => handleItemChange(index, 'jobType', e.target.value, 'items')} /></div>
                   <div className="job-item-field"><label>Description *</label><input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value, 'items')} /></div>
                   <div className="job-item-field"><label>Est. Price ($)*</label><input type="number" value={item.estimatedPrice || ''} onChange={(e) => handleItemChange(index, 'estimatedPrice', e.target.value, 'items')} /></div>
                   <button type="button" className="btn-remove" onClick={() => removeItem(index, 'items')} disabled={editFormData.items.length === 1}><img src={deleteIcon} alt="Remove" className="btn-icon small" /></button>
                </div>
              ))}
            </div>

            {/* Machines */}
            <div className="job-items-section">
              <div className="section-title"><h4>Machine Usage (Optional)</h4><button type="button" className="btn-add-job" onClick={() => addItem('machines')}>+ Add Machine</button></div>
              {editFormData.machines.map((item, index) => (
                <div key={index} className="job-item-row job-item-row-machines">
                   <div className="job-item-field"><label>Machine #{index + 1}</label></div>
                   <div className="job-item-field"><label>Machine Type</label><input type="text" value={item.machineType} onChange={(e) => handleItemChange(index, 'machineType', e.target.value, 'machines')} /></div>
                   <div className="job-item-field"><label>Description</label><input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value, 'machines')} /></div>
                   <div className="job-item-field"><label>Est. Price ($)</label><input type="number" value={item.estimatedPrice || ''} onChange={(e) => handleItemChange(index, 'estimatedPrice', e.target.value, 'machines')} /></div>
                   <button type="button" className="btn-remove" onClick={() => removeItem(index, 'machines')}><img src={deleteIcon} alt="Remove" className="btn-icon small" /></button>
                </div>
              ))}
            </div>

            {/* Consumables */}
            <div className="job-items-section">
              <div className="section-title"><h4>Consumables (Optional)</h4><button type="button" className="btn-add-job" onClick={() => addItem('consumables')}>+ Add Consumable</button></div>
              {editFormData.consumables.map((item, index) => (
                <div key={index} className="job-item-row job-item-row-consumables">
                   <div className="job-item-field"><label>Item #{index + 1}</label></div>
                   <div className="job-item-field"><label>Name of Consumable</label><input type="text" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value, 'consumables')} /></div>
                   <div className="job-item-field"><label>Quantity</label><input type="number" value={item.quantity || ''} onChange={(e) => handleItemChange(index, 'quantity', e.target.value, 'consumables')} /></div>
                   <div className="job-item-field"><label>Price Per Piece ($)</label><input type="number" value={item.perPiecePrice || ''} onChange={(e) => handleItemChange(index, 'perPiecePrice', e.target.value, 'consumables')} /></div>
                   <button type="button" className="btn-remove" onClick={() => removeItem(index, 'consumables')}><img src={deleteIcon} alt="Remove" className="btn-icon small" /></button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="form-footer edit-footer">
              <button type="button" className="btn-delete-job" onClick={handleDeleteClick}>Delete Job</button>
              <div className="footer-right">
                <div className="total-amount"><span>Total Est. Amount:</span><span className="amount">${calculateTotal().toFixed(2)}</span></div>
                <button type="submit" className="btn-save-job">Save Changes</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
// --- End Edit Job Modal ---


// --- Main Supervisor Dashboard Component ---
function SupervisorDashboard({ onLogout }) {
  const [showJobDetails, setShowJobDetails] = useState(true); // Default to showing details
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null); // Initially no job selected
  const [jobToEdit, setJobToEdit] = useState(null);
  const {userInfo}=useAuth();
  
  // Employee list
  const employees = [
    { id: 'EMP001', name: 'John Doe' }, { id: 'EMP002', name: 'Jane Smith' }, { id: 'EMP003', name: 'Mike Johnson' }, { id: 'EMP004', name: 'Sarah Williams' }, { id: 'EMP005', name: 'David Brown' }
   ];

  // Jobs array
  const [jobs, setJobs] = useState([]);

  // Form state for creating new job
 const [formData, setFormData] = useState({
    templateId: '68f50077a6d75c0ab83cd019',
    isVerifiedByUser: true,
    shopId: userInfo?.shopId || '',
    formData: {
      customer_name: '',
      vehicle_number: '',
      engine_number: '',
      vehicle_model: '',
      contact_number: '',
    },
    jobItems: [
      {
        itemData: {
          job_type: '',
          description: '',
          priority: '',
        },
        estimatedPrice: 0,
        machine: {
          machineRequired: null,
          startTime: null,
          endTime: null,
          actualDuration: null,
        },
        worker: {
          workerAssigned: null,
          startTime: null,
          endTime: null,
          actualDuration: null,
        },
        material: {
          materialsRequired: [],
          estimatedPrice: 0,
        },
      },
    ],
    machines: [],
    consumables: []
  });
  useEffect(() => {
      if (!userInfo) return;
      if (!userInfo.shopId) {
        console.log("⚠️ User info loaded but no shopId found");
        return;
      }
      getAllJobs();
    }, [userInfo]);

useEffect(() => {
    if (selectedJob) {
      const updatedJob = jobs.find(job => job.id === selectedJob.id);
      if (updatedJob) {
        setSelectedJob(updatedJob);
      }
    }
  }, [jobs, selectedJob]);



const getAllJobs = async () => {
  try {
    const res = await axios.get(`/shop/getAllJobs/${userInfo?.shopId}`);
    if (res.data?.allJobs?.length > 0) {
      // Transform backend data to match display structure
      const transformedJobs = res.data.allJobs.map(job => ({
        id: job._id || job.jobId,
        customer_name: job.formData?.customer_name || '',
        vehicle_number: job.formData?.vehicle_number || '',
        engine_number: job.formData?.engine_number || '',
        vehicle_model: job.formData?.vehicle_model || '',
        contact_number: job.formData?.contact_number || '',
        date: new Date(job.createdAt || Date.now()).toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        status: job.status || 'Not Assigned',
        assignedEmployee: job.assignedEmployee || null,
        items: job.jobItems?.map(item => ({
          jobType: item.itemData?.job_type || '',
          description: item.itemData?.description || '',
          estimatedPrice: item.estimatedPrice || 0,
          itemStatus: item.itemStatus || 'stopped'
        })) || [],
        machines: [], // Add if backend provides this
        consumables: [] // Add if backend provides this
      }));
      
      setJobs(transformedJobs);
      console.log('Transformed jobs:', transformedJobs);
    } else {
      console.log("No jobs found for this shop");
      setJobs([]); // Set empty array instead of leaving old data
    }
  } catch (error) {
    console.error("Error fetching Jobs:", error);
    setJobs([]); // Set empty array on error
  }
};

useEffect(() => {
  console.log('Jobs updated:', jobs);
}, [jobs]);;







  // Select first job initially if available
  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
      setShowJobDetails(true);
    } else if (jobs.length === 0) {
      setSelectedJob(null);
      setShowJobDetails(false);
    }
  }, [jobs]); // Re-run if jobs list changes (e.g., after delete)

  // Effect to update selected job view if jobs list changes
  useEffect(() => {
    if (selectedJob) {
      const updatedJob = jobs.find(job => job.id === selectedJob.id);
      setSelectedJob(updatedJob || null);
      if (!updatedJob) setShowJobDetails(false);
    }
  }, [jobs, selectedJob?.id]);

  // Handle employee selection
  const handleEmployeeSelect = (jobId, employeeId) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const employee = employees.find(e => e.id === employeeId);
        const hasRunningTask = job.items.some(item => item.itemStatus === 'running');
        if (hasRunningTask) {
             alert('Cannot change assigned employee while a job task is running. Please ask the employee to pause first, or use the Edit Job function to reset timers.');
             return job;
        }
        return { ...job, assignedEmployee: employee, status: (job.status === 'Not Assigned' && employee) ? 'Assigned' : job.status };
      }
      return job;
    }));
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => job.id.toLowerCase().includes(searchQuery.toLowerCase()) || job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || job.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase()));

  // Generate ID
  const generateJobId = () => { const today = new Date(); const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); const jobNumber = String(jobs.length + 1).padStart(4, '0'); return `JOB-${dateStr}-${jobNumber}`; };

  // Create Form Handlers
  const handleFormChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleJobItemChange = (index, field, value) => { const newItems = [...formData.items]; newItems[index][field] = field === 'estimatedPrice' ? parseFloat(value) || 0 : value; setFormData(prev => ({ ...prev, items: newItems })); };
  const addJobItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { jobType: '', description: '', estimatedPrice: 0 }] }));
  const removeJobItem = (index) => { if (formData.items.length > 1) { const newItems = formData.items.filter((_, i) => i !== index); setFormData(prev => ({ ...prev, items: newItems })); } };
  const handleMachineChange = (index, field, value) => { const newMachines = [...formData.machines]; newMachines[index][field] = field === 'estimatedPrice' ? parseFloat(value) || 0 : value; setFormData(prev => ({ ...prev, machines: newMachines })); };
  const addMachine = () => setFormData(prev => ({ ...prev, machines: [...prev.machines, { machineType: '', description: '', estimatedPrice: 0 }] }));
  const removeMachine = (index) => { const newMachines = formData.machines.filter((_, i) => i !== index); setFormData(prev => ({ ...prev, machines: newMachines })); };
  const handleConsumableChange = (index, field, value) => { const newConsumables = [...formData.consumables]; newConsumables[index][field] = (field === 'quantity' || field === 'perPiecePrice') ? parseFloat(value) || 0 : value; setFormData(prev => ({ ...prev, consumables: newConsumables })); };
  const addConsumable = () => setFormData(prev => ({ ...prev, consumables: [...prev.consumables, { name: '', quantity: 1, perPiecePrice: 0 }] }));
  const removeConsumable = (index) => { const newConsumables = formData.consumables.filter((_, i) => i !== index); setFormData(prev => ({ ...prev, consumables: newConsumables })); };
  const calculateFormTotal = () => { const itemsTotal = formData.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0); const machinesTotal = formData.machines.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0); const consumablesTotal = formData.consumables.reduce((sum, item) => sum + ((item.quantity || 0) * (item.perPiecePrice || 0)), 0); return itemsTotal + machinesTotal + consumablesTotal; };
  const calculateJobTotal = (job) => { if (!job) return 0; const itemsTotal = job.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0); const machinesTotal = job.machines.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0); const consumablesTotal = job.consumables.reduce((sum, item) => sum + ((item.quantity || 0) * (item.perPiecePrice || 0)), 0); return itemsTotal + machinesTotal + consumablesTotal; };

  // Save new job
  const handleSaveJob = () => {
    if (!formData.customer_name || !formData.vehicle_number || !formData.contact_number) { alert('Please fill in required fields: Customer Name, Vehicle Number, and Contact Number'); return; }
    if (formData.items.some(item => !item.description || !item.estimatedPrice)) { alert('Please fill in all job item descriptions and prices'); return; }
    const newJob = { id: generateJobId(), customer_name: formData.customer_name, vehicle_number: formData.vehicle_number, engine_number: formData.engine_number, vehicle_model: formData.vehicle_model, contact_number: formData.contact_number, date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }), status: 'Not Assigned', assignedEmployee: null, items: formData.items.map(item => ({ ...item, itemStatus: 'stopped' })), machines: formData.machines, consumables: formData.consumables };
    setJobs(prev => [newJob, ...prev]);
    setFormData({ customer_name: '', vehicle_number: '', engine_number: '', vehicle_model: '', contact_number: '', items: [{ jobType: '', description: '', estimatedPrice: 0 }], machines: [], consumables: [] });
    setShowCreateJob(false);
    alert('Job card created successfully!');
  };

  // Save Updated Job
  const handleUpdateJob = (updatedJob) => {
    setJobs(prevJobs => prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    alert(`Job ${updatedJob.id} updated successfully!`);
    if (selectedJob && selectedJob.id === updatedJob.id) {
        setSelectedJob(updatedJob); // Update the view if the selected job was edited
        setShowJobDetails(true); // Ensure details view is shown after edit
    }
  };

  // Delete Job
  const handleDeleteJob = (jobId) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    alert(`Job ${jobId} deleted successfully!`);
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(null);
      setShowJobDetails(false);
    }
  };
  
  // Open Edit Modal for Selected Job
  const openEditModalForSelected = () => {
    if (selectedJob) {
      setJobToEdit(selectedJob);
      setShowEditJobModal(true);
      setShowCreateJob(false);
      // Keep details view open in background? Decided against it for clarity.
      // setShowJobDetails(false); // Optionally close details view
    } else {
      alert("Please select a job from the list first.");
    }
  };

  // Open Edit Modal without pre-selection
  const openGeneralEditModal = () => {
      setJobToEdit(null);
      setShowEditJobModal(true);
      setShowCreateJob(false);
      setShowJobDetails(false); // Hide details view when opening general edit
      setSelectedJob(null);
  };

  return (
    <div className="supervisor-dashboard">
      <Header userRole="Supervisor" onLogout={onLogout} showLogin={false} />
      
      {/* Supervisor Banner */}
      <div className="dashboard-banner supervisor-banner">
         <div className="banner-content"><h2>Supervisor Dashboard</h2><p>Assign jobs, edit details, and track progress</p></div>
         <div className="stats-cards">
           <div className="stat-card"><span className="stat-label">Active Jobs</span><span className="stat-value">{jobs.filter(j => j.status === 'In Progress' || j.status === 'Assigned').length}</span><span className="stat-icon"><img src={refreshIcon} alt="Active"/></span></div>
           <div className="stat-card"><span className="stat-label">Not Assigned</span><span className="stat-value">{jobs.filter(j => j.status === 'Not Assigned').length}</span><span className="stat-icon"><img src={infoIcon} alt="Info"/></span></div>
           <div className="stat-card"><span className="stat-label">Completed</span><span className="stat-value">{jobs.filter(j => j.status === 'Completed').length}</span><span className="stat-icon"><img src={tickIcon} alt="Completed"/></span></div>
         </div>
      </div>

      <div className="dashboard-content">
        {/* Title Section */}
        <div className="dashboard-title-section supervisor-title-section">
          <div className="dashboard-wrapper">
            <div className="dashboard-title"><h2>Job Management</h2><p>Assign, edit, and create new job cards</p></div>
            <div className="action-buttons">
              <button className="btn-action" onClick={openGeneralEditModal}><img src={editIcon} alt="Edit" className="btn-icon-left" /> Edit Job</button>
              <button className="btn-action-primary" onClick={() => { setShowCreateJob(true); setShowJobDetails(false); setSelectedJob(null); }}>+ Add Job Card</button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Job List */}
          <div className="job-list-section">
            <div className="section-header"><h3><img src={clipboardIcon} alt="Jobs" className="inline-icon" /> Job Cards</h3></div>
            <input type="text" className="search-input" placeholder="Search by job number, customer or vehicle..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {filteredJobs.length === 0 ? (<div className="no-jobs-found"><p>No jobs found...</p></div>) : (
              filteredJobs.map((job) => (
                <div key={job.id} className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`} onClick={() => { setSelectedJob(job); setShowJobDetails(true); setShowCreateJob(false); }}>
                  <div className="job-header">
                    <span className="job-number">{job.id}</span>
                    <span className={`status-badge ${ job.status === 'In Progress' ? 'status-progress' : job.status === 'Completed' ? 'status-completed' : job.status === 'Assigned' ? 'status-assigned-active' : 'status-assigned' }`}>{job.status}</span>
                  </div>
                  <p className="job-owner">{job.customer_name}</p>
                  <div className="job-details">
                    <span><img src={userIcon} alt="Vehicle" className="inline-icon" /> {job.vehicle_number}</span>
                    <span><img src={calendarIcon} alt="Date" className="inline-icon" /> {job.date}</span>
                  </div>
                  {job.assignedEmployee && (<p className="job-employee"><img src={workerIcon} alt="Worker" className="inline-icon" /> {job.assignedEmployee.name}</p>)}
                  <p className="job-items">{job.items.length} tasks</p>
                </div>
              ))
            )}
          </div>

          {/* Details Section */}
          <div className="details-section">
            {!showJobDetails && !showCreateJob && (<div className="no-selection"><div className="no-selection-icon"><img src={clipboardIcon} alt="No selection" /></div><p>No Selection</p><p className="no-selection-hint">Click a job card to view details or create a new job.</p></div>)}

            {showJobDetails && selectedJob && (
              <div className="job-details-view">
                <div className="form-header">
                  <div className="header-left"><h3><img src={clipboardIcon} alt="Details" className="inline-icon" /> Job Details</h3><p>Job ID: {selectedJob.id}</p></div>
                  <div className="header-right-actions">
                    <button className="btn-edit-selected" onClick={openEditModalForSelected}><img src={editIcon} alt="Edit" className="btn-icon-left small" /> Edit This Job</button>
                    <button className="close-btn" onClick={() => { setShowJobDetails(false); setSelectedJob(null); }}>✕</button>
                  </div>
                </div>
                <div className="job-detail-content">
                   {/* Customer Info */}
                   <div className="job-info-grid">
                     <div><strong>Customer:</strong> <span>{selectedJob.customer_name}</span></div><div><strong>Contact:</strong> <span>{selectedJob.contact_number}</span></div><div><strong>Vehicle:</strong> <span>{selectedJob.vehicle_number}</span></div><div><strong>Model:</strong> <span>{selectedJob.vehicle_model || 'N/A'}</span></div><div><strong>Engine:</strong> <span>{selectedJob.engine_number || 'N/A'}</span></div><div><strong>Date:</strong> <span>{selectedJob.date}</span></div>
                     <div><strong>Status:</strong><span className={`status-badge ${ selectedJob.status === 'In Progress' ? 'status-progress' : selectedJob.status === 'Completed' ? 'status-completed' : selectedJob.status === 'Assigned' ? 'status-assigned-active' : 'status-assigned' }`}>{selectedJob.status}</span></div>
                     <div className="full-width">
                       <strong>Assigned Employee:</strong>
                       <select className="employee-select" value={selectedJob.assignedEmployee?.id || ''} onChange={(e) => handleEmployeeSelect(selectedJob.id, e.target.value)} disabled={selectedJob.status === 'Completed'}>
                         <option value="">Select Employee</option>{employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>))}
                       </select>
                     </div>
                   </div>
                   {/* Job Tasks */}
                   <div className="job-items-container">
                     <strong className="job-items-title">Job Tasks:</strong>
                     {selectedJob.items.map((item, index) => (
                       <div key={index} className="job-detail-item">
                         <div className="item-header-row">
                           <div className="item-info">
                             <div className="item-title"><strong>Job #{index + 1}</strong>{item.jobType && <span className="item-type">({item.jobType})</span>}</div>
                             <div className="item-description">{item.description}</div><div className="item-price">${item.estimatedPrice.toFixed(2)}</div>
                           </div>
                           <div className="item-status-display">
                             <span className={`status-badge ${ item.itemStatus === 'running' ? 'status-progress' : item.itemStatus === 'completed' ? 'status-completed' : item.itemStatus === 'paused' ? 'status-assigned' : 'status-assigned' }`}>{item.itemStatus}</span>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                   {/* Machines */}
                   {selectedJob.machines.length > 0 && (<div className="job-items-container"><strong className="job-items-title">Machines Used:</strong>{selectedJob.machines.map((machine, index) => (<div key={index} className="job-detail-item simple-item-row"><div className="item-info"><div className="item-title"><strong>{machine.machineType}</strong></div><div className="item-description">{machine.description}</div></div><div className="item-price">${machine.estimatedPrice.toFixed(2)}</div></div>))}</div>)}
                   {/* Consumables */}
                   {selectedJob.consumables.length > 0 && (<div className="job-items-container"><strong className="job-items-title">Consumables Used:</strong>{selectedJob.consumables.map((item, index) => (<div key={index} className="job-detail-item simple-item-row"><div className="item-info"><div className="item-title"><strong>{item.name}</strong></div><div className="item-description">{item.quantity} x ${item.perPiecePrice.toFixed(2)}</div></div><div className="item-price">${(item.quantity * item.perPiecePrice).toFixed(2)}</div></div>))}</div>)}
                   {/* Total */}
                   <div className="job-detail-total"><strong className="total-label">Total Estimated Amount:</strong><strong className="total-amount">${calculateJobTotal(selectedJob).toFixed(2)}</strong></div>
                </div>
              </div>
            )}

            {/* Create Job Form */}
            {showCreateJob && (
              <div className="create-job-form">
                 <div className="form-header"><h3><img src={clipboardIcon} alt="Create" className="inline-icon" /> Create New Job Card</h3><button className="close-btn" onClick={() => setShowCreateJob(false)}>✕</button></div>
                 <p className="form-subtitle">Fill in the details to create a new job order</p>
                 {/* Customer Fields */}
                 <div className="form-row"><div className="form-group"><label>Customer Name *</label><input type="text" placeholder="Customer Name" value={formData.customer_name} onChange={(e) => handleFormChange('customer_name', e.target.value)} /></div><div className="form-group"><label>Contact Number *</label><input type="tel" placeholder="Contact Number" value={formData.contact_number} onChange={(e) => handleFormChange('contact_number', e.target.value)} /></div></div>
                 <div className="form-row"><div className="form-group"><label>Vehicle Number *</label><input type="text" placeholder="Vehicle Number" value={formData.vehicle_number} onChange={(e) => handleFormChange('vehicle_number', e.target.value)} /></div><div className="form-group"><label>Vehicle Model</label><input type="text" placeholder="Vehicle Model" value={formData.vehicle_model} onChange={(e) => handleFormChange('vehicle_model', e.target.value)} /></div></div>
                 <div className="form-group"><label>Engine Number</label><input type="text" placeholder="Engine Number" value={formData.engine_number} onChange={(e) => handleFormChange('engine_number', e.target.value)} /></div>
                 {/* Job Tasks */}
                 <div className="job-items-section"><div className="section-title"><h4>Job Tasks</h4><button type="button" className="btn-add-job" onClick={addJobItem}>+ Add Task</button></div>{formData.items.map((item, index) => (<div key={index} className="job-item-row job-item-row-tasks"><div className="job-item-field"><label>Task #{index + 1}</label></div><div className="job-item-field"><label>Job Type</label><input type="text" value={item.jobType} onChange={(e) => handleJobItemChange(index, 'jobType', e.target.value)} /></div><div className="job-item-field"><label>Description *</label><input type="text" value={item.description} onChange={(e) => handleJobItemChange(index, 'description', e.target.value)} /></div><div className="job-item-field"><label>Est. Price ($)*</label><input type="number" value={item.estimatedPrice || ''} onChange={(e) => handleJobItemChange(index, 'estimatedPrice', e.target.value)} /></div><button type="button" className="btn-remove" onClick={() => removeJobItem(index)} disabled={formData.items.length === 1}><img src={deleteIcon} alt="Remove" className="btn-icon small" /></button></div>))}</div>
                 {/* Machines */}
                 <div className="job-items-section"><div className="section-title"><h4>Machine Usage (Optional)</h4><button type="button" className="btn-add-job" onClick={addMachine}>+ Add Machine</button></div>{formData.machines.map((item, index) => (<div key={index} className="job-item-row job-item-row-machines"><div className="job-item-field"><label>Machine #{index + 1}</label></div><div className="job-item-field"><label>Machine Type</label><input type="text" value={item.machineType} onChange={(e) => handleMachineChange(index, 'machineType', e.target.value)} /></div><div className="job-item-field"><label>Description</label><input type="text" value={item.description} onChange={(e) => handleMachineChange(index, 'description', e.target.value)} /></div><div className="job-item-field"><label>Est. Price ($)</label><input type="number" value={item.estimatedPrice || ''} onChange={(e) => handleMachineChange(index, 'estimatedPrice', e.target.value)} /></div><button type="button" className="btn-remove" onClick={() => removeMachine(index)}><img src={deleteIcon} alt="Remove" className="btn-icon small" /></button></div>))}</div>
                 {/* Consumables */}
                 <div className="job-items-section"><div className="section-title"><h4>Consumables (Optional)</h4><button type="button" className="btn-add-job" onClick={addConsumable}>+ Add Consumable</button></div>{formData.consumables.map((item, index) => (<div key={index} className="job-item-row job-item-row-consumables"><div className="job-item-field"><label>Item #{index + 1}</label></div><div className="job-item-field"><label>Name</label><input type="text" value={item.name} onChange={(e) => handleConsumableChange(index, 'name', e.target.value)} /></div><div className="job-item-field"><label>Quantity</label><input type="number" value={item.quantity || ''} onChange={(e) => handleConsumableChange(index, 'quantity', e.target.value)} /></div><div className="job-item-field"><label>Price/Piece ($)</label><input type="number" value={item.perPiecePrice || ''} onChange={(e) => handleConsumableChange(index, 'perPiecePrice', e.target.value)} /></div><button type="button" className="btn-remove" onClick={() => removeConsumable(index)}><img src={deleteIcon} alt="Remove" className="btn-icon small" /></button></div>))}</div>
                 {/* Footer */}
                 <div className="form-footer"><div className="total-amount"><span>Total Estimated Amount:</span><span className="amount">${calculateFormTotal().toFixed(2)}</span></div><button className="btn-save-job" onClick={handleSaveJob}>Save Job Card</button></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Job Modal */}
      <EditJobModal isOpen={showEditJobModal} onClose={() => setShowEditJobModal(false)} jobs={jobs} initialJobData={jobToEdit} onSave={handleUpdateJob} onDelete={handleDeleteJob} />
    </div>
  );
}

export default SupervisorDashboard;