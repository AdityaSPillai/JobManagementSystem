import { useState, useEffect } from 'react';
import Header from './Header';
import playIcon from '../assets/play.svg';
import pauseIcon from '../assets/pause.svg';
import tickIcon from '../assets/tick.svg';

// --- NEW ICON IMPORTS ---
import clipboardIcon from '../assets/clipboard.svg';
import workerIcon from '../assets/worker.svg';
import userIcon from '../assets/user.svg';
import calendarIcon from '../assets/calendar.svg';
// --- END NEW ICON IMPORTS ---

import '../styles/EstimatorDashboard.css';

function EstimatorDashboard({ onLoginClick }) {
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Employee list
  const employees = [
    { id: 'EMP001', name: 'John Doe' },
    { id: 'EMP002', name: 'Jane Smith' },
    { id: 'EMP003', name: 'Mike Johnson' },
    { id: 'EMP004', name: 'Sarah Williams' },
    { id: 'EMP005', name: 'David Brown' }
  ];

  // Jobs array with new structure
  const [jobs, setJobs] = useState([
    {
      id: 'JOB-20251004-0001',
      customer_name: 'Devanath DR',
      vehicle_number: 'ABC-123',
      engine_number: 'EN12345',
      vehicle_model: 'Toyota Camry 2018',
      contact_number: '555-1234',
      date: 'Oct 5, 2025, 08:30 AM',
      status: 'In Progress',
      assignedEmployee: { id: 'EMP001', name: 'John Doe' },
      items: [
        { jobType: 'Oil Change', description: 'Change engine oil', estimatedPrice: 50, itemStatus: 'running' },
        { jobType: 'Brake Check', description: 'Inspect brake pads', estimatedPrice: 75, itemStatus: 'stopped' }
      ],
      machines: [
        { machineType: '2-Post Lift', description: 'Vehicle Lift', estimatedPrice: 20 }
      ],
      consumables: [
        { name: 'Engine Oil', quantity: 5, perPiecePrice: 8 },
        { name: 'Oil Filter', quantity: 1, perPiecePrice: 15 }
      ]
    },
    {
      id: 'JOB-20251004-0002',
      customer_name: 'Aljo KJ',
      vehicle_number: 'XYZ-789',
      engine_number: 'EN67890',
      vehicle_model: 'Honda Civic 2020',
      contact_number: '555-5678',
      date: 'Oct 5, 2025, 08:30 AM',
      status: 'Not Assigned',
      assignedEmployee: null,
      items: [
        { jobType: 'Tire Rotation', description: 'Rotate all 4 tires', estimatedPrice: 40, itemStatus: 'stopped' },
      ],
      machines: [],
      consumables: []
    }
  ]);

  // Form state for creating new job
  const [formData, setFormData] = useState({
    customer_name: '',
    vehicle_number: '',
    engine_number: '',
    vehicle_model: '',
    contact_number: '',
    items: [{ jobType: '', description: '', estimatedPrice: 0 }],
    machines: [],
    consumables: []
  });

  // Update selected job when jobs change
  useEffect(() => {
    if (selectedJob) {
      const updatedJob = jobs.find(job => job.id === selectedJob.id);
      if (updatedJob) {
        setSelectedJob(updatedJob);
      }
    }
  }, [jobs, selectedJob]);


  // Handle employee selection
  const handleEmployeeSelect = (jobId, employeeId) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const employee = employees.find(e => e.id === employeeId);
        const hasRunningTask = job.items.some(item => item.itemStatus === 'running');
        if (hasRunningTask) {
             alert('Cannot change assigned employee while a job task is running.');
             return job;
        }
        return { 
          ...job, 
          assignedEmployee: employee,
          status: employee ? 'Assigned' : 'Not Assigned'
        };
      }
      return job;
    }));
  };

  // --- SIMPLIFIED BUTTON HANDLERS ---
  const handleStartItemTimer = (jobId, itemIndex) => {
    console.log(`API CALL: Start timer for job ${jobId}, item ${itemIndex}`);
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        if (!job.assignedEmployee) {
          alert('Please assign an employee to the job card before starting any task.');
          return job;
        }
        const newItems = [...job.items];
        newItems[itemIndex].itemStatus = 'running';
        const hasRunningTask = newItems.some(item => item.itemStatus === 'running');
        return { ...job, items: newItems, status: hasRunningTask ? 'In Progress' : job.status };
      }
      return job;
    }));
  };

  const handlePauseItemTimer = (jobId, itemIndex) => {
    console.log(`API CALL: Pause timer for job ${jobId}, item ${itemIndex}`);
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const newItems = [...job.items];
        newItems[itemIndex].itemStatus = 'paused';
        const hasRunningTask = newItems.some(item => item.itemStatus === 'running');
        return { ...job, items: newItems, status: hasRunningTask ? 'In Progress' : 'Assigned' };
      }
      return job;
    }));
  };

  const handleEndItemTimer = (jobId, itemIndex) => {
    console.log(`API CALL: End timer for job ${jobId}, item ${itemIndex}`);
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const newItems = [...job.items];
        newItems[itemIndex].itemStatus = 'completed';
        const allCompleted = newItems.every(item => item.itemStatus === 'completed');
        const hasRunningTask = newItems.some(item => item.itemStatus === 'running');
        return { ...job, items: newItems, status: allCompleted ? 'Completed' : (hasRunningTask ? 'In Progress' : 'Assigned') };
      }
      return job;
    }));
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate new job ID
  const generateJobId = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const jobNumber = String(jobs.length + 1).padStart(4, '0');
    return `JOB-${dateStr}-${jobNumber}`;
  };

  // --- Form Handlers ---
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Job Item Handlers
  const handleJobItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'estimatedPrice' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  const addJobItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { jobType: '', description: '', estimatedPrice: 0 }]
    }));
  };
  const removeJobItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  // Machine Handlers
  const handleMachineChange = (index, field, value) => {
    const newMachines = [...formData.machines];
    newMachines[index][field] = field === 'estimatedPrice' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, machines: newMachines }));
  };
  const addMachine = () => {
    setFormData(prev => ({
      ...prev,
      machines: [...prev.machines, { machineType: '', description: '', estimatedPrice: 0 }]
    }));
  };
  const removeMachine = (index) => {
    const newMachines = formData.machines.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, machines: newMachines }));
  };

  // Consumable Handlers
  const handleConsumableChange = (index, field, value) => {
    const newConsumables = [...formData.consumables];
    newConsumables[index][field] = (field === 'quantity' || field === 'perPiecePrice') ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, consumables: newConsumables }));
  };
  const addConsumable = () => {
    setFormData(prev => ({
      ...prev,
      consumables: [...prev.consumables, { name: '', quantity: 1, perPiecePrice: 0 }]
    }));
  };
  const removeConsumable = (index) => {
    const newConsumables = formData.consumables.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, consumables: newConsumables }));
  };

  // Calculate total estimated price for the form
  const calculateFormTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const machinesTotal = formData.machines.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const consumablesTotal = formData.consumables.reduce((sum, item) => sum + ((item.quantity || 0) * (item.perPiecePrice || 0)), 0);
    return itemsTotal + machinesTotal + consumablesTotal;
  };

  // Calculate total for a displayed job
  const calculateJobTotal = (job) => {
    if (!job) return 0;
    const itemsTotal = job.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const machinesTotal = job.machines.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const consumablesTotal = job.consumables.reduce((sum, item) => sum + ((item.quantity || 0) * (item.perPiecePrice || 0)), 0);
    return itemsTotal + machinesTotal + consumablesTotal;
  };

  // Save new job
  const handleSaveJob = () => {
    if (!formData.customer_name || !formData.vehicle_number || !formData.contact_number) {
      alert('Please fill in required fields: Customer Name, Vehicle Number, and Contact Number');
      return;
    }
    const hasInvalidItems = formData.items.some(item => !item.description || !item.estimatedPrice);
    if (hasInvalidItems) {
      alert('Please fill in all job item descriptions and prices');
      return;
    }

    const newJob = {
      id: generateJobId(),
      customer_name: formData.customer_name,
      vehicle_number: formData.vehicle_number,
      engine_number: formData.engine_number,
      vehicle_model: formData.vehicle_model,
      contact_number: formData.contact_number,
      date: new Date().toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      status: 'Not Assigned',
      assignedEmployee: null,
      items: formData.items.map(item => ({ ...item, itemStatus: 'stopped' })),
      machines: formData.machines,
      consumables: formData.consumables
    };

    setJobs(prev => [newJob, ...prev]);
    
    // Reset form
    setFormData({
      customer_name: '', vehicle_number: '', engine_number: '', vehicle_model: '', contact_number: '',
      items: [{ jobType: '', description: '', estimatedPrice: 0 }],
      machines: [],
      consumables: []
    });
    
    setShowCreateJob(false);
    alert('Job card created successfully!');
  };

  return (
    <div className="estimator-dashboard">
      <Header userRole="Estimator" onLogin={onLoginClick} showLogin={true} />
      <div className="dashboard-content">
        <div className="dashboard-title-section">
          <div className="dashboard-wrapper">
            <div className="dashboard-title">
              <h2>Estimator Dashboard</h2>
              <p>Create job cards and track order history</p>
            </div>
            <div className="action-buttons">
              <button className="btn-action" onClick={() => {
                setShowOrderHistory(!showOrderHistory);
                setShowCreateJob(false);
                setShowJobDetails(false);
              }}>
                <img src={clipboardIcon} alt="History" className="btn-icon-left" /> View Order History
              </button>
              <button className="btn-action-primary" onClick={() => {
                setShowCreateJob(!showCreateJob);
                setShowOrderHistory(false);
                setShowJobDetails(false);
              }}>
                + Add Job Card
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="job-list-section">
            <div className="section-header">
              <h3><img src={clipboardIcon} alt="Jobs" className="inline-icon" /> Job Cards</h3>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search by job number, customer or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {filteredJobs.length === 0 ? (
              <div className="no-jobs-found">
                <p>No jobs found matching your search</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="job-card"
                  onClick={() => {
                    setSelectedJob(job);
                    setShowJobDetails(true);
                    setShowCreateJob(false);
                    setShowOrderHistory(false);
                  }}
                >
                  <div className="job-header">
                    <span className="job-number">{job.id}</span>
                    <span className={`status-badge ${
                      job.status === 'In Progress' ? 'status-progress' : 
                      job.status === 'Completed' ? 'status-completed' :
                      job.status === 'Assigned' ? 'status-assigned-active' :
                      'status-assigned'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="job-owner">{job.customer_name}</p>
                  <div className="job-details">
                    <span><img src={userIcon} alt="Vehicle" className="inline-icon" /> {job.vehicle_number}</span>
                    <span><img src={calendarIcon} alt="Date" className="inline-icon" /> {job.date}</span>
                  </div>
                  {job.assignedEmployee && (
                    <p className="job-employee"><img src={workerIcon} alt="Worker" className="inline-icon" /> {job.assignedEmployee.name}</p>
                  )}
                  <p className="job-items">{job.items.length} tasks</p>
                </div>
              ))
            )}
          </div>

          <div className="details-section">
            {!showJobDetails && !showCreateJob && !showOrderHistory && (
              <div className="no-selection">
                <div className="no-selection-icon">
                  <img src={clipboardIcon} alt="No selection" />
                </div>
                <p>No Selection</p>
                <p className="no-selection-hint">Click on a job card from the list to view its details here</p>
              </div>
            )}

            {showJobDetails && selectedJob && (
              <div className="job-details-view">
                <div className="form-header">
                  <h3><img src={clipboardIcon} alt="Details" className="inline-icon" /> Job Details</h3>
                  <button className="close-btn" onClick={() => {
                    setShowJobDetails(false);
                    setSelectedJob(null);
                  }}>✕</button>
                </div>
                <div className="job-detail-content">
                  {/* --- CUSTOMER INFO --- */}
                  <div className="job-info-grid">
                    <div><strong>Job Number:</strong> <span>{selectedJob.id}</span></div>
                    <div><strong>Customer:</strong> <span>{selectedJob.customer_name}</span></div>
                    <div><strong>Vehicle:</strong> <span>{selectedJob.vehicle_number}</span></div>
                    <div><strong>Model:</strong> <span>{selectedJob.vehicle_model || 'N/A'}</span></div>
                    <div><strong>Engine:</strong> <span>{selectedJob.engine_number || 'N/A'}</span></div>
                    <div><strong>Contact:</strong> <span>{selectedJob.contact_number}</span></div>
                    <div><strong>Date:</strong> <span>{selectedJob.date}</span></div>
                    <div>
                      <strong>Status:</strong>
                      <span className={`status-badge ${
                        selectedJob.status === 'In Progress' ? 'status-progress' : 
                        selectedJob.status === 'Completed' ? 'status-completed' :
                        selectedJob.status === 'Assigned' ? 'status-assigned-active' :
                        'status-assigned'
                      }`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    <div className="full-width">
                      <strong>Assign Employee:</strong>
                      <select 
                        className="employee-select"
                        value={selectedJob.assignedEmployee?.id || ''}
                        onChange={(e) => handleEmployeeSelect(selectedJob.id, e.target.value)}
                        disabled={selectedJob.status === 'Completed'}
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* --- JOB TASKS --- */}
                  <div className="job-items-container">
                    <strong className="job-items-title">Job Tasks:</strong>
                    {selectedJob.items.map((item, index) => (
                      <div key={index} className="job-detail-item">
                        <div className="item-header-row">
                          <div className="item-info">
                            <div className="item-title">
                              <strong>Job #{index + 1}</strong>
                              {item.jobType && <span className="item-type">({item.jobType})</span>}
                            </div>
                            <div className="item-description">{item.description}</div>
                            <div className="item-price">${item.estimatedPrice.toFixed(2)}</div>
                          </div>
                          {selectedJob.assignedEmployee && (
                            <div className="item-timer-section">
                              <div className="item-timer-controls">
                                {(item.itemStatus === 'stopped' || item.itemStatus === 'paused') && (
                                  <button title={item.itemStatus === 'paused' ? 'Resume' : 'Start'} className="btn-timer-small btn-start" onClick={() => handleStartItemTimer(selectedJob.id, index)}>
                                    <img src={playIcon} alt={item.itemStatus === 'paused' ? 'Resume' : 'Start'} className="btn-icon" />
                                  </button>
                                )}
                                {item.itemStatus === 'running' && (
                                  <button title="Pause" className="btn-timer-small btn-pause" onClick={() => handlePauseItemTimer(selectedJob.id, index)}>
                                    <img src={pauseIcon} alt="Pause" className="btn-icon" />
                                  </button>
                                )}
                                {item.itemStatus !== 'completed' && (
                                   <button title="End" className="btn-timer-small btn-end" onClick={() => handleEndItemTimer(selectedJob.id, index)}>
                                    <img src={tickIcon} alt="End" className="btn-icon" />
                                   </button>
                                )}
                                {item.itemStatus === 'completed' && (
                                  <div className="completed-badge-small">
                                    <img src={tickIcon} alt="Completed" className="btn-icon" />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* --- MACHINE DETAILS --- */}
                  {selectedJob.machines.length > 0 && (
                    <div className="job-items-container">
                      <strong className="job-items-title">Machines Used:</strong>
                      {selectedJob.machines.map((machine, index) => (
                        <div key={index} className="job-detail-item simple-item-row">
                          <div className="item-info">
                            <div className="item-title">
                              <strong>{machine.machineType}</strong>
                            </div>
                            <div className="item-description">{machine.description}</div>
                          </div>
                          <div className="item-price">${machine.estimatedPrice.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* --- CONSUMABLE DETAILS --- */}
                  {selectedJob.consumables.length > 0 && (
                    <div className="job-items-container">
                      <strong className="job-items-title">Consumables Used:</strong>
                      {selectedJob.consumables.map((item, index) => (
                        <div key={index} className="job-detail-item simple-item-row">
                          <div className="item-info">
                            <div className="item-title">
                              <strong>{item.name}</strong>
                            </div>
                            <div className="item-description">
                              {item.quantity} x ${item.perPiecePrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="item-price">
                            ${(item.quantity * item.perPiecePrice).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* --- TOTAL --- */}
                  <div className="job-detail-total">
                    <strong className="total-label">Total Estimated Amount:</strong>
                    <strong className="total-amount">
                      ${calculateJobTotal(selectedJob).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* --- CREATE JOB FORM --- */}
            {showCreateJob && (
              <div className="create-job-form">
                <div className="form-header">
                  <h3>📝 Create New Job Card</h3>
                  <button className="close-btn" onClick={() => setShowCreateJob(false)}>✕</button>
                </div>
                <p className="form-subtitle">Fill in the details to create a new job order</p>

                {/* --- Customer Fields --- */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input type="text" placeholder="Enter customer's full name" value={formData.customer_name} onChange={(e) => handleFormChange('customer_name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input type="tel" placeholder="555-123-4567" value={formData.contact_number} onChange={(e) => handleFormChange('contact_number', e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Vehicle Number *</label>
                    <input type="text" placeholder="ABC-123" value={formData.vehicle_number} onChange={(e) => handleFormChange('vehicle_number', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Model</label>
                    <input type="text" placeholder="e.g., Toyota Camry 2018" value={formData.vehicle_model} onChange={(e) => handleFormChange('vehicle_model', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Engine Number</label>
                  <input type="text" placeholder="Enter engine identification number" value={formData.engine_number} onChange={(e) => handleFormChange('engine_number', e.target.value)} />
                </div>

                {/* --- Job Items (Tasks) --- */}
                <div className="job-items-section">
                  <div className="section-title">
                    <h4>Job Tasks</h4>
                    <button className="btn-add-job" onClick={addJobItem}>+ Add Task</button>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="job-item-row job-item-row-tasks">
                      <div className="job-item-field">
                        <label>Task #{index + 1}</label>
                      </div>
                      <div className="job-item-field">
                        <label>Job Type</label>
                        <input type="text" placeholder="e.g., Oil Change" value={item.jobType} onChange={(e) => handleJobItemChange(index, 'jobType', e.target.value)} />
                      </div>
                      <div className="job-item-field">
                        <label>Description *</label>
                        <input type="text" placeholder="Describe this job" value={item.description} onChange={(e) => handleJobItemChange(index, 'description', e.target.value)} />
                      </div>
                      <div className="job-item-field">
                        <label>Est. Price ($)*</label>
                        <input type="number" placeholder="0" value={item.estimatedPrice || ''} onChange={(e) => handleJobItemChange(index, 'estimatedPrice', e.target.value)} />
                      </div>
                      <button className="btn-remove" onClick={() => removeJobItem(index)} disabled={formData.items.length === 1}>🗑</button>
                    </div>
                  ))}
                </div>

                {/* --- Machine Items --- */}
                <div className="job-items-section">
                  <div className="section-title">
                    <h4>Machine Usage (Optional)</h4>
                    <button className="btn-add-job" onClick={addMachine}>+ Add Machine</button>
                  </div>
                  {formData.machines.map((item, index) => (
                    <div key={index} className="job-item-row job-item-row-machines">
                      <div className="job-item-field">
                        <label>Machine #{index + 1}</label>
                      </div>
                      <div className="job-item-field">
                        <label>Machine Type</label>
                        <input type="text" placeholder="e.g., 2-Post Lift" value={item.machineType} onChange={(e) => handleMachineChange(index, 'machineType', e.target.value)} />
                      </div>
                      <div className="job-item-field">
                        <label>Description</label>
                        <input type="text" placeholder="Describe usage" value={item.description} onChange={(e) => handleMachineChange(index, 'description', e.target.value)} />
                      </div>
                      <div className="job-item-field">
                        <label>Est. Price ($)</label>
                        <input type="number" placeholder="0" value={item.estimatedPrice || ''} onChange={(e) => handleMachineChange(index, 'estimatedPrice', e.target.value)} />
                      </div>
                      <button className="btn-remove" onClick={() => removeMachine(index)}>🗑</button>
                    </div>
                  ))}
                </div>

                {/* --- Consumable Items --- */}
                <div className="job-items-section">
                  <div className="section-title">
                    <h4>Consumables (Optional)</h4>
                    <button className="btn-add-job" onClick={addConsumable}>+ Add Consumable</button>
                  </div>
                  {formData.consumables.map((item, index) => (
                    <div key={index} className="job-item-row job-item-row-consumables">
                      <div className="job-item-field">
                        <label>Item #{index + 1}</label>
                      </div>
                      <div className="job-item-field">
                        <label>Name of Consumable</label>
                        <input type="text" placeholder="e.g., Engine Oil" value={item.name} onChange={(e) => handleConsumableChange(index, 'name', e.target.value)} />
                      </div>
                      <div className="job-item-field">
                        <label>Quantity</label>
                        <input type="number" placeholder="1" value={item.quantity || ''} onChange={(e) => handleConsumableChange(index, 'quantity', e.target.value)} />
                      </div>
                      <div className="job-item-field">
                        <label>Price Per Piece ($)</label>
                        <input type="number" placeholder="0" value={item.perPiecePrice || ''} onChange={(e) => handleConsumableChange(index, 'perPiecePrice', e.target.value)} />
                      </div>
                      <button className="btn-remove" onClick={() => removeConsumable(index)}>🗑</button>
                    </div>
                  ))}
                </div>


                {/* --- Form Footer --- */}
                <div className="form-footer">
                  <div className="total-amount">
                    <span>Total Estimated Amount:</span>
                    <span className="amount">${calculateFormTotal().toFixed(2)}</span>
                  </div>
                  <button className="btn-save-job" onClick={handleSaveJob}>Save Job Card</button>
                </div>
              </div>
            )}

            {showOrderHistory && (
              <div className="order-history-view">
                <div className="form-header">
                  <h3><img src={clipboardIcon} alt="History" className="inline-icon" /> Order History</h3>
                  <button className="close-btn" onClick={() => setShowOrderHistory(false)}>✕</button>
                </div>
                <div className="order-history-content">
                  <p>Order history feature coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EstimatorDashboard;