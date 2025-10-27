import { useState } from 'react';
import './App.css';
import EstimatorDashboard from './components/EstimatorDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import QADashboard from './components/QADashboard';

function App() {
  const [currentView, setCurrentView] = useState('estimator');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentView(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentView('estimator');
  };

  const handleLoginClick = () => {
    setCurrentView('login');
  };

  const handleBackToEstimator = () => {
    setCurrentView('estimator');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const renderContent = () => {
    // Check authenticated views first
    if (isAuthenticated && userRole) {
      switch (userRole) {
        case 'owner':
          return <OwnerDashboard onLogout={handleLogout} />;
        case 'supervisor':
          return <SupervisorDashboard onLogout={handleLogout} />;
        case 'qaqc':
          return <QADashboard onLogout={handleLogout} />;
        default:
          break;
      }
    }

    // Then check for login page
    if (currentView === 'login') {
      return <Login onLogin={handleLogin} onBack={handleBackToEstimator} />;
    }

    // Default to estimator dashboard
    return <EstimatorDashboard onLoginClick={handleLogin} />;
  };

  return (
    <div className="app">
      {renderContent()}
    </div>
  );
}

export default App;