import { useState, useEffect } from 'react';
import axios from '../utils/axios.js';
import useAuth from '../context/context.jsx';
import '../styles/QADashboard.css';
import Header from './Header.jsx';
import userIcon from '../assets/user.svg';
import calendarIcon from '../assets/calendar.svg';

function QADashboard({onLogout}) {
  const { userInfo } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotesPopup, setShowNotesPopup] = useState(null);
  const [notes, setNotes] = useState('');

  // -----------------------------
  // FETCH JOBS
  // -----------------------------
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
          status: job.status || 'Not Assigned',
          notes: (job.notes || ''),
          totalEstimatedAmount: job.totalEstimatedAmount || 0,
          items: job.jobItems?.map(item => {
            

              // Determine status from backend timestamps
             const computedStatus = item.status || 'pending';

              return {
                itemId: item._id,
                jobType: item.itemData?.job_type || '',
                description: item.itemData?.description || '',
                priority: item.itemData?.priority || '',
                estimatedPrice: item.estimatedPrice || 0,
                numberOfWorkers:item.numberOfWorkers || 1,
                notes: item.notes || '',
                category: item.category,
                estimatedManHours: item.estimatedManHours,
                itemStatus: computedStatus,   // but computedStatus = item.status now
                 
                machine: Array.isArray(item.machine) ?
                item.machine.map(machine=>({
                  machineRequired: machine.machineRequired?.name || machine.machineRequired || null,
                  machineId: machine.machineRequired?._id || null,
                  startTime: machine.startTime || null,
                  endTime: machine.endTime || null,
                  actualDuration: machine.actualDuration || null
                }))
                :[],
               
               workers: Array.isArray(item.workers)
                    ? item.workers.map(worker => ({
                        workerAssigned: worker.workerAssigned,
                        startTime: worker.startTime,
                        endTime: worker.endTime,
                        actualDuration: worker.actualDuration,
                      }))
                    : [],

                
                consumable: Array.isArray(item.consumable)
                  ? item.consumable
                      .filter(c => c.name && c.name.trim() !== "" && c.price > 0)
                      .map(c => ({
                        name: c.name.trim(),
                        price: c.price,
                        available: c.available,
                      }))
                  : []
              };
            }) || []

        }));
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    if (userInfo?.shopId) getAllJobs();
  }, [userInfo]);

  // -----------------------------
  // STATS
  // -----------------------------
  const totalJobs = jobs.length;
  const approvedJobs = jobs.filter(j => j.status === 'approved').length;
  const rejectedJobs = jobs.filter(j => j.status === 'rejected').length;
  const pendingJobs = jobs.filter(j => j.status === 'supapproved').length;

  // -----------------------------
  // FILTERS
  // -----------------------------
  const getFilteredJobs = () => {
    if (activeTab === 'pending') return jobs.filter(j => j.status === 'supapproved');
    if (activeTab === 'approved') return jobs.filter(j => j.status === 'approved');
    if (activeTab === 'rejected') return jobs.filter(j => j.status === 'rejected');
    return [];
  };

  const filteredJobs = getFilteredJobs().filter(job =>
    job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.vehicle_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // -----------------------------
  // ACTIONS
  // -----------------------------
  const approveItem = async (jobId, itemId) => {
     if (!selectedJob || selectedJob.status !== 'supapproved') return;
    console.log("Marking item as Good:", jobId, itemId);

    try {
      const res = await axios.put(
        `/jobs/qualityGood/${jobId}/${itemId}/${userInfo.id}`,
      );

      if (!res.data?.success) {
        console.log("Unable to assign qualityStatus");
      } else {
        alert("Status updated successfully");
      }


    setJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: 'approved',
              items: job.items.map(item =>
                item.itemId === itemId
                  ? { ...item, qualityStatus: 'Good' }
                  : item
              )
            }
          : job
      )
    );
  } catch (error) {
      console.error("Error approving item:", error);
      alert("Error approving item");
    }
  };

  const rejectItem = async (jobId, itemId) => {
     if (!selectedJob || selectedJob.status !== 'supapproved') return;
    console.log("Marking item as Needs Work:", jobId, itemId, notes);

    try {
      const res = await axios.post(
        `/jobs/qualityBad/${jobId}/${itemId}/${userInfo.id}`,
        { notes }
      );

      if (!res.data?.success) {
        console.log("Unable to assign quality status");
      } else {
        alert("Status updated successfully");
      }

    setJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: 'rejected',
              items: job.items.map(item =>
                item.itemId === itemId
                  ? { ...item, qualityStatus: 'need-work', notes }
                  : item
              )
            }
          : job
      )
    );
    setShowNotesPopup(null);
    setNotes('');
    alert('Rejected');
  } catch (error) {
      console.error("Error rejecting item:", error);
      alert("Error rejecting item");
    }
  };

  return (
    <>
      <Header userRole="QA/QC" onLogout={onLogout} showLogin={false} />

      <div className="qa-dashboard">

        {/* ================= BANNER ================= */}
        <div className="dashboard-banner qa-banner">
          <div className="banner-content">
            <h2>QA/QC Dashboard</h2>
            <p>Review completed jobs and ensure quality standards</p>
          </div>

          <div className="stats-cards">
            <div className="stat-card">
              <span className="stat-label">Total Jobs</span>
              <span className="stat-value">{totalJobs}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Approved {approvedJobs}</span>
              <span className="stat-value">{approvedJobs}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Rejected</span>
              <span className="stat-value">{rejectedJobs}</span>
            </div>
          </div>
        </div>

        {/* ================= GRID ================= */}
        <div className="dashboard-content">
          <div className="dashboard-grid">

            {/* LEFT SIDE TABS */}
            <div className="job-list-sectionqa">
              <div className="filter-buttons">
                <button className="filter-btn" onClick={() => { setActiveTab('overview'); setSelectedJob(null); }}>📊 Overview</button>
                <button className="filter-btn" onClick={() => { setActiveTab('pending'); setSelectedJob(null); }}>
                  ⏳ Needs Approval ({pendingJobs})
                </button>
                <button className="filter-btn" onClick={() => { setActiveTab('approved'); setSelectedJob(null); }}>✅ Approved ({approvedJobs})</button>
                <button className="filter-btn" onClick={() => { setActiveTab('rejected'); setSelectedJob(null); }}>❌ Rejected ({rejectedJobs})</button>
              </div>

              {activeTab !== 'overview' && (
                <>
                  <input
                    className="search-input"
                    placeholder="Search job..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />

                  {filteredJobs.map(job => (
                    <div
                      key={job.id}
                      className="job-card"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="job-header">
                        <span className="job-number">
                          {`Job-${job.jobCardNumber?.split("-").pop()}`}
                        </span>
                        <span className="job-date">{job.date}</span>
                        <div className="job-details">
                    <span><img src={userIcon} alt="Vehicle" className="inline-icon" /> {job.vehicle_number}</span>
                    <span><img src={calendarIcon} alt="Date" className="inline-icon" /> {job.date}</span>
                  </div>

                        <span
                          className={`status-badge ${
                            job.status === 'completed'
                              ? 'status-completed'
                              : job.status === 'approved'
                              ? 'status-approved'
                              : job.status === 'rejected'
                              ? 'status-rejected'
                              : 'status-progress'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* RIGHT SIDE DETAILS */}
            <div className="details-section">

              {/* ============== OVERVIEW TAB ============== */}
              {activeTab === 'overview' && (
                <div className="qa-overview">
                  <div className="overview-header">
                    <h3>QA/QC Dashboard Overview</h3>
                    <p>Live quality control job statistics</p>
                  </div>

                  <div className="overview-cards">
                    <div className="overview-card total">
                      <span className="label">Total Jobs</span>
                      <span className="value">{totalJobs}</span>
                    </div>
                    <div className="overview-card approved">
                      <span className="label">Approved</span>
                      <span className="value">{approvedJobs}</span>
                    </div>
                    <div className="overview-card rejected">
                      <span className="label">Rejected</span>
                      <span className="value">{rejectedJobs}</span>
                    </div>
                    <div className="overview-card pending">
                      <span className="label">Pending</span>
                      <span className="value">{pendingJobs}</span>
                    </div>
                  </div>

                  <div className="overview-progress">
                    <div>
                      <span>Approved Progress</span>
                      <div className="progress-bar">
                        <div
                          className="progress-fill approved-fill"
                          style={{ width: `${(approvedJobs / totalJobs) * 100 || 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <span>Rejected Progress</span>
                      <div className="progress-bar">
                        <div
                          className="progress-fill rejected-fill"
                          style={{ width: `${(rejectedJobs / totalJobs) * 100 || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============== NO SELECTION ============== */}
              {!selectedJob && activeTab !== 'overview' && (
                <div className="no-selection">
                  <p>Select a job to view details</p>
                </div>
              )}

              {/* ============== JOB DETAILS ============== */}
              {selectedJob && (
                <div className="job-details-view">
                 <div className="job-info-grid">
                    <div><strong>Job Number:</strong> <span>{selectedJob.jobCardNumber}</span></div>
                    <div><strong>Customer:</strong> <span>{selectedJob.customer_name}</span></div>
                    <div><strong>Vehicle:</strong> <span>{selectedJob.vehicle_number}</span></div>
                    <div><strong>Model:</strong> <span>{selectedJob.vehicle_model || 'N/A'}</span></div>
                    <div><strong>Engine:</strong> <span>{selectedJob.engine_number || 'N/A'}</span></div>
                    <div><strong>Contact:</strong> <span>{selectedJob.contact_number}</span></div>
                    <div><strong>Date:</strong> <span>{selectedJob.date}</span></div>
                  </div>
                  
                  {selectedJob.items.map(item => (
                    

                    <div key={item.itemId} className="job-detail-item">
                       {!item.qualityStatus && activeTab === 'pending' && (
                        <div className="quality-buttons">
                          <button className="btn-good" onClick={() => approveItem(selectedJob.id, item.itemId)}>Approve</button>
                          <button className="btn-needs-work" onClick={() => setShowNotesPopup(item.itemId)}>Reject</button>
                        </div>
                      )}
                      <p><b>{item.jobType}</b> - {item.description}</p>

                     

                      {item.qualityStatus && (
                        <p>Status: {item.qualityStatus}</p>
                      )}

                            {Array.isArray(item.machine) && item.machine.length > 0 && (
                                  <div className="job-items-container">
                                    <strong className="job-items-title">Machines Used:</strong>
                                    <div className="full-width">
                                      {item.machine.map((m, mi) => (
                                        <p key={mi} className='machine-name'>
                                          <strong>Machine {mi + 1}:</strong> {m.machineRequired || 'N/A'}
                                          {m.actualDuration && (
                                            <span style={{ marginLeft: '10px', color: '#666' }}>
                                              (Duration: {(m.actualDuration / 60).toFixed(2)} hrs)
                                            </span>
                                          )}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                )}


                                {item.consumable && item.consumable.length > 0 && (
                                <div className="job-items-container">
                                  <strong className="job-items-title">Consumables Used:</strong>
                                  <div className="full-width">
                                    {item.consumable.map((c, i) => (
                                      <p key={i} style={{ color: 'black' }}>
                                        {c.name} — ${c.price} {c.available ? "(Available)" : "(Not Available)"}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}


                      {showNotesPopup === item.itemId && (
                        <div className="popup-overlay">
                          <div className="popup-container">
                            <textarea
                              className="notes-textarea"
                              value={notes}
                              onChange={e => setNotes(e.target.value)}
                            />
                            <div className="popup-buttons">
                              <button className="btn-confirm" onClick={() => rejectItem(selectedJob.id, item.itemId)}>Submit</button>
                              <button className="btn-cancel" onClick={() => setShowNotesPopup(null)}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default QADashboard;
