import { useState, useEffect } from 'react';
import Header from './Header';
import '../styles/QADashboard.css'; // Use QA specific CSS
import '../styles/SupervisorDashboard.css'; // Borrow some common styles like layout

// Import all necessary icons
import clipboardIcon from '../assets/clipboard.svg';
import workerIcon from '../assets/worker.svg';
import userIcon from '../assets/user.svg';
import calendarIcon from '../assets/calendar.svg';
import refreshIcon from '../assets/refresh.svg';
import infoIcon from '../assets/info.svg';
import tickIcon from '../assets/tick.svg';

// --- Main QA Dashboard Component ---
function QADashboard({ onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [qaReviewerName, setQaReviewerName] = useState(''); // State for reviewer name

  // Jobs array - Added 'qualityStatus' to items and 'qaStatus'/'qaCheckedBy' to job
  // QA typically only acts on 'Completed' jobs
  const [jobs, setJobs] = useState([
    {
      id: 'JOB-20251004-0001', customer_name: 'Devanath DR', vehicle_number: 'ABC-123', engine_number: 'EN12345', vehicle_model: 'Toyota Camry 2018', contact_number: '555-1234', date: 'Oct 5, 2025, 08:30 AM', status: 'Completed', // Status QA acts on
      assignedEmployee: { id: 'EMP001', name: 'John Doe' },
      items: [
        { jobType: 'Oil Change', description: 'Change engine oil', estimatedPrice: 50, itemStatus: 'completed', qualityStatus: null }, // null, 'Good', 'Needs Work'
        { jobType: 'Brake Check', description: 'Inspect brake pads', estimatedPrice: 75, itemStatus: 'completed', qualityStatus: null }
      ],
      machines: [{ machineType: '2-Post Lift', description: 'Vehicle Lift', estimatedPrice: 20 }],
      consumables: [{ name: 'Engine Oil', quantity: 5, perPiecePrice: 8 }, { name: 'Oil Filter', quantity: 1, perPiecePrice: 15 }],
      qaStatus: 'Pending', // Pending, Checked
      qaCheckedBy: null
    },
    {
      id: 'JOB-20251004-0002', customer_name: 'Aljo KJ', vehicle_number: 'XYZ-789', engine_number: 'EN67890', vehicle_model: 'Honda Civic 2020', contact_number: '555-5678', date: 'Oct 5, 2025, 08:30 AM', status: 'In Progress', // QA cannot act yet
      assignedEmployee: { id: 'EMP002', name: 'Jane Smith' },
      items: [{ jobType: 'Tire Rotation', description: 'Rotate all 4 tires', estimatedPrice: 40, itemStatus: 'running', qualityStatus: null }],
      machines: [], consumables: [], qaStatus: 'Pending', qaCheckedBy: null
    },
     {
      id: 'JOB-20251004-0003', customer_name: 'Third Customer', vehicle_number: 'TEST-001', engine_number: 'EN0000', vehicle_model: 'Test Car', contact_number: '555-9999', date: 'Oct 28, 2025, 10:00 AM', status: 'Quality Checked', // Already checked
      assignedEmployee: { id: 'EMP001', name: 'John Doe' },
      items: [{ jobType: 'Inspection', description: 'Final check', estimatedPrice: 30, itemStatus: 'completed', qualityStatus: 'Good' }],
      machines: [], consumables: [], qaStatus: 'Checked', qaCheckedBy: 'QA Inspector A'
    }
  ]);

  // Select first completed job initially if available
  useEffect(() => {
    if (!selectedJob) {
        const firstCompletedJob = jobs.find(job => job.status === 'Completed' || job.status === 'Quality Checked');
        if (firstCompletedJob) {
            setSelectedJob(firstCompletedJob);
        } else if (jobs.length > 0) {
            setSelectedJob(jobs[0]); // Fallback to selecting the first job if none are completed
        }
    }
  }, [jobs]); // Re-run if jobs list changes


  // Filter jobs - QA might want to see Completed or QA Checked by default
  const filteredJobs = jobs.filter(job =>
    (job.status === 'Completed' || job.status === 'Quality Checked') && // Primary filter for QA
    (
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Calculate total for a displayed job
  const calculateJobTotal = (job) => {
    if (!job) return 0;
    const itemsTotal = job.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const machinesTotal = job.machines.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
    const consumablesTotal = job.consumables.reduce((sum, item) => sum + ((item.quantity || 0) * (item.perPiecePrice || 0)), 0);
    return itemsTotal + machinesTotal + consumablesTotal;
   };

   // --- QA Action Handlers ---
   const handleItemQualityChange = (jobId, itemIndex, quality) => {
       if (!selectedJob || selectedJob.status !== 'Completed') return; // Only allow on completed jobs

       setJobs(prevJobs => prevJobs.map(job => {
           if (job.id === jobId) {
               const newItems = [...job.items];
               // Ensure the item itself is completed before setting quality
               if (newItems[itemIndex].itemStatus === 'completed') {
                  newItems[itemIndex].qualityStatus = quality;
               } else {
                   alert("This task must be marked 'completed' by the worker first.");
               }
               return { ...job, items: newItems };
           }
           return job;
       }));
       // Also update the selected job state directly for immediate UI feedback
       setSelectedJob(prev => {
           if (prev && prev.id === jobId) {
                const newItems = [...prev.items];
                 if (newItems[itemIndex].itemStatus === 'completed') {
                    newItems[itemIndex].qualityStatus = quality;
                 }
                 return {...prev, items: newItems};
           }
           return prev;
       })
   };

   const handleMarkQualityChecked = (jobId) => {
        if (!selectedJob || selectedJob.status !== 'Completed') return;
        if (!qaReviewerName.trim()) {
            alert('Please enter your name in the "Reviewed by" field.');
            return;
        }
        // Optional: Check if all items have a quality status assigned
        const allItemsRated = selectedJob.items.every(item => item.qualityStatus !== null);
        if (!allItemsRated) {
            if (!window.confirm("Not all tasks have been assigned a quality status. Mark as Quality Checked anyway?")) {
                return;
            }
        }

       setJobs(prevJobs => prevJobs.map(job => {
           if (job.id === jobId) {
               return { ...job, status: 'Quality Checked', qaStatus: 'Checked', qaCheckedBy: qaReviewerName };
           }
           return job;
       }));
        // Update selected job state
       setSelectedJob(prev => {
           if (prev && prev.id === jobId) {
               return {...prev, status: 'Quality Checked', qaStatus: 'Checked', qaCheckedBy: qaReviewerName};
           }
           return prev;
       });
       alert(`Job ${jobId} marked as Quality Checked by ${qaReviewerName}.`);
   };


  // Calculate stats for banner
  const pendingReviewCount = jobs.filter(j => j.status === 'Completed').length;
  const qualityCheckedCount = jobs.filter(j => j.status === 'Quality Checked').length;
  const needsWorkCount = jobs.reduce((count, job) => {
      if (job.status === 'Quality Checked') {
          count += job.items.filter(item => item.qualityStatus === 'Needs Work').length;
      }
      return count;
  }, 0);
  const totalItemsReviewed = jobs.reduce((count, job) => {
     if (job.status === 'Quality Checked') {
          count += job.items.filter(item => item.qualityStatus !== null).length;
      }
      return count;
  }, 0);


  return (
    <div className="qa-dashboard">
      <Header userRole="QA/QC" onLogout={onLogout} showLogin={false} />
      
      {/* QA Banner */}
      <div className="dashboard-banner qa-banner">
         <div className="banner-content">
           <h2>QA/QC Dashboard</h2>
           <p>Review completed jobs and ensure quality standards</p>
         </div>
         <div className="stats-cards">
           <div className="stat-card">
             <span className="stat-label">Pending Reviews</span>
             <span className="stat-value">{pendingReviewCount}</span>
             <span className="stat-icon"><img src={refreshIcon} alt="Pending"/></span>
           </div>
           <div className="stat-card">
             <span className="stat-label">Total Jobs Reviewed</span>
             <span className="stat-value">{qualityCheckedCount}</span>
             <span className="stat-icon"><img src={clipboardIcon} alt="Reviewed"/></span>
           </div>
           {/* <div className="stat-card">
             <span className="stat-label">Items Approved</span>
             <span className="stat-value">{totalItemsReviewed - needsWorkCount}</span>
             <span className="stat-icon"><img src={tickIcon} alt="Approved"/></span>
           </div> */}
           <div className="stat-card">
             <span className="stat-label">Items Marked "Needs Work"</span>
             <span className="stat-value">{needsWorkCount}</span>
             <span className="stat-icon"><img src={infoIcon} alt="Needs Work"/></span>
           </div>
         </div>
      </div>

      <div className="dashboard-content">
        {/* Title Section Removed - No Actions Here */}

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Job List */}
          <div className="job-list-section">
            <div className="section-header"><h3><img src={clipboardIcon} alt="Jobs" className="inline-icon" /> Jobs for QA Review</h3></div>
            <input type="text" className="search-input" placeholder="Search jobs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {filteredJobs.length === 0 ? (<div className="no-jobs-found"><p>No jobs awaiting QA or matching search.</p></div>) : (
              filteredJobs.map((job) => (
                <div key={job.id} className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`} onClick={() => setSelectedJob(job)}>
                  <div className="job-header">
                    <span className="job-number">{job.id}</span>
                    <span className={`status-badge ${ job.status === 'Completed' ? 'status-review' /* Specific QA status */ : job.status === 'Quality Checked' ? 'status-completed' : 'status-assigned' }`}>
                      {job.status === 'Completed' ? 'Ready for QA' : job.status}
                    </span>
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
            {!selectedJob && (<div className="no-selection"><div className="no-selection-icon"><img src={clipboardIcon} alt="No selection" /></div><p>No Job Selected</p><p className="no-selection-hint">Click a job card to view details and perform QA.</p></div>)}

            {selectedJob && (
              <div className="job-details-view"> {/* Reusing class from Supervisor for layout */}
                <div className="form-header"> {/* Reusing class */}
                  <div className="header-left">
                    <h3><img src={clipboardIcon} alt="Details" className="inline-icon" /> Job Details for QA</h3>
                    <p>Job ID: {selectedJob.id}</p>
                  </div>
                  {/* Close button only */}
                  <button className="close-btn" onClick={() => setSelectedJob(null)}>✕</button>
                </div>
                <div className="job-detail-content"> {/* Reusing class */}
                   {/* Customer Info */}
                   <div className="job-info-grid">
                      <div><strong>Customer:</strong> <span>{selectedJob.customer_name}</span></div><div><strong>Contact:</strong> <span>{selectedJob.contact_number}</span></div><div><strong>Vehicle:</strong> <span>{selectedJob.vehicle_number}</span></div><div><strong>Model:</strong> <span>{selectedJob.vehicle_model || 'N/A'}</span></div><div><strong>Engine:</strong> <span>{selectedJob.engine_number || 'N/A'}</span></div><div><strong>Date:</strong> <span>{selectedJob.date}</span></div>
                      <div><strong>Status:</strong><span className={`status-badge ${ selectedJob.status === 'Completed' ? 'status-review' : selectedJob.status === 'Quality Checked' ? 'status-completed' : 'status-assigned' }`}>{selectedJob.status === 'Completed' ? 'Ready for QA' : selectedJob.status}</span></div>
                      <div className="full-width"><strong>Assigned Employee:</strong> <span>{selectedJob.assignedEmployee?.name || 'N/A'}</span></div>
                      {selectedJob.qaCheckedBy && (<div className="full-width"><strong>QA Checked By:</strong> <span>{selectedJob.qaCheckedBy}</span></div>)}
                   </div>
                   
                   {/* Job Tasks with QA Actions */}
                   <div className="job-items-container">
                     <strong className="job-items-title">Job Tasks to Review:</strong>
                     {selectedJob.items.map((item, index) => (
                       <div key={index} className="job-item-card qa-item-card"> {/* Specific QA card */}
                         <div className="item-header-row"> {/* Reusing class */}
                           <div className="item-info">
                             <div className="item-title"><strong>Task #{index + 1}</strong>{item.jobType && <span className="item-type">({item.jobType})</span>}</div>
                             <div className="item-description">{item.description}</div>
                             {/* <div className="item-price">${item.estimatedPrice.toFixed(2)}</div> */}
                           </div>
                           <div className="item-status-display">
                             <span className="status-badge status-completed">{item.itemStatus}</span> {/* Should always be completed here */}
                           </div>
                         </div>
                         
                         {/* --- QA Section for this item --- */}
                         <div className="qa-actions-section">
                           <div className="quality-assessment">
                             <span>Quality Assessment:</span>
                             <div className="quality-buttons">
                               <button
                                 className={`btn-good ${item.qualityStatus === 'Good' ? 'active' : ''}`}
                                 onClick={() => handleItemQualityChange(selectedJob.id, index, 'Good')}
                                 disabled={selectedJob.status !== 'Completed'} // Disable if job already QA'd
                               >
                                 <img src={tickIcon} alt="Good" className="btn-icon small qa-icon" /> Good
                               </button>
                               <button
                                 className={`btn-needs-work ${item.qualityStatus === 'Needs Work' ? 'active' : ''}`}
                                 onClick={() => handleItemQualityChange(selectedJob.id, index, 'Needs Work')}
                                 disabled={selectedJob.status !== 'Completed'} // Disable if job already QA'd
                               >
                                 <img src={infoIcon} alt="Needs Work" className="btn-icon small qa-icon" /> Needs Work
                               </button>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* --- Final QA Confirmation Section --- */}
                   {selectedJob.status === 'Completed' && (
                     <div className="qa-final-section job-items-container">
                       <div className="reviewed-by">
                         <span>Reviewed by:</span>
                         <input
                            type="text"
                            className="reviewer-input"
                            placeholder="Enter your name"
                            value={qaReviewerName}
                            onChange={(e) => setQaReviewerName(e.target.value)}
                          />
                       </div>
                       <button className="btn-mark-checked" onClick={() => handleMarkQualityChecked(selectedJob.id)}>
                         <img src={tickIcon} alt="Check" className="btn-icon-left small" /> Mark Job as Quality Checked
                       </button>
                     </div>
                   )}
                   {selectedJob.status === 'Quality Checked' && (
                     <div className="qa-final-section job-items-container reviewed-indicator">
                        <span><img src={tickIcon} alt="Checked" className="inline-icon"/> This job has been Quality Checked by {selectedJob.qaCheckedBy || 'QA'}.</span>
                     </div>
                   )}

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QADashboard;