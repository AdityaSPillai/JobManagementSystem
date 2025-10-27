import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import '../styles/Header.css';

function Header({ userRole = 'Estimator', onLogin, onLogout, showLogin = true, onLoginClick }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

  return (
    <>
      <header className="dashboard-header">
        <h1>AutoCare WorkShop</h1>
        <div className="header-right">
          <span className="datetime">{getCurrentDateTime()}</span>
          <div className="user-dropdown">
            <button className="user-btn">{userRole}</button>
          </div>
          {showLogin ? (
            <button className="login-btn" onClick={handleLoginClick}>
              Login
            </button>
          ) : (
            <button className="login-btn logout-btn" onClick={onLogout}>
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