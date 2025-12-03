import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import LoginModal from './LoginModal';
import '../styles/Header.css';
import axios from '../utils/axios.js';
import useAuth from '../context/context.jsx';
import { use } from 'react';


function Header({ userRole = 'Estimator', onLogin, onLogout, showLogin = true, onLoginClick }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const[name, setName] = useState('');
    const {userInfo, } = useAuth();
  
  
  const navigate = useNavigate(); // Initialize useNavigate

const getShop=async () => {
    try {
      const response = await axios.get(`/shop/getShopName/${userInfo.shopId}`);  
      setName(response.data.shopName);
    } catch (error) {
      console.error('Error fetching shop name:', error);
    }
  }


  useEffect(() => {
    getShop();
  }, [userInfo.shopId]);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getCurrentDateTime = () => {
    return currentTime.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleLoginClick = () => {
    // If parent provided onLoginClick (for old Login page flow), use it
    if (onLoginClick) {
      onLoginClick();
    } else {
      // Otherwise open the modal
      setIsLoginModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLogin = (role) => {
    setIsLoginModalOpen(false);
    // Call the onLogin prop passed from parent (App.jsx)
    if (onLogin) {
      onLogin(role);
    }
  };
  
  // New handler for navigating to Dashboard
  const handleGoToDashboard = () => {
      navigate('/dashboard');
  };

  // New handler for navigating to Home
  const handleGoToHome = () => {
      navigate('/home');
  };

  return (
    <>
      <header className="dashboard-header">
        <h1> {name}</h1>
        <div className="header-right">
          <span className="datetime">{getCurrentDateTime()}</span>
          <div className="container-user-btn">
            {/* Home button always navigates to /home */}
            <button className="user-btn" onClick={handleGoToHome}>
              Home
            </button>
            
            {/* Conditionally render user button's action */}
            {showLogin ? (
              // Not logged in: Button is just text, no navigation
              <button className="user-btn"> 
                {userRole}
              </button>
            ) : (
              // Logged in: Button navigates to /dashboard
              <button className="user-btn" onClick={handleGoToDashboard}> 
                {userRole}
              </button>
            )}
          </div>
          
          {/* Conditionally render Login or Logout button */}
          {showLogin ? (
            <button className="login-btn" onClick={handleLoginClick}>
              Login
            </button>
          ) : (
            <button
              className="login-btn logout-btn"
              onClick={() => {
                if (onLogout) onLogout();
                navigate("/login", { replace: true });
              }}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={handleCloseModal}
        onLogin={handleLogin}
      />
    </>
  );
}

export default Header;