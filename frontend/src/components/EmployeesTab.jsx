import React, { useState } from 'react';

// --- Add Employee Modal ---
function AddEmployeeModal({ isVisible, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Mechanic',
    password: '',
    phone: '',
    shopName: 'Main Garage',
    specialization: '',
    hourlyRate: '',
    experience: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation as needed
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      name: '', email: '', role: 'Mechanic', password: '', phone: '',
      shopName: 'Main Garage', specialization: '', hourlyRate: '', experience: '',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3>➕ Add New Employee</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange}>
                <option value="Mechanic">Mechanic</option>
                <option value="Estimator">Estimator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="shopName">Shop</label>
              <select id="shopName" name="shopName" value={formData.shopName} onChange={handleChange}>
                <option value="Main Garage">Main Garage</option>
                <option value="Second Branch">Second Branch</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="specialization">Specialization (e.g., Brakes, AC)</label>
              <input type="text" id="specialization" name="specialization" value={formData.specialization} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="hourlyRate">Hourly Rate ($)</label>
              <input type="number" id="hourlyRate" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="experience">Experience (Years)</label>
              <input type="number" id="experience" name="experience" value={formData.experience} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="btn-submit">Add Employee</button>
        </form>
      </div>
    </div>
  );
}

// --- Main Employees Tab Component ---
function EmployeesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([
    {
      id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Mechanic',
      phone: '555-0001', shopName: 'Main Garage', specialization: 'Brakes', hourlyRate: 25, experience: 5
    },
    {
      id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Estimator',
      phone: '555-0002', shopName: 'Main Garage', specialization: 'Diagnostics', hourlyRate: 30, experience: 8
    },
  ]);

  const handleAddEmployee = (employeeData) => {
    const newEmployee = { ...employeeData, id: employees.length + 1 };
    setEmployees(prev => [...prev, newEmployee]);
    console.log("New Employee:", newEmployee);
  };

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Employee Management</h3>
        <button className="btn-add-new" onClick={() => setIsModalOpen(true)}>
          + Add New Employee
        </button>
      </div>

      <div className="data-grid">
        {employees.map(emp => (
          <div key={emp.id} className="data-card">
            <div className="data-card-header">
              <h4>{emp.name}</h4>
              <span className="data-card-role">{emp.role}</span>
            </div>
            <div className="data-card-body">
              <p><strong>Email:</strong> {emp.email}</p>
              <p><strong>Phone:</strong> {emp.phone}</p>
              <p><strong>Shop:</strong> {emp.shopName}</p>
              <p><strong>Specialization:</strong> {emp.specialization}</p>
              <p><strong>Rate:</strong> ${emp.hourlyRate}/hr</p>
              <p><strong>Experience:</strong> {emp.experience} years</p>
            </div>
            <div className="data-card-footer">
              <button className="btn-card-action">Edit</button>
              <button className="btn-card-action btn-danger">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <AddEmployeeModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEmployee}
      />
    </div>
  );
}

export default EmployeesTab;