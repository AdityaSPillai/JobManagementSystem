import { useState } from 'react';
import Header from './Header';
import '../styles/QADashboard.css';

function QADashboard({ onLogout }) {
  const [selectedJob, setSelectedJob] = useState(null);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="qa-dashboard">
      <Header userRole="QA/QC" onLogout={onLogout} showLogin={false} />

      <div className="dashboard-banner qa-banner">
        <div className="banner-content">
          <h2>QA/QC Dashboard</h2>
          <p>Manage jobs, assign employees, and track progress</p>
        </div>
        <div className="stats-cards">
          <div className="stat-card">
            <span className="stat-label">Pending Reviews</span>
            <span className="stat-value">1</span>
            <span className="stat-icon">🔄</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Items Reviewed</span>
            <span className="stat-value">3</span>
            <span className="stat-icon">📋</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Approved</span>
            <span className="stat-value">3</span>
            <span className="stat-icon">✅</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Needs Rework</span>
            <span className="stat-value">0</span>
            <span className="stat-icon">ℹ️</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="job-list-section">
            <div className="section-header">
              <h3>📋 Job Cards</h3>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search by job number, owner or vehicle number..."
            />

            <div
              className={`job-card ${selectedJob === 1 ? 'selected' : ''}`}
              onClick={() => setSelectedJob(1)}
            >
              <div className="job-header">
                <span className="job-number">JOB-20251004-0001</span>
                <span className="status-badge status-review">QA Review</span>
              </div>
              <p className="job-owner">John Smith</p>
              <div className="job-details">
                <span>🚗 ABC-123</span>
                <span>📅 Oct 5,2025, 08:30 AM</span>
              </div>
              <p className="job-items">2 jobs</p>
            </div>

            <div
              className={`job-card ${selectedJob === 2 ? 'selected' : ''}`}
              onClick={() => setSelectedJob(2)}
            >
              <div className="job-header">
                <span className="job-number">JOB-20251004-0002</span>
                <span className="status-badge status-completed">Completed</span>
              </div>
              <p className="job-owner">John Smith</p>
              <div className="job-details">
                <span>🚗 ABC-123</span>
                <span>📅 Oct 5,2025, 08:30 AM</span>
              </div>
              <p className="job-items">2 jobs</p>
            </div>
          </div>

          <div className="details-section">
            {!selectedJob && (
              <div className="no-selection">
                <div className="no-selection-icon">📋</div>
                <p>No Selection</p>
                <p className="no-selection-hint">Click on a job card from the list to view its details here</p>
              </div>
            )}

            {selectedJob === 1 && (
              <div className="job-details-panel">
                <div className="panel-header">
                  <div>
                    <h3>JOB-20251004-0001</h3>
                    <p>John Smith</p>
                  </div>
                  <button className="close-btn" onClick={() => setSelectedJob(null)}>✕</button>
                </div>

                <div className="job-info-grid">
                  <div className="info-item">
                    <span className="info-label">Vehicle Number:</span>
                    <span>ABC-123</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Engine Number:</span>
                    <span>ENG456789</span>
                  </div>
                </div>

                <div className="job-timestamp">
                  Oct 5, 2024, 08:30 AM
                  <span className="job-price">$230.00</span>
                </div>

                <h4>⏱️ Job Items (2)</h4>

                <div className="job-item-card">
                  <div className="job-item-header">
                    <span>Oil Change</span>
                    <span className="status-badge status-completed">Completed</span>
                  </div>
                  <p className="job-item-description">Full synthetic oil change</p>
                  <div className="job-item-footer">
                    <span>Assigned Employee</span>
                    <select className="employee-select">
                      <option>Select Emp ID ▼</option>
                    </select>
                  </div>
                  <div className="qa-section">
                    <span>⏱️ 0 h 45 m</span>
                    <div className="update-status">
                      <span>Update Status</span>
                      <div className="status-buttons">
                        <button className="btn-in-progress">In Progress</button>
                        <button className="btn-completed">Completed</button>
                      </div>
                    </div>
                  </div>

                  <div className="quality-assessment">
                    <span>Quality Assessment</span>
                    <div className="quality-buttons">
                      <button className="btn-good">Good</button>
                      <button className="btn-needs-work">Need Work</button>
                    </div>
                  </div>

                  <div className="reviewed-by">
                    <span>Reviewed by:</span>
                    <input type="text" className="reviewer-input" placeholder="Enter name" />
                  </div>
                </div>

                <div className="job-item-card">
                  <div className="job-item-header">
                    <span>Oil Change</span>
                    <span className="status-badge status-progress">In Progress</span>
                  </div>
                  <p className="job-item-description">Full synthetic oil change</p>
                  <div className="job-item-footer">
                    <span>Assigned Employee</span>
                    <select className="employee-select">
                      <option>Select Emp ID ▼</option>
                    </select>
                  </div>
                  <div className="qa-section">
                    <span>⏱️ 0 h 45 m</span>
                    <div className="update-status">
                      <span>Update Status</span>
                      <div className="status-buttons">
                        <button className="btn-in-progress">In Progress</button>
                        <button className="btn-completed">Completed</button>
                      </div>
                    </div>
                  </div>

                  <div className="quality-assessment">
                    <span>Quality Assessment</span>
                    <div className="quality-buttons">
                      <button className="btn-good">Good</button>
                      <button className="btn-needs-work">Need Work</button>
                    </div>
                  </div>

                  <div className="reviewed-by">
                    <span>Reviewed by:</span>
                    <input type="text" className="reviewer-input" placeholder="Enter name" />
                  </div>
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
