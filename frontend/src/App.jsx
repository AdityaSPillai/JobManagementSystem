import { useEffect, useState } from 'react';
import './App.css';
import EstimatorDashboard from './components/EstimatorDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import QADashboard from './components/QADashboard';
import useAuth from './context/context';
import { Routes, Route, useLocation } from 'react-router-dom';


function App() {
  const [currentView, setCurrentView] = useState('estimator');
  const { userInfo, logout, loading } = useAuth(); // Destructure properly
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync authentication state when userInfo changes
  useEffect(() => {
    if (userInfo?.role) {
      setIsAuthenticated(true);
      setCurrentView(userInfo.role);
    } else {
      setIsAuthenticated(false);
      setCurrentView('estimator');
    }
  }, [userInfo]);

  const handleLogin = (role) => {
    // Login is already handled by LoginModal using useAuth
    // Just update the view
    setIsAuthenticated(true);
    setCurrentView(role);
  };

  const handleLogout = () => {
    logout(); // This clears userInfo, localStorage, and axios headers
    setIsAuthenticated(false);
    setCurrentView('estimator');
  };

  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleBackToEstimator = () => {
    setCurrentView('estimator');
  };

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const renderContent = () => {
    // Check authenticated views first
    if (isAuthenticated && userInfo?.role) {
      switch (userInfo.role) {
        case 'owner':
          return <OwnerDashboard onLogout={handleLogout} />;
        case 'supervisor':
          return <SupervisorDashboard onLogout={handleLogout} />;
        case 'qa_qc':
          return <QADashboard onLogout={handleLogout} />;
        default:
          return <EstimatorDashboard onLoginClick={handleLogin} />;
      }
    }

    // Default to estimator dashboard (has login modal in header)
    return <EstimatorDashboard onLoginClick={handleLogin} />;
  };

  return (
    <>
    <Routes>
            <Route path="/home" element={<EstimatorDashboard/>}/>
            </Routes>
    

    <div className="app">
      {renderContent()}
    </div>
    </>
  );
}

export default App;