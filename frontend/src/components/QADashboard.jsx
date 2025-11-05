  import { useState, useEffect } from 'react';
  import Header from './Header';
  import '../styles/QADashboard.css'; // Use QA specific CSS
  import '../styles/SupervisorDashboard.css'; // Borrow some common styles like layout
  import axios  from '../utils/axios.js';
  import useAuth from '../context/context.js';

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
    const [qaReviewerName, setQaReviewerName] = useState(''); 
    const {userInfo}=useAuth();
    const [jobs, setJobs] = useState([]);
    const [showNotesPopup, setShowNotesPopup] = useState(false);
    const [notes, setNotes] = useState('');

    const getAllJobs = async () => {
    try {
      const res = await axios.get(`/shop/getAllJobs/${userInfo?.shopId}`);
      if (res.data?.allJobs?.length > 0) {
        const transformedJobs = res.data.allJobs.map(job => ({
          id: job._id,
          jobCardNumber: job.jobCardNumber,
          customer_name: job.formData?.customer_name || '',
          vehicle_number: job.formData?.vehicle_number || '',
          engine_number: job.formData?.engine_number || '',
          vehicle_model: job.formData?.vehicle_model || '',
          contact_number: job.formData?.contact_number || '',
          date: new Date(job.createdAt || Date.now()).toLocaleString('en-US', {
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
          }),
          status: (job.status || 'Not Assigned').toLowerCase(),
          totalEstimatedAmount: job.totalEstimatedAmount || 0,
          // Transform job items with all their related data
          items: job.jobItems?.map(item => ({
            itemId: item._id,
            jobType: item.itemData?.job_type || '',
            description: item.itemData?.description || '',
            priority: item.itemData?.priority || '',
            estimatedPrice: item.estimatedPrice || 0,
            itemStatus: (item.itemStatus || 'pending').toLowerCase(),
            // Machine details
            machine: {
              machineRequired: item.machine?.machineRequired?.name || item.machine?.machineRequired || null,
              machineId: item.machine?.machineRequired?._id || null,
              startTime: item.machine?.startTime || null,
              endTime: item.machine?.endTime || null,
              actualDuration: item.machine?.actualDuration || null
            },
            // Worker details
            worker: {
              workerAssigned: item.worker?.workerAssigned || null,
              startTime: item.worker?.startTime || null,
              endTime: item.worker?.endTime || null,
              actualDuration: item.worker?.actualDuration || null
            },
            // Material/Consumables details
            materials: {
              materialsRequired: item.material?.materialsRequired || [],
              estimatedPrice: item.material?.estimatedPrice || 0
            }
          })) || []
        }));

        // Use transformedJobs here
        setJobs(transformedJobs); // or whatever you need to do with it
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };


  useEffect(() => {
      if (!userInfo) return;
      if (!userInfo.shopId) {
        console.log("⚠️ User info loaded but no shopId found");
        return;
      }

      getAllJobs();
    }, [userInfo]);
    // Filter jobs based on search query
    const filteredJobs = jobs.filter(job =>
    job.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.vehicle_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );




    useEffect(() => {
      if (!selectedJob) {
          const firstCompletedJob = jobs.find(job => job.status === 'completed' || job.status === 'Quality Checked');
          if (firstCompletedJob) {
              setSelectedJob(firstCompletedJob);
          } else if (jobs.length > 0) {
              setSelectedJob(jobs[0]); 
          }
      }
    }, [jobs]); 



    const calculateJobTotal = (job) => {
      if (!job) return 0;
      const itemsTotal = job.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
      const machinesTotal = job.machines.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);
      const consumablesTotal = job.consumables.reduce((sum, item) => sum + ((item.quantity || 0) * (item.perPiecePrice || 0)), 0);
      return itemsTotal + machinesTotal + consumablesTotal;
    };

    // --- QA Action Handlers ---
  const handleItemQualityGood = async (jobId, qualityStatus ) => {
  if (!selectedJob || selectedJob.status !== 'completed') return;

  try {
    const res = await axios.put(
      `/jobs/qualityGood/${jobId}/${userInfo.id}`
    );

    if (!res.data?.success) {
      console.log("Unable to assign qualityStatus ");
    } else {
      alert("Status updated successfully");
    }

    // Update local job list
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, qualityStatus: qualityStatus  } : job
      )
    );

    // Update selected job
    setSelectedJob(prev =>
      prev && prev.id === jobId ? { ...prev, qualityStatus: qualityStatus  } : prev
    );
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
};
const handleItemQualityBad = async (jobId, notes) => {
  if (!selectedJob || selectedJob.status !== 'completed') return;

  try {
    const res = await axios.post(
      `/jobs/qualityBad/${jobId}/${userInfo.id}`,
      { notes }
    );

    if (!res.data?.success) {
      console.log("Unable to assign quality status");
    } else {
      alert("Status updated successfully");
    }

    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, qualityStatus: 'need-work', status: 'rejected', notes }
          : job
      )
    );

    setSelectedJob(prev =>
      prev && prev.id === jobId
        ? { ...prev, qualityStatus: 'need-work', status: 'rejected', notes }
        : prev
    );

    setShowNotesPopup(false);
    setNotes('');
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
};





    const handleMarkQualityChecked = (jobId) => {
          if (!selectedJob || selectedJob.status !== 'completed') return;
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
    const pendingReviewCount = jobs.filter(j => j.status === 'completed').length;
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
                      <span className={`status-badge ${ job.status === 'completed' ? 'status-review' /* Specific QA status */ : job.status === 'Quality Checked' ? 'status-completed' : 'status-assigned' }`}>
                        {job.status === 'completed' ? 'Ready for QA' : job.status}
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
                        <div><strong>Status:</strong><span className={`status-badge ${ selectedJob.status === 'completed' ? 'status-review' : selectedJob.status === 'Quality Checked' ? 'status-completed' : 'status-assigned' }`}>{selectedJob.status === 'Completed' ? 'Ready for QA' : selectedJob.status}</span></div>
                        <div className="full-width"><strong>Assigned Employee:</strong> <span>{selectedJob.assignedEmployee?.name || 'N/A'}</span></div>
                        {selectedJob.qaCheckedBy && (<div className="full-width"><strong>QA Checked By:</strong> <span>{selectedJob.qaCheckedBy}</span></div>)}
                    </div>
                    
                    {/* Job Tasks with QA Actions */}
                  <div className="job-items-container">
    <strong className="job-items-title">Job Tasks to Review:</strong>

    {/* List all job tasks */}
    {selectedJob.items.map((item, index) => (
      <div key={index} className="job-item-card qa-item-card">
        <div className="item-header-row">
          <div className="item-info">
            <div className="item-title">
              <strong>Task #{index + 1}</strong>
              {item.jobType && <span className="item-type">({item.jobType})</span>}
            </div>
            <div className="item-description">{item.description}</div>
          </div>
          <div className="item-status-display">
            <span className="status-badge status-completed">{selectedJob.status}</span>
          </div>
        </div>
      </div>
    ))}

    {/* --- Single Quality Assessment section below all tasks --- */}
    <div className="qa-actions-section">
      {selectedJob.status === 'approved' || selectedJob.status === 'Quality Checked' ? (
    <div className="verified-message">
      <img src={tickIcon} alt="Verified" className="btn-icon small qa-icon" /> 
      <span className="verified-text">Item verified</span>
    </div>
      ) : (
        <>
          <strong className="job-items-title">Quality Assessment:</strong>
          <div className="quality-buttons">
            <button
              className="btn-good"
              onClick={() => handleItemQualityGood(selectedJob.id,  'Good')}
              disabled={selectedJob.status !== 'completed'}
            >
              <img src={tickIcon} alt="Good" className="btn-icon small qa-icon" /> Good
            </button>
            <button
              className="btn-needs-work"
                onClick={() => setShowNotesPopup(true)}
              disabled={selectedJob.status !== 'completed'}
            >
              <img src={infoIcon} alt="Needs Work" className="btn-icon small qa-icon" /> Needs Work
            </button>
            {showNotesPopup && (
  <div className="popup-overlay">
    <div className="popup-container">
      <h3>Enter Notes for "Needs Work"</h3>
      <textarea
        className="notes-textarea"
        placeholder="Enter reason or notes here..."
        required
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="popup-buttons">
        <button
          className="btn-confirm"
          onClick={() => handleItemQualityBad(selectedJob.id, notes)}
          disabled={!notes.trim()}
        >
          Submit
        </button>
        <button
          className="btn-cancel"
          onClick={() => { setShowNotesPopup(false); setNotes(''); }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

          </div>
          </>
          )}
    </div>
  </div>


                    {/* --- Final QA Confirmation Section --- */}
                    {selectedJob.status === 'completed' && (
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
                    {selectedJob.status === 'approved' && (
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