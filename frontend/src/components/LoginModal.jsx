import { useState } from 'react';
import '../styles/LoginModal.css';
import axios from "../utils/axios.js";
import useAuth from '../context/context.js';

function LoginModal({ isOpen, onClose, onLogin }) {
  // --- New State ---
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // --- Existing State ---
  const [selectedRole, setSelectedRole] = useState('owner');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // --- useAuth Hook ---
  const { login } = useAuth();

  // --- New State for Registration Form ---
  const [regFormData, setRegFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopname: ''
  });

  // --- Login Submit Handler ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    try {
      const response = await axios.post('/auth/login', {
        email: username,
        password: password,
      });

              console.log(response.data)

      if (!response.data.success) {
        setError(response.data.message || 'Login failed. Please try again.');
        console.log('Login Error:', response.data.message);
      } else {
        // Use the useAuth login function to set user info and token
        
        login({
          id: response.data.user._id || response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          phone: response.data.user.phone,
          shopname: response.data.user.shopname,
          
           ...(response.data.user?.shopId && { shopId: response.data.user.shopId }),

          token: response.data.token
        });

        console.log('Logged in User:', response.data.user);
        window.location.reload();

        // Call parent callback with user role
        if (onLogin) {
          onLogin(response.data.user.role);
        }

        handleClose();
      }
    } catch (error) {
      console.error('Login Error:', error);
      setError(error.response?.data?.message || 'An error occurred during login. Please try again.');
    }
  };

  // --- New: Registration Submit Handler ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const { name, email, password, phone, shopname } = regFormData;

      if (!name || !email || !password || !phone || !shopname) {
        setError('Please fill in all registration fields');
        return;
      }

      const ownerData = {
        name,
        email,
        password,
        role: "owner",
        phone,
        shopname
      };

      const response = await axios.post('/auth/signup', ownerData);
      
      if (!response.data.success) {
        setError(response.data.message || 'Registration failed. Please try again.');
        console.log('Registration Error:', response.data.message);
      } else {
        // Auto-login after successful registration
        login({
          id: response.data.user._id || response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          phone: response.data.user.phone,
          shopname: response.data.user.shopname,
          token: response.data.token
        });

        console.log('Registered and logged in:', response.data.user);
        
        if (onLogin) {
          onLogin(response.data.user.role);
        }

        // Reset and close
        setIsRegisterMode(false);
        handleClose();
      }
    } catch (error) {
      console.error('Registration Error:', error);
      setError(error.response?.data?.message || 'An error occurred during registration. Please try again.');
    }
  };

  // --- New: Registration Form Change Handler ---
  const handleRegFormChange = (e) => {
    const { name, value } = e.target;
    setRegFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- New: Handle Role Selection (to reset mode) ---
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role !== 'owner') {
      setIsRegisterMode(false); // Only owners can register
    }
    setError('');
    setUsername('');
    setPassword('');
    setRegFormData({ name: '', email: '', password: '', phone: '', shopname: '' });
  };

  // --- Updated: handleClose to reset all state ---
  const handleClose = () => {
    setUsername('');
    setPassword('');
    setRegFormData({ name: '', email: '', password: '', phone: '', shopname: '' });
    setError('');
    setIsRegisterMode(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <h2>{isRegisterMode ? 'Register as Owner' : 'Login to AutoCare WorkShop'}</h2>
        
        <div className="role-tabs">
          <button
            className={`role-tab ${selectedRole === 'owner' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('owner')}
          >
            Owner
          </button>
          <button
            className={`role-tab ${selectedRole === 'supervisor' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('supervisor')}
          >
            Supervisor
          </button>
          <button
            className={`role-tab ${selectedRole === 'qaqc' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('qaqc')}
          >
            QA/QC
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isRegisterMode ? (
          // --- REGISTRATION FORM ---
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={regFormData.name} onChange={handleRegFormChange} className="form-control" placeholder="Enter your full name" autoFocus required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={regFormData.email} onChange={handleRegFormChange} className="form-control" placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={regFormData.password} onChange={handleRegFormChange} className="form-control" placeholder="Enter a password" required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={regFormData.phone} onChange={handleRegFormChange} className="form-control" placeholder="Enter your phone number" required />
            </div>
            <div className="form-group">
              <label>Shop Name</label>
              <input type="text" name="shopname" value={regFormData.shopname} onChange={handleRegFormChange} className="form-control" placeholder="Enter your shop name" required />
            </div>
            <button type="submit" className="btn-login">Register</button>
          </form>
        ) : (
          // --- LOGIN FORM ---
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control" placeholder="Enter username" autoFocus />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" placeholder="Enter password" />
            </div>
            <button type="submit" className="btn-login">
              Login as {selectedRole === 'owner' ? 'Owner' : selectedRole === 'supervisor' ? 'Supervisor' : 'QA/QC'}
            </button>
          </form>
        )}

        {/* --- Conditional Hint/Toggle --- */}
        {!isRegisterMode ? (
          // In Login Mode
          <>
            <p className="demo-hint">Use username: <strong>demo</strong> and password: <strong>demo</strong></p>
            {selectedRole === 'owner' && (
              <p className="toggle-mode-hint">
                Don't have an account?{' '}
                <span onClick={() => setIsRegisterMode(true)}>Register as Owner</span>
              </p>
            )}
          </>
        ) : (
          // In Register Mode
          <p className="toggle-mode-hint">
            Already have an account?{' '}
            <span onClick={() => setIsRegisterMode(false)}>Login here</span>
          </p>
        )}

      </div>
    </div>
  );
}

export default LoginModal;