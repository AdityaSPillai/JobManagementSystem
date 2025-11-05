import React, { useState, useEffect } from 'react';
import axios from '../utils/axios.js';
import useAuth from '../context/context.js';

// --- Add Employee Modal ---
function AddEmployeeModal({ isVisible, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'worker',
    password: '',
    phone: '',
    shopname: '',
    specialization: '',
    hourlyRate: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { userInfo } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || 
        !formData.hourlyRate || !formData.experience) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.role !== 'worker' && !formData.password) {
      setError("Password is required for this role.");
      return;
    }

    if (formData.role !== 'desk_employee' && !formData.specialization) {
      setError("Specialization is required for this role.");
      return;
    }

    const employeeData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      phone: formData.phone,
      shopId: userInfo?.shopId,
      specialization: formData.specialization,
      hourlyRate: formData.hourlyRate,
      experience: formData.experience,
    };

    if (formData.password) {
      employeeData.password = formData.password;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post('/employee/createEmployee', employeeData);
      
      if (!response.data.success) {
        setError(response.data.message || "Error while adding new employee");
        return;
      }

      alert("Employee added successfully!");
      
      if (onSubmit) {
        onSubmit(response.data.worker || employeeData);
      }
      
      setFormData({
        name: '',
        email: '',
        role: 'worker',
        password: '',
        phone: '',
        shopname: '',
        specialization: '',
        hourlyRate: '',
        experience: '',
      });
      onClose();
      
    } catch (error) {
      console.error('Employee Creation Error:', error);
      setError(error.response?.data?.message || "An error occurred while creating the employee.");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3>➕ Add New Employee</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password {formData.role !== 'worker' && '*'}</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required={formData.role !== 'worker'}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select 
                id="role" 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                disabled={loading}
              >
                <option value="worker">Worker</option>
                <option value="supervisor">Supervisor</option>
                <option value="qa_qc">QA/QC</option>
                <option value="desk_employee">Desk Employee</option>
              </select>
            </div>
            
            <div className="form-group">
              {/* <label htmlFor="specialization">Specialization {formData.role !== 'desk_employee' && '*'}</label> 
               <input 
                type="text" 
                id="specialization" 
                name="specialization" 
                value={formData.specialization} 
                onChange={handleChange}
                placeholder="e.g., Brakes, AC, Engine"
                required={formData.role !== 'desk_employee'}
                disabled={loading}
              /> */}

                       <label htmlFor="role">Specilaization </label>
              <select 
                id="specialization" 
                name="specialization" 
                value={formData.specialization} 
                onChange={handleChange}
                disabled={loading}
              >
                <option value="mechanic">mechanic</option>
                <option value="electrician">electrician</option>
                <option value="bodywork">bodywork</option>
                <option value="painter">painter</option>
                <option value="general">general</option>
              

              </select>
            </div>
            <div className="form-group">
              <label htmlFor="hourlyRate">Hourly Rate ($) *</label>
              <input 
                type="number" 
                id="hourlyRate" 
                name="hourlyRate" 
                value={formData.hourlyRate} 
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="experience">Experience (Years) *</label>
              <input 
                type="number" 
                id="experience" 
                name="experience" 
                value={formData.experience} 
                onChange={handleChange}
                min="0"
                required
                disabled={loading}
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Adding Employee...' : 'Add Employee'}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditEmployeeModal({ isVisible, onClose, employee, onUpdate }) {
  const [formData, setFormData] = useState(employee || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(employee || {});
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee?._id) {
      alert('Invalid employee data.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(`/employee/updateEmployee/${employee._id}`, formData);
      
      if (response.data.success) {
        alert('✅ Employee updated successfully');
        onUpdate(); 
        onClose();
      } else {
        setError(response.data.message || 'Failed to update employee');
      }
    } catch (err) {
      console.error('❌ Error updating employee:', err);
      setError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <div className="modal-header-left">
            <h3>✏️ Edit Employee</h3>
          </div>
          <div className="modal-header-right">
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid cols-2">
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              {/* <label>Specialization</label>
                <input 
                type="text" 
                id="specialization" 
                name="specialization" 
                value={formData.specialization|| ''}  onChange={handleChange} placeholder="e.g., Brakes, AC, Engine"
                required={formData.role !== 'desk_employee'}
                disabled={loading}
              /> */}
               <label htmlFor="role">Specilaization </label>
              <select 
                id="specialization" 
                name="specialization" 
                value={formData.specialization} 
                onChange={handleChange}
                disabled={loading}
              >
                <option value="mechanic">mechanic</option>
                <option value="electrician">electrician</option>
                <option value="bodywork">bodywork</option>
                <option value="painter">painter</option>
                <option value="general">general</option>
              

              </select>
            </div>
            <div className="form-group">
              <label>Hourly Rate</label>
              <input type="number" name="hourlyRate" value={formData.hourlyRate || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Experience (Years)</label>
              <input type="number" name="experience" value={formData.experience || ''} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              
              <select 
                id="role" 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                disabled={loading}
              >
                <option value="worker">Worker</option>
                <option value="supervisor">Supervisor</option>
                <option value="qa_qc">QA/QC</option>
                <option value="desk_employee">Desk Employee</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Employee'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Main Employees Tab Component ---
function EmployeesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const { userInfo } = useAuth();

  // Fetch all employees on component mount
  useEffect(() => {
    fetchEmployees();

  }, [userInfo]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');

      // Get shopId from userInfo
      const shopId = userInfo?.shopId;
      
      if (!shopId) {
        setError("Shop ID not found. Please make sure you're logged in.");
        setLoading(false);
        return;
      }

       const response = await axios.get(`/shop/getAllEmployees/${shopId}`);
    const users = response.data?.users || [];

    if (users.length === 0) {
      setError("No employee list found");
      return;
    }

    setEmployees(users);
  } catch (error) {
    console.error('Error fetching employees:', error);
    setError(error.response?.data?.message || "Failed to fetch employees.");
  } finally {
    setLoading(false);
  }
};

  const handleAddEmployee = (employeeData) => {
    // Refresh the employee list after adding
    fetchEmployees();
    console.log("New Employee:", employeeData);
  };

  const handleDeleteEmployee = async (employeeId) => {
  if (!window.confirm("Are you sure you want to remove this employee?")) return;

  try {
    const response = await axios.delete(`/auth/deleteEmployee/${employeeId}`);

    if (response.data.success) {
      alert("✅ Employee deleted successfully!");
      fetchEmployees(); // refresh list
    } else {
      alert(response.data.message || "Failed to delete employee.");
    }
  } catch (error) {
    console.error("❌ Error deleting employee:", error);
    alert(error.response?.data?.message || "Failed to delete employee.");
  }
};

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading employees...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="tab-header">
        <h3 className="section-title">Employee Management</h3>
        <button className="btn-add-new" onClick={() => setIsModalOpen(true)}>
          + Add New Employee
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {employees.length === 0 ? (
        <div className="placeholder-content">
          <p>No employees found. Add your first employee to get started!</p>
        </div>
      ) : (
        <div className="data-grid">
          {employees.map(emp => (
            <div key={emp._id} className="data-card">
              <div className="data-card-header">
                <h4>{emp.name}</h4>
                <span className="data-card-role">{emp.role}</span>
              </div>
              <div className="data-card-body">
                <p><strong>Email:</strong> {emp.email}</p>
                <p><strong>Phone:</strong> {emp.phone}</p>
                {emp.specialization && (
                  <p><strong>Specialization:</strong> {emp.specialization}</p>
                )}
                {emp.hourlyRate && (
                  <p><strong>Rate:</strong> ${emp.hourlyRate}/hr</p>
                )}
                {emp.experience && (
                  <p><strong>Experience:</strong> {emp.experience} years</p>
                )}
              </div>
              <div className="data-card-footer">
                <button 
                  className="btn-card-action"
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setIsEditModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button className="btn-card-action btn-danger" onClick={() => handleDeleteEmployee(emp._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEmployeeModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEmployee}
      />
      <EditEmployeeModal
        isVisible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={selectedEmployee}
        onUpdate={fetchEmployees}
      />
    </div>
  );
}

export default EmployeesTab;