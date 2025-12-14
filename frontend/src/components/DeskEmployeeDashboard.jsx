import { useState,useEffect } from 'react';
import '../styles/OwnerDashboard.css';
import Header from './Header';
import CustomerTab from './CustomerTab';
import CreateJobTab from "./CreateJobTab";

function DeskEmployeeDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="owner-dashboard">
      <Header userRole="Desk Employee" onLogout={onLogout} showLogin={false} />

      <div className="dashboard-layout">
        <div className="sidebar-tabs">
          <button className={`sidebar-tab ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}><img src="/customer.png" alt="Create Icon" className="sidebar-icon" /> Create</button>
          <button className={`sidebar-tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}><img src="/customer.png" alt="Customers Icon" className="sidebar-icon" /> Customers</button>
        </div>

        <div className="main-content-area">
          {activeTab === 'create' && <CreateJobTab />}
          {activeTab === 'customers' && <CustomerTab />}
        </div>
      </div>
    </div>
  );
}

export default DeskEmployeeDashboard;