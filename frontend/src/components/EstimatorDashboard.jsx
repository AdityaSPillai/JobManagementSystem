import { useState, useEffect } from 'react';
import Header from './Header';
import '../styles/EstimatorDashboard.css';

// Helper to calculate the total elapsed time for a single job item
const calculateItemElapsedTime = (item) => {
  // 1. Sum up all completed time entries
  const completedTime = item.timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  
  // 2. Add the time for the currently running segment, if any
  let runningTime = 0;
  if (item.timerState === 'running' && item.currentTimer.startTime) {
    runningTime = Math.floor((Date.now() - item.currentTimer.startTime) / 1000);
  }
  
  return completedTime + runningTime;
};

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

  // Jobs array with NEW timer states for each item to support multi-employee tracking
  const [jobs, setJobs] = useState([
    {
      id: 'JOB-20251004-0001',
      owner: 'Devanath DR',
      vehicle: 'ABC-123',
      engineNumber: '',
      date: 'Oct 5, 2025, 08:30 AM',
      status: 'In Progress',
      jobCount: 2,
      assignedEmployee: { id: 'EMP001', name: 'John Doe' }, // Initial assigned employee for example
      items: [
        { 
          jobType: 'Oil Change', 
          description: 'Change engine oil', 
          estimatedPrice: 50,
          timeEntries: [
            { employeeId: 'EMP001', employeeName: 'John Doe', duration: 300, startTime: 0, endTime: 0 }, // Example completed entry (5 mins)
          ], 
          currentTimer: { // Tracks who is currently running the timer
            employeeId: 'EMP001',
            employeeName: 'John Doe',
            startTime: Date.now() - 60000, // Example of a running timer (1 minute elapsed)
          },
          timerState: 'running', // Overall item state
          totalElapsedTime: 360, // 300 (completed) + 60 (running)
        },
        { 
          jobType: 'Brake Check', 
          description: 'Inspect brake pads', 
          estimatedPrice: 75,
          timeEntries: [], 
          currentTimer: { employeeId: null, employeeName: null, startTime: null },
          timerState: 'stopped',
          totalElapsedTime: 0
        }
      ]
    },
    {
      id: 'JOB-20251004-0002',
      owner: 'Aljo KJ',
      vehicle: 'XYZ-789',
      engineNumber: '',
      date: 'Oct 5, 2025, 08:30 AM',
      status: 'Not Assigned',
      jobCount: 2,
      assignedEmployee: null,
      items: [
        { 
          jobType: 'Tire Rotation', 
          description: 'Rotate all 4 tires', 
          estimatedPrice: 40,
          timeEntries: [], 
          currentTimer: { employeeId: null, employeeName: null, startTime: null },
          timerState: 'stopped',
          totalElapsedTime: 0
        },
        { 
          jobType: 'AC Service', 
          description: 'AC gas refill', 
          estimatedPrice: 100,
          timeEntries: [], 
          currentTimer: { employeeId: null, employeeName: null, startTime: null },
          timerState: 'stopped',
          totalElapsedTime: 0
        }
      ]
    },
    {
      id: 'JOB-20251004-0003',
      owner: 'Adith KP',
      vehicle: 'CBA-321',
      engineNumber: '',
      date: 'Oct 17, 2025, 08:30 AM',
      status: 'Not Assigned',
      jobCount: 2,
      assignedEmployee: null,
      items: [
        { 
          jobType: 'Tire Rotation', 
          description: 'Rotate all 4 tires', 
          estimatedPrice: 40,
          timeEntries: [], 
          currentTimer: { employeeId: null, employeeName: null, startTime: null },
          timerState: 'stopped',
          totalElapsedTime: 0
        },
        { 
          jobType: 'AC Service', 
          description: 'AC gas refill', 
          estimatedPrice: 100,
          timeEntries: [], 
          currentTimer: { employeeId: null, employeeName: null, startTime: null },
          timerState: 'stopped',
          totalElapsedTime: 0
        }
      ]
    }
  ]);

  // Form state for creating new job
  const [formData, setFormData] = useState({
    owner: '',
    vehicle: '',
    engineNumber: '',
    items: [{ jobType: '', description: '', estimatedPrice: 0 }]
  });

  // Timer effect - updates totalElapsedTime for running timers
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs(prevJobs => prevJobs.map(job => ({
        ...job,
        items: job.items.map(item => {
          if (item.timerState === 'running' && item.currentTimer.startTime) {
            const newTotalTime = calculateItemElapsedTime(item);
            return { ...item, totalElapsedTime: newTotalTime };
          }
          return item;
        })
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update selected job when jobs change
  useEffect(() => {
    if (selectedJob) {
      const updatedJob = jobs.find(job => job.id === selectedJob.id);
      if (updatedJob) {
        setSelectedJob(updatedJob);
      }
    }
  }, [jobs]);

  // Format elapsed time
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle employee selection
  const handleEmployeeSelect = (jobId, employeeId) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const employee = employees.find(e => e.id === employeeId);
        
        // Prevent changing employee while a timer is running
        const hasRunningTimer = job.items.some(item => item.timerState === 'running');
        if (hasRunningTimer) {
             alert('Cannot change assigned employee while a job timer is running.');
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

  // Handle item timer start
  const handleStartItemTimer = (jobId, itemIndex) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        // Ensure an employee is assigned to the job before starting
        if (!job.assignedEmployee) {
          alert('Please assign an employee to the job card before starting any task timer.');
          return job;
        }

        const newItems = [...job.items];
        const currentItem = newItems[itemIndex];
        
        // Prevent starting if another employee's timer is already running
        if (currentItem.timerState === 'running' && currentItem.currentTimer.employeeId !== job.assignedEmployee.id) {
           alert(`Timer is currently running by ${currentItem.currentTimer.employeeName}. You must pause or end their timer before starting your own.`);
           return job;
        }

        // Start a new timer segment
        newItems[itemIndex] = {
          ...currentItem,
          timerState: 'running',
          currentTimer: {
            employeeId: job.assignedEmployee.id,
            employeeName: job.assignedEmployee.name,
            startTime: Date.now()
          },
          // totalElapsedTime will be updated by the useEffect interval
        };
        
        // Update job status
        const hasRunningTimer = newItems.some(item => item.timerState === 'running');
        const allCompleted = newItems.every(item => item.timerState === 'completed');
        
        return {
          ...job,
          items: newItems,
          status: allCompleted ? 'Completed' : hasRunningTimer ? 'In Progress' : job.status
        };
      }
      return job;
    }));
  };

  // Handle item timer pause
  const handlePauseItemTimer = (jobId, itemIndex) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const currentItem = job.items[itemIndex];
        
        // Only pause if the timer is running
        if (currentItem.timerState !== 'running' || !currentItem.currentTimer.startTime) {
          return job;
        }

        // Finalize the running segment
        const duration = Math.floor((Date.now() - currentItem.currentTimer.startTime) / 1000);
        
        const newTimeEntry = {
          employeeId: currentItem.currentTimer.employeeId,
          employeeName: currentItem.currentTimer.employeeName,
          startTime: currentItem.currentTimer.startTime,
          endTime: Date.now(),
          duration: duration
        };

        const newItems = [...job.items];
        newItems[itemIndex] = {
          ...currentItem,
          timerState: 'paused',
          timeEntries: [...currentItem.timeEntries, newTimeEntry], // Save time segment
          currentTimer: { employeeId: null, employeeName: null, startTime: null }, // Reset current timer
          totalElapsedTime: currentItem.totalElapsedTime + duration // Update total
        };
        
        // Update job status
        const hasRunningTimer = newItems.some(item => item.timerState === 'running');
        
        return {
          ...job,
          items: newItems,
          status: hasRunningTimer ? 'In Progress' : 'Assigned' // Status goes back to Assigned if no other timers are running
        };
      }
      return job;
    }));
  };

  // Handle item timer end
  const handleEndItemTimer = (jobId, itemIndex) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        const currentItem = job.items[itemIndex];
        
        let duration = 0;
        let newEntries = [...currentItem.timeEntries];
        let newTotalElapsedTime = currentItem.totalElapsedTime;

        // If running, finalize the current segment and save it
        if (currentItem.timerState === 'running' && currentItem.currentTimer.startTime) {
          duration = Math.floor((Date.now() - currentItem.currentTimer.startTime) / 1000);
          
          const newTimeEntry = {
            employeeId: currentItem.currentTimer.employeeId,
            employeeName: currentItem.currentTimer.employeeName,
            startTime: currentItem.currentTimer.startTime,
            endTime: Date.now(),
            duration: duration
          };
          newEntries = [...newEntries, newTimeEntry];
          newTotalElapsedTime += duration;
        }
        // If paused, the last segment was already saved on pause.

        const newItems = [...job.items];
        newItems[itemIndex] = {
          ...currentItem,
          timerState: 'completed',
          timeEntries: newEntries,
          currentTimer: { employeeId: null, employeeName: null, startTime: null },
          totalElapsedTime: newTotalElapsedTime
        };
        
        // Check if all items are completed
        const allCompleted = newItems.every(item => item.timerState === 'completed');
        const hasRunningTimer = newItems.some(item => item.timerState === 'running');
        
        return {
          ...job,
          items: newItems,
          status: allCompleted ? 'Completed' : hasRunningTimer ? 'In Progress' : 'Assigned'
        };
      }
      return job;
    }));
  };

  // Calculate total time for a job
  const calculateTotalTime = (items) => {
    return items.reduce((total, item) => total + item.totalElapsedTime, 0);
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate new job ID
  const generateJobId = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const jobNumber = String(jobs.length + 1).padStart(4, '0');
    return `JOB-${dateStr}-${jobNumber}`;
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle job item changes
  const handleJobItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'estimatedPrice' ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // Add new job item
  const addJobItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { jobType: '', description: '', estimatedPrice: 0 }]
    }));
  };

  // Remove job item
  const removeJobItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  // Calculate total estimated price
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
  };

  // Save new job
  const handleSaveJob = () => {
    if (!formData.owner || !formData.vehicle) {
      alert('Please fill in required fields: Vehicle Owner Name and Vehicle Number');
      return;
    }

    const hasInvalidItems = formData.items.some(item => !item.description || !item.estimatedPrice);
    if (hasInvalidItems) {
      alert('Please fill in all job item descriptions and prices');
      return;
    }

    const newJob = {
      id: generateJobId(),
      owner: formData.owner,
      vehicle: formData.vehicle,
      engineNumber: formData.engineNumber,
      date: new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'Not Assigned',
      jobCount: formData.items.length,
      assignedEmployee: null,
      items: formData.items.map(item => ({
        ...item,
        timeEntries: [], 
        currentTimer: { employeeId: null, employeeName: null, startTime: null },
        timerState: 'stopped',
        totalElapsedTime: 0
      }))
    };

    setJobs(prev => [newJob, ...prev]);
    
    // Reset form
    setFormData({
      owner: '',
      vehicle: '',
      engineNumber: '',
      items: [{ jobType: '', description: '', estimatedPrice: 0 }]
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
                📋 View Order History
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
              <h3>📋 Job Cards</h3>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search by job number, owner or vehicle number..."
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
                  <p className="job-owner">{job.owner}</p>
                  <div className="job-details">
                    <span>🚗 {job.vehicle}</span>
                    <span>📅 {job.date}</span>
                  </div>
                  {job.assignedEmployee && (
                    <p className="job-employee">👤 {job.assignedEmployee.name}</p>
                  )}
                  {calculateTotalTime(job.items) > 0 && (
                    <p className="job-timer">⏱️ {formatTime(calculateTotalTime(job.items))}</p>
                  )}
                  <p className="job-items">{job.jobCount} jobs</p>
                </div>
              ))
            )}
          </div>

          <div className="details-section">
            {!showJobDetails && !showCreateJob && !showOrderHistory && (
              <div className="no-selection">
                <div className="no-selection-icon">📋</div>
                <p>No Selection</p>
                <p className="no-selection-hint">Click on a job card from the list to view its details here</p>
              </div>
            )}

            {showJobDetails && selectedJob && (
              <div className="job-details-view">
                <div className="form-header">
                  <h3>📋 Job Details</h3>
                  <button className="close-btn" onClick={() => {
                    setShowJobDetails(false);
                    setSelectedJob(null);
                  }}>✕</button>
                </div>
                <div className="job-detail-content">
                  <div className="job-info-grid">
                    <div>
                      <strong>Job Number:</strong>
                      <span>{selectedJob.id}</span>
                    </div>
                    <div>
                      <strong>Owner:</strong>
                      <span>{selectedJob.owner}</span>
                    </div>
                    <div>
                      <strong>Vehicle:</strong>
                      <span>{selectedJob.vehicle}</span>
                    </div>
                    <div>
                      <strong>Date:</strong>
                      <span>{selectedJob.date}</span>
                    </div>
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
                    <div>
                      <strong>Assign Employee:</strong>
                      <select 
                        className="employee-select"
                        value={selectedJob.assignedEmployee?.id || ''}
                        onChange={(e) => handleEmployeeSelect(selectedJob.id, e.target.value)}
                        disabled={selectedJob.status === 'Completed'}
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.id})
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedJob.engineNumber && (
                      <div className="full-width">
                        <strong>Engine Number:</strong>
                        <span>{selectedJob.engineNumber}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="job-items-container">
                    <strong className="job-items-title">Job Items:</strong>
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
                              <div className="item-timer-display">
                                <span className="timer-label">⏱️</span>
                                <span className="timer-time">{formatTime(item.totalElapsedTime)}</span>
                              </div>
                              <div className="item-timer-controls">
                                {(item.timerState === 'stopped' || item.timerState === 'paused') && (
                                  <button 
                                    className="btn-timer-small btn-start"
                                    onClick={() => handleStartItemTimer(selectedJob.id, index)}
                                  >
                                    ▶️ 
                                    {item.timerState === 'paused' ? ' Resume' : ' Start'}
                                  </button>
                                )}
                                {item.timerState === 'running' && (
                                  <>
                                    <button 
                                      className="btn-timer-small btn-pause"
                                      onClick={() => handlePauseItemTimer(selectedJob.id, index)}
                                    >
                                      ⏸️ Pause
                                    </button>
                                    <button 
                                      className="btn-timer-small btn-end"
                                      onClick={() => handleEndItemTimer(selectedJob.id, index)}
                                    >
                                      ⏹️ End
                                    </button>
                                  </>
                                )}
                                {item.timerState === 'paused' && (
                                   <button 
                                    className="btn-timer-small btn-end"
                                    onClick={() => handleEndItemTimer(selectedJob.id, index)}
                                  >
                                    ⏹️ End
                                  </button>
                                )}
                                {item.timerState === 'completed' && (
                                  <div className="completed-badge-small">
                                    ✅ Completed
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* --- NEW SECTION: Display Time Entries by Employee --- */}
                        {item.timeEntries.length > 0 && (
                           <div className="time-entries-summary">
                              <strong className="time-history-title">Time History:</strong>
                              {item.timeEntries.map((entry, entryIndex) => (
                                <div key={entryIndex} className="time-entry-row">
                                  <span className="time-entry-employee">👤 {entry.employeeName}</span>
                                  <span className="time-entry-duration">⏱️ {formatTime(entry.duration)}</span>
                                </div>
                              ))}
                           </div>
                        )}
                        {/* Currently Running Timer Employee */}
                        {item.timerState === 'running' && item.currentTimer.employeeName && (
                          <div className="current-timer-employee">
                            Current Timer by: 👤 **{item.currentTimer.employeeName}**
                          </div>
                        )}
                        {/* --- END NEW SECTION --- */}
                        
                      </div>
                    ))}
                    <div className="job-detail-total">
                      <strong className="total-label">Total Estimated Amount:</strong>
                      <strong className="total-amount">
                        ${selectedJob.items.reduce((sum, item) => sum + item.estimatedPrice, 0).toFixed(2)}
                      </strong>
                    </div>
                    {selectedJob.assignedEmployee && calculateTotalTime(selectedJob.items) > 0 && (
                      <div className="job-total-time">
                        <strong className="total-label">Total Time Spent:</strong>
                        <strong className="total-time">
                          ⏱️ {formatTime(calculateTotalTime(selectedJob.items))}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showCreateJob && (
              <div className="create-job-form">
                <div className="form-header">
                  <h3>📝 Create New Job Card</h3>
                  <button className="close-btn" onClick={() => setShowCreateJob(false)}>✕</button>
                </div>
                <p className="form-subtitle">Fill in the details to create a new job order</p>

                <div className="form-row">
                  <div className="form-group">
                    <label>Vehicle Owner Name *</label>
                    <input 
                      type="text" 
                      placeholder="Enter owner's full name"
                      value={formData.owner}
                      onChange={(e) => handleFormChange('owner', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Number *</label>
                    <input 
                      type="text" 
                      placeholder="ABC-123"
                      value={formData.vehicle}
                      onChange={(e) => handleFormChange('vehicle', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Engine Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter engine identification number"
                    value={formData.engineNumber}
                    onChange={(e) => handleFormChange('engineNumber', e.target.value)}
                  />
                </div>

                <div className="job-items-section">
                  <div className="section-title">
                    <h4>Job Items</h4>
                    <button className="btn-add-job" onClick={addJobItem}>+ Add More Job</button>
                  </div>

                  {formData.items.map((item, index) => (
                    <div key={index} className="job-item-row">
                      <div className="job-item-field">
                        <label>Job #{index + 1}</label>
                      </div>
                      <div className="job-item-field">
                        <label>Job Type</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Oil Change"
                          value={item.jobType}
                          onChange={(e) => handleJobItemChange(index, 'jobType', e.target.value)}
                        />
                      </div>
                      <div className="job-item-field">
                        <label>Description *</label>
                        <input 
                          type="text" 
                          placeholder="Describe this job"
                          value={item.description}
                          onChange={(e) => handleJobItemChange(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="job-item-field">
                        <label>Estimated Price ($)*</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={item.estimatedPrice || ''}
                          onChange={(e) => handleJobItemChange(index, 'estimatedPrice', e.target.value)}
                        />
                      </div>
                      <button 
                        className="btn-remove" 
                        onClick={() => removeJobItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-footer">
                  <div className="total-amount">
                    <span>Total Estimated Amount:</span>
                    <span className="amount">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <button 
                    className="btn-save-job" 
                    onClick={handleSaveJob}
                  >
                    Save Job Card
                  </button>
                </div>
              </div>
            )}

            {showOrderHistory && (
              <div className="order-history-view">
                <div className="form-header">
                  <h3>📋 Order History</h3>
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