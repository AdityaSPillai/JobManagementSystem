import { useState } from 'react';
import '../styles/OwnerDashboard.css';
import Header from './Header';
import OverviewTab from './OverviewTab'; // Import new tab
import EmployeesTab from './EmployeesTab'; // Import new tab
import MachinesTab from './MachinesTab'; // Import new tab

// --- Shop Creation Modal Component (No Changes) ---
function ShopCreationModal({ isVisible, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.shopName || !formData.phone || !formData.email || !formData.street || !formData.city || !formData.state || !formData.pincode) {
        alert("Please fill in all fields.");
        return;
    }
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      shopName: '', phone: '', email: '', street: '', city: '', state: '', pincode: '',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>➕ Create Shop</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          
          <div className="form-group">
            <label htmlFor="shopName">Shop Name</label>
            <input type="text" id="shopName" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="The Auto Garage" required />
          </div>

          <div className="form-grid cols-2">
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="555-123-4567" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@garage.com" required />
            </div>
          </div>

          <label className="form-label-group">Address</label>
          <div className="form-group">
            <input type="text" id="street" name="street" value={formData.street} onChange={handleChange} placeholder="Street Address" required />
          </div>
          
          <div className="form-grid cols-3">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="City" required />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} placeholder="State/Province" required />
            </div>
            <div className="form-group">
              <label htmlFor="pincode">Pincode</label>
              <input type="text" id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" required />
            </div>
          </div>
          
          <button type="submit" className="btn-submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
// --- End Shop Creation Modal Component ---


function OwnerDashboard({ onLogout }) {
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // State for active tab

  const handleShopSubmit = (shopData) => {
      console.log('New Shop Data Submitted:', shopData);
      alert(`Shop "${shopData.shopName}" created successfully! (See console for data)`);
  }

  return (
    <div className="owner-dashboard">
      <Header userRole="Owner" onLogout={onLogout} showLogin={false} />
      <div className="dashboard-banner">
        <div className="banner-top-row">
          <div className="banner-content">
            <h2>Owner Dashboard</h2>
            <p>Manage jobs, assign employees, and track progress</p>
          </div>
          <button className="btn-create-shop" onClick={() => setIsShopModalOpen(true)}>
            + Create New Shop
          </button>
        </div>
        
        <div className="stats-cards">
          <div className="stat-card">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">$160</span>
            <span className="stat-icon">💵</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending Revenue</span>
            <span className="stat-value">$310</span>
            <span className="stat-icon">📈</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Active Employees</span>
            <span className="stat-value">4</span>
            <span className="stat-icon">👥</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Available Machines</span>
            <span className="stat-value">4</span>
            <span className="stat-icon">🔧</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="tabs-section">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>⭐ Overview</button>
          <button className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>👥 Employees</button>
          <button className={`tab-btn ${activeTab === 'machines' ? 'active' : ''}`} onClick={() => setActiveTab('machines')}>🔧 Machinery</button>
          <button className={`tab-btn ${activeTab === 'jobTypes' ? 'active' : ''}`} onClick={() => setActiveTab('jobTypes')}>💼 Job Types</button>
          <button className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`} onClick={() => setActiveTab('financial')}>💰 Financial</button>
        </div>

        {/* --- Conditionally Rendered Tab Content --- */}
        <div className="tab-content">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'employees' && <EmployeesTab />}
          {activeTab === 'machines' && <MachinesTab />}
          {activeTab === 'jobTypes' && <div className="placeholder-content">Job Types Management Coming Soon...</div>}
          {activeTab === 'financial' && <div className="placeholder-content">Financial Dashboard Coming Soon...</div>}
        </div>
        {/* --- End Tab Content --- */}

      </div>
      
      <ShopCreationModal 
        isVisible={isShopModalOpen} 
        onClose={() => setIsShopModalOpen(false)} 
        onSubmit={handleShopSubmit}
      />
    </div>
  );
}

export default OwnerDashboard;