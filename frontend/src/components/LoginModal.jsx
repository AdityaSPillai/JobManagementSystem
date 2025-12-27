import { useState } from 'react';
import '../styles/LoginModal.css';
import axios from "../utils/axios.js";
import useAuth from '../context/context.jsx';
import { useNavigate } from 'react-router-dom';


function LoginModal({ isOpen, onClose, onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [Mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [regFormData, setRegFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!Mail || !password) {
      setError('Please enter Mail and password');
      return;
    }

    try {
      const response = await axios.post('/auth/login', {
        email: Mail,
        password: password,
      });
      console.log(response.data)
      if (!response.data.success) {
        setError(response.data.message || 'Login failed. Please try again.');
        console.log('Login Error:', response.data.message);
      } else {

        login({
          id: response.data.user._id || response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          phone: response.data.user.phone,
          ...(response.data.user?.shopId && { shopId: response.data.user.shopId }),
          token: response.data.token
        });

        console.log('Logged in User:', response.data.user);
        if (onLogin) {
          onLogin(response.data.user.role);
        }

        // close modal UI
        handleClose();
      }
    } catch (error) {
      console.error('Login Error:', error);
      setError(error.response?.data?.message || 'An error occurred during login. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const { name, email, password, phone } = regFormData;

      if (!name || !email || !password || !phone) {
        setError('Please fill in all registration fields');
        return;
      }
      const ownerData = {
        name,
        email,
        password,
        role: "owner",
        phone
      };
      const response = await axios.post('/auth/signup', ownerData);

      if (!response.data.success) {
        setError(response.data.message || 'Registration failed. Please try again.');
        console.log('Registration Error:', response.data.message);
      } else {
        login({
          id: response.data.user._id || response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          phone: response.data.user.phone,
          token: response.data.token
        });

        console.log('Registered and logged in:', response.data.user);

        if (onLogin) {
          onLogin(response.data.user.role);
        }
        setIsRegisterMode(false);
        handleClose();
      }
    } catch (error) {
      console.error('Registration Error:', error);
      setError(error.response?.data?.message || 'An error occurred during registration. Please try again.');
    }
  };

  const handleRegFormChange = (e) => {
    const { name, value } = e.target;
    setRegFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setMail('');
    setPassword('');
    setRegFormData({ name: '', email: '', password: '', phone: '' });
    setError('');
    setIsRegisterMode(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <h1 className="modal-title-login">{isRegisterMode ? 'Register as Owner' : 'Login Portal'}</h1>
        {error && <div className="error-message">{error}</div>}
        {isRegisterMode ? (
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
            <button type="submit" className="btn-login">Register</button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Mail</label>
              <input type="text" value={Mail} onChange={(e) => setMail(e.target.value)} className="form-control" placeholder="Enter Mail" autoFocus />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" placeholder="Enter password" />
            </div>
            <button type="submit" className="btn-login">
              Login
            </button>
          </form>
        )}

        {!isRegisterMode ? (
          <>
            <p className="toggle-mode-hint">
              Don't have an account?{' '}
              <span onClick={() => setIsRegisterMode(true)}>Register as Owner</span>
            </p>
          </>
        ) : (
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