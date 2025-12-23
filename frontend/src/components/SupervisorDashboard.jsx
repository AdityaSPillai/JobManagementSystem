import { useState } from 'react';
import '../styles/OwnerDashboard.css';
import Header from './Header';
import SupervisorDashboardComponent from './SupervisorDashboardComponent';
import StatsTab from './StatsTab';
import EmployeesTab from './EmployeesTab';
import MachinesTab from './MachinesTab';
import CustomerTab from './CustomerTab';
import MachineCategoryTab from './MachineCategoryTab.jsx';
import ConsumablesTab from './ConsumablesTab.jsx';
import ManPowerCategoryTab from './ManPowerCategoryTab.jsx';
import ServiceTypeTab from './ServiceTypeTab.jsx';
import ServiceCategoryTab from './ServiceCategoryTab.jsx';
import RejectedJobs from './RejectedJobs.jsx';

function SupervisorDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="owner-dashboard">
      <Header userRole="Supervisor" onLogout={onLogout} showLogin={false} />

      <div className="dashboard-layout">
        <div className="sidebar-tabs">
          <button className={`sidebar-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><img src="/stats.png" alt="dashboard Icon" className="sidebar-icon" /> Dashboard</button>
          <button className={`sidebar-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}><img src="/graph.png" alt="Stats Icon" className="sidebar-icon" /> Stats</button>
          <button className={`sidebar-tab ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}><img src="/employee.png" alt="Employee Icon" className="sidebar-icon" /> Employees</button>
          <button className={`sidebar-tab ${activeTab === 'serviceTypes' ? 'active' : ''}`} onClick={() => setActiveTab('serviceTypes')}><img src="/job.png" alt="Service Type Icon" className="sidebar-icon" /> Service</button>
          <button className={`sidebar-tab ${activeTab === 'serviceCategory' ? 'active' : ''}`} onClick={() => setActiveTab('serviceCategory')}><img src="/job.png" alt="Service Type Icon" className="sidebar-icon" /> Service Category</button>
          <button className={`sidebar-tab ${activeTab === 'manPowerCategory' ? 'active' : ''}`} onClick={() => setActiveTab('manPowerCategory')}><img src="/jobcategory.png" alt="Man Power Category Icon" className="sidebar-icon" /> Man Power Category</button>
          <button className={`sidebar-tab ${activeTab === 'machines' ? 'active' : ''}`} onClick={() => setActiveTab('machines')}><img src="/machine.png" alt="Machinery Icon" className="sidebar-icon" /> Machinery</button>
          <button className={`sidebar-tab ${activeTab === 'machineCategory' ? 'active' : ''}`} onClick={() => setActiveTab('machineCategory')}><img src="/machinecategory.png" alt="Machine Category Icon" className="sidebar-icon" /> Machine Category</button>
          <button className={`sidebar-tab ${activeTab === 'consumables' ? 'active' : ''}`} onClick={() => setActiveTab('consumables')}><img src="/consumables.png" alt="Consumables Icon" className="sidebar-icon" /> Consumables</button>
          <button className={`sidebar-tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}><img src="/customer.png" alt="Customers Icon" className="sidebar-icon" /> Customers</button>
          <button className={`sidebar-tab ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}><img src="/rejected.png" alt="Rejected Jobs Icon" className="sidebar-icon" /> Rejected Jobs</button>

        </div>

        <div className="main-content-area">
          {activeTab === 'dashboard' && < SupervisorDashboardComponent />}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'employees' && <EmployeesTab />}
          {activeTab === 'machines' && <MachinesTab />}
          {activeTab === 'serviceTypes' && <ServiceTypeTab />}
          {activeTab === 'serviceCategory' && <ServiceCategoryTab />}
          {activeTab === 'manPowerCategory' && <ManPowerCategoryTab />}
          {activeTab === 'machineCategory' && <MachineCategoryTab />}
          {activeTab === 'customers' && <CustomerTab />}
          {activeTab === 'consumables' && <ConsumablesTab />}
          {activeTab === 'rejected' && <RejectedJobs />}
        </div>
      </div>
    </div>
  );
}

export default SupervisorDashboard;