import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import '../styles/Header.css';
import axios from '../utils/axios.js';
import useAuth from '../context/context.jsx';
import { use } from 'react';


function Header({ userRole = 'Estimator', onLogin, onLogout, showLogin = true, onLoginClick }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [name, setName] = useState('');
  const { userInfo, } = useAuth();

  const navigate = useNavigate();

  const getRoleLabel = (role) => {
    return ROLE_LABEL_MAP[role] || "User";
  };

  const getShop = async () => {
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
    if (onLoginClick) {
      onLoginClick();
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleLogin = (role) => {
    setIsLoginModalOpen(false);
    if (onLogin) {
      onLogin(role);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToHome = () => {
    navigate('/home');
  };

  const ROLE_LABEL_MAP = {
    worker: "Worker",
    qa_qc: "QA/QC",
    supervisor: "Supervisor",
    desk_employee: "Desk Employee",
    owner: "Owner",
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-name-wrapper">
          <h1> {name}</h1>
          <button className="user-btn">
            {getRoleLabel(userRole)}
          </button>
        </div>
        <div className="header-right">
          <span className="datetime">{getCurrentDateTime()}</span>
          <div className="container-user-btn">
            <button className="user-btn" onClick={handleGoToHome}>
              Home
            </button>

            {showLogin ? (
              <button className="user-btn">
                {userRole}
              </button>
            ) : (
              <button className="user-btn" onClick={handleGoToDashboard}>
                Dashboard
              </button>
            )}
          </div>

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