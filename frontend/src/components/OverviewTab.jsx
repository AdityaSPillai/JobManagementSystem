import React from 'react';

function OverviewTab() {
  return (
    <>
      <h3 className="section-title">System Overview</h3>
      <div className="overview-grid">
        <div className="overview-card blue-card">
          <h4>📊 Job Statistics</h4>
          <div className="stat-row">
            <span>Total Jobs</span>
            <span className="stat-number">3</span>
          </div>
          <div className="stat-row">
            <span>Completed:</span>
            <span className="stat-number">1</span>
          </div>
          <div className="stat-row">
            <span>In Progress:</span>
            <span className="stat-number">1</span>
          </div>
          <div className="stat-row">
            <span>Pending:</span>
            <span className="stat-number">0</span>
          </div>
        </div>

        <div className="overview-card green-card">
          <h4>👥 Workforce</h4>
          <div className="stat-row">
            <span>Total Employees:</span>
            <span className="stat-number">4</span>
          </div>
          <div className="stat-row">
            <span>Active:</span>
            <span className="stat-number">4</span>
          </div>
          <div className="stat-row">
            <span>Inactive:</span>
            <span className="stat-number">0</span>
          </div>
        </div>

        <div className="overview-card purple-card">
          <h4>🔧 Equipment Status</h4>
          <div className="stat-row">
            <span>Total Machines:</span>
            <span className="stat-number">4</span>
          </div>
          <div className="stat-row">
            <span>Available:</span>
            <span className="stat-number">4</span>
          </div>
          <div className="stat-row">
            <span>In Use:</span>
            <span className="stat-number">0</span>
          </div>
          <div className="stat-row">
            <span>Maintenance:</span>
            <span className="stat-number">0</span>
          </div>
        </div>

        <div className="overview-card peach-card">
          <h4>💰 Revenue Summary</h4>
          <div className="stat-row">
            <span>Completed Jobs:</span>
            <span className="stat-number green-text">$160.00</span>
          </div>
          <div className="stat-row">
            <span>Pending:</span>
            <span className="stat-number blue-text">$310.00</span>
          </div>
          <div className="stat-row">
            <span>Projected Total:</span>
            <span className="stat-number orange-text">$470.00</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default OverviewTab;