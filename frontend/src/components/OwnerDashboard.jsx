import { useState,useEffect } from 'react';
import '../styles/OwnerDashboard.css';
import Header from './Header';
import OverviewTab from './OverviewTab';
import EmployeesTab from './EmployeesTab';
import MachinesTab from './MachinesTab';
import CustomerTab from './CustomerTab';
import MachineCategoryTab from './MachineCategoryTab.jsx';
import ConsumablesTab from './ConsumablesTab.jsx';
import useAuth from "../context/context.jsx";
import axios from "../utils/axios.js"
import ManPowerCategoryTab from './ManPowerCategoryTab.jsx';
import ServiceTypeTab from './ServiceTypeTab.jsx';

// --- Shop Creation Modal Component ---
function ShopCreationModal({ isVisible, onClose, onSubmit }) {
  const {userInfo}=useAuth();
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    email: '',
    currency: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    services: [{
      name: '',
      description: ''
    }],
    categories: [{
      name: '',
      hourlyRate: ''
    }],
    machineCategory: [{
      name: '',
      hourlyRate: ''
    }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index][field] = value;
    setFormData(prev => ({ ...prev, services: updatedServices }));
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index][field] = value;
    setFormData(prev => ({ ...prev, categories: updatedCategories }));
  };

  const handleMachineCategoryChange = (index, field, value) => {
    const updated = [...formData.machineCategory];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, machineCategory: updated }));
  };

  const addMachineCategory = () => {
    setFormData(prev => ({
      ...prev,
      machineCategory: [...prev.machineCategory, { name: '', hourlyRate: '' }]
    }));
  };

  const removeMachineCategory = (index) => {
    if (formData.machineCategory.length === 1) {
      alert("At least one machine category is required");
      return;
    }
    const updated = formData.machineCategory.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, machineCategory: updated }));
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, { name: '', hourlyRate: '' }]
    }));
  };

  const removeCategory = (index) => {
    if (formData.categories.length === 1) {
      alert("At least one category is required");
      return;
    }
    const updatedCategories = formData.categories.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, categories: updatedCategories }));
  };


  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { name: '', description: '' }]
    }));
  };

  const removeService = (index) => {
    if (formData.services.length === 1) {
      alert("At least one service is required");
      return;
    }
    const updatedServices = formData.services.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, services: updatedServices }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!formData.shopName || !formData.phone || !formData.email || !formData.street || !formData.city || !formData.state || !formData.pincode) {
        alert("Please fill in all fields.");
        return;
    }
    
    // Validate services
    const hasEmptyService = formData.services.some(service => 
      !service.name || !service.description
    );
    if (hasEmptyService) {
      alert("Please fill in all service fields.");
      return;
    }

    const hasEmptyCategory = formData.categories.some(category =>
      !category.name || !category.hourlyRate
    );
    if (hasEmptyCategory) {
      alert("Please fill in all category fields.");
      return;
    }

    const hasEmptyMachineCategory = formData.machineCategory.some(mc =>
      !mc.name || !mc.hourlyRate
    );
    if (hasEmptyMachineCategory) {
      alert("Please fill in all machine category fields.");
      return;
    }

    // Format data to match your API structure
    const shopData = {
      shopName: formData.shopName,
      ownerId: userInfo.id,
      currency: formData.currency,
      contactInfo: {
        phone: formData.phone,
        email: formData.email
      },
      services: formData.services.map(service => ({
        name: service.name,
        description: service.description
      })),
      categories: formData.categories.map(category => ({
        name: category.name,
        hourlyRate: Number(category.hourlyRate)
      })),
      machineCategory: formData.machineCategory.map(mc => ({
        name: mc.name,
        hourlyRate: Number(mc.hourlyRate)
      })),
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      }
    };

  
  try {

    // ✅ FIXED: Pass shopData as a single object
    const response = await axios.post('/shop/create', shopData);
    
    if (!response.data.success) {
     console.log("Error while adding new shop");
      return;
    }
      const existingUserInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  const shopId = response.data.shop?._id || response.data.shopId;
  const updatedUserInfo = { ...existingUserInfo, shopId };
  localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
  
    alert("Shop added successfully!");
    window.location.reload();
    if (onSubmit) {
      onSubmit(response.data.shop || formData);
    }
    

    // Reset form
    setFormData({
      shopName: '',
      phone: '',
      email: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      services: [{ name: '', description: '' }],
      categories: [{ name: '', hourlyRate: '' }],
      machineCategory: [{ name: '', hourlyRate: '' }]
    });
  onClose();
    
  } catch (error) {
    console.error('Shop Creation Error:', error);
  } 
};


  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="create-shop-heading-h3"><img src="/plus.png" alt="Plus Icon" className="plus-icon"/> Create Shop</h3>
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
             <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <input type="text" id="currency" name="currency" value={formData.currency} onChange={handleChange} placeholder=" USD | AED | INR" required />
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

          <label className="form-label-group">Service Types</label>
          {formData.services.map((service, index) => (
            <div key={index} className="service-item">
              <div className="form-grid cols-3">
                <div className="form-group">
                  <label htmlFor={`service-name-${index}`}>Name</label>
                  <input 
                    type="text" 
                    id={`service-name-${index}`}
                    value={service.name} 
                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                    placeholder="e.g., Oil Change" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={`service-desc-${index}`}>Description</label>
                  <input 
                    type="text" 
                    id={`service-desc-${index}`}
                    value={service.description} 
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    placeholder="Job description" 
                    required 
                  />
                </div>
                {formData.services.length > 1 && (
                  <div>
                    <label className="remove-btn-label">Remove</label>
                    <button 
                      type="button" 
                      className="btn-remove-service" 
                      onClick={() => removeService(index)}
                    >
                      ✕ Remove Service
                    </button>
                  </div>
              )}
              </div>
            </div>
          ))}
          <button type="button" className="btn-add-service" onClick={addService}>
            + Add Another Service
          </button>

          <label className="form-label-group">Man Power Categories</label>
            {formData.categories.map((category, index) => (
              <div key={index} className="service-item">
                <div className="form-grid cols-3">
                  <div className="form-group">
                    <label htmlFor={`category-name-${index}`}>Category Name</label>
                    <input
                      type="text"
                      id={`category-name-${index}`}
                      value={category.name}
                      onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                      placeholder="e.g., Electrician, Labour, Cleaner"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`category-rate-${index}`}>Hourly Rate ($)</label>
                    <input
                      type="number"
                      id={`category-rate-${index}`}
                      value={category.hourlyRate}
                      onChange={(e) => handleCategoryChange(index, 'hourlyRate', e.target.value)}
                      placeholder="Enter rate"
                      min="0"
                      required
                    />
                  </div>
                  {formData.categories.length > 1 && (
                    <div>
                      <label className="remove-btn-label">Remove</label>
                      <button
                        type="button"
                        className="btn-remove-service"
                        onClick={() => removeCategory(index)}
                      >
                        ✕ Remove Category
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="btn-add-service" onClick={addCategory}>
              + Add Another Category
            </button>

            <label className="form-label-group">Machine Categories</label>
              {formData.machineCategory.map((mc, index) => (
                <div key={index} className="service-item">
                  <div className="form-grid cols-3">
                    <div className="form-group">
                      <label htmlFor={`mc-name-${index}`}>Machine Category Name</label>
                      <input
                        type="text"
                        id={`mc-name-${index}`}
                        value={mc.name}
                        onChange={(e) => handleMachineCategoryChange(index, 'name', e.target.value)}
                        placeholder="e.g., Heavy, Diagnostic, Painting"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor={`mc-rate-${index}`}>Hourly Rate ($)</label>
                      <input
                        type="number"
                        id={`mc-rate-${index}`}
                        value={mc.hourlyRate}
                        onChange={(e) => handleMachineCategoryChange(index, 'hourlyRate', e.target.value)}
                        placeholder="Enter rate"
                        min="0"
                        required
                      />
                    </div>
                    {formData.machineCategory.length > 1 && (
                    <div>
                      <label className="remove-btn-label">Remove</label>
                      <button
                        type="button"
                        className="btn-remove-service"
                        onClick={() => removeMachineCategory(index)}
                      >
                        ✕ Remove Machine
                      </button>
                    </div>
                  )}
                  </div>
                  
                </div>
              ))}
              <button type="button" className="btn-add-service" onClick={addMachineCategory}>
                + Add Another Machine Category
              </button>
          
          <button type="submit" className="btn-submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
// --- End Shop Creation Modal Component ---


function OwnerDashboard({ onLogout }) {
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [empCount,setEmpCount]=useState(0)
  const[machineCount,setMchineCount]=useState(0)
  const[jobCount,setJobCount]=useState(0)
  const{userInfo}=useAuth()


  const getEmployeeeCount=async()=>{
    try {
      const allEmp= await axios.get(`/shop/getAllEmployees/${userInfo.shopId}`)
      console.log(allEmp.data.users.length)
     setEmpCount(allEmp.data.users.length)
      
    } catch (error) {
      console.log(error)
    }
  }

 const getMachinesCount=async()=>{
    try {
      const allMachines= await axios.get(`/shop/getAllMachines/${userInfo.shopId}`)
      console.log(allMachines.data.machines.length)
     setMchineCount(allMachines.data.machines.length)
      
    } catch (error) {
      console.log(error)
    }
  }

  const getJobCount=async()=>{
    try {
      const res= await axios.get(`/shop/getAllJobs/${userInfo.shopId}`)
      console.log(res.data.allJobs.length)
      setJobCount(res.data.allJobs.length)
      
    } catch (error) {
      console.log(error)
    }
  }  
  
  useEffect(()=>{
    if (userInfo?.shopId) {
    getEmployeeeCount();
    getMachinesCount();
    getJobCount();
  }
  },[userInfo?.shopId])
  const handleShopSubmit = (shopData) => {
    console.log('New Shop Data Submitted:', shopData);
    // You can refresh the shop list here or update state

  };

  return (
    <div className="owner-dashboard">
      <Header userRole="Owner" onLogout={onLogout} showLogin={false} />
      <div className="dashboard-banner">
        <div className="banner-top-row">
          <div className="banner-content">
            <h2>Owner Dashboard</h2>
            <p>Manage jobs, assign employees, and track progress</p>
          </div>
          {!userInfo?.shopId &&<button className="btn-create-shop" onClick={() => setIsShopModalOpen(true)}>
            + Create New Shop
          </button> }
        </div>
        
        <div className="stats-cards">
          <div className="stat-card">
            <span className="stat-label">All Employees</span>
            <span className="stat-value">{empCount}</span>
            <span className="stat-icon"><img src="/employee.png" alt="Employee Icon" className="stat-icon"/></span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Available Machines</span>
            <span className="stat-value">{machineCount}</span>
            <span className="stat-icon"><img src="/machinecategory.png" alt="Machine Icon" className="stat-icon" /></span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Jobs</span>
            <span className="stat-value">{jobCount}</span>
            <span className="stat-icon"><img src="/graph.png" alt="Graph Icon" className="stat-icon" /></span>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="sidebar-tabs">
          <button className={`sidebar-tab ${activeTab === 'overview' ? 'active' : ''}`}  onClick={() => setActiveTab('overview')}><img src="/stats.png" alt="Overview Icon" className="sidebar-icon" /> Overview</button>
          <button className={`sidebar-tab ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}><img src="/employee.png" alt="Employee Icon" className="sidebar-icon" /> Employees</button>
          <button className={`sidebar-tab ${activeTab === 'serviceTypes' ? 'active' : ''}`} onClick={() => setActiveTab('serviceTypes')}><img src="/job.png" alt="Service Type Icon" className="sidebar-icon" /> Service Type</button>
          <button className={`sidebar-tab ${activeTab === 'manPowerCategory' ? 'active' : ''}`} onClick={() => setActiveTab('manPowerCategory')}><img src="/jobcategory.png" alt="Man Power Category Icon" className="sidebar-icon" /> Man Power Category</button>
          <button className={`sidebar-tab ${activeTab === 'machines' ? 'active' : ''}`} onClick={() => setActiveTab('machines')}><img src="/machine.png" alt="Machinery Icon" className="sidebar-icon" /> Machinery</button>
          <button className={`sidebar-tab ${activeTab === 'machineCategory' ? 'active' : ''}`} onClick={() => setActiveTab('machineCategory')}><img src="/machinecategory.png" alt="Machine Category Icon" className="sidebar-icon" /> Machine Category</button>
          <button className={`sidebar-tab ${activeTab === 'consumables' ? 'active' : ''}`} onClick={() => setActiveTab('consumables')}><img src="/consumables.png" alt="Consumables Icon" className="sidebar-icon" /> Consumables</button>
          <button className={`sidebar-tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}><img src="/customer.png" alt="Customers Icon" className="sidebar-icon" /> Customers</button>
        </div>

        <div className="main-content-area">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'employees' && <EmployeesTab />}
          {activeTab === 'machines' && <MachinesTab />}
          {activeTab === 'serviceTypes' && <ServiceTypeTab />}
          {activeTab === 'manPowerCategory' && <ManPowerCategoryTab  />}
          {activeTab === 'machineCategory' && <MachineCategoryTab />}
          {activeTab === 'customers' && <CustomerTab />}
          {activeTab === 'consumables' && <ConsumablesTab />}
        </div>
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