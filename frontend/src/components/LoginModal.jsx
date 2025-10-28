import { useState } from 'react';
import '../styles/LoginModal.css';

function LoginModal({ isOpen, onClose, onLogin }) {
  // --- New State ---
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // --- Existing State ---
  const [selectedRole, setSelectedRole] = useState('owner');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- New State for Registration Form ---
  const [regFormData, setRegFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopname: ''
  });

  // --- Login Submit Handler ---
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    if (username === 'demo' && password === 'demo') {
      onLogin(selectedRole);
      handleClose();
    } else {
      setError('Invalid credentials. Use demo/demo');
    }
  };

  // --- New: Registration Submit Handler ---
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    const { name, email, password, phone, shopname } = regFormData;

    if (!name || !email || !password || !phone || !shopname) {
      setError('Please fill in all registration fields');
      return;
    }

    // In a real app, you would make an API call here.
    // For this demo, we'll just log it and show an alert.
    console.log('Registering New Owner:', {
      ...regFormData,
      role: 'owner' // Role is fixed for registration
    });

    alert('Registration successful! You can now log in using the demo credentials.');
    
    // Reset and go back to login mode
    setIsRegisterMode(false);
    handleClose();
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
            {selectedRole === 'owner' && (
              <p className="toggle-mode-hint">
                Don't have an account?{' '}
                <span onClick={() => setIsRegisterMode(true)}>Register as Owner</span>
              </p>
            )}
            {selectedRole === 'supervisor' && (
              <p className="toggle-mode-hint">
                Don't have an account? Ask Admin to register.
              </p>
            )}
            {selectedRole === 'qaqc' && (
              <p className="toggle-mode-hint">
                Don't have an account? Ask Admin to register.
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