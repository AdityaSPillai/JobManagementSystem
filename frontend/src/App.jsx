import './App.css';
import EstimatorDashboard from './components/EstimatorDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import DeskEmployeeDashboard from './components/DeskEmployeeDashboard';
import QADashboard from './components/QADashboard';
import useAuth from './context/context';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';

const getRoleDashboard = (userInfo, onLogout) => {
  if (!userInfo?.role) {
      return <Navigate to="/home" replace />;
  }

  switch (userInfo.role) {
    case 'owner':
      return <OwnerDashboard onLogout={onLogout} />;
    case 'supervisor':
      return <SupervisorDashboard onLogout={onLogout} />;
    case 'desk_employee':
      return <DeskEmployeeDashboard onLogout={onLogout} />;
    case 'qa_qc':
      return <QADashboard onLogout={onLogout} />;
    default:
      return <EstimatorDashboard onLoginClick={() => console.log('Authenticated user')} />;
  }
};

function App() {
  const { userInfo, logout, loading, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };
  const handleLogin = (role) => {
    console.log(`Login requested for role: ${role}. Context handles actual login.`);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Routes>
        <Route 
          path="/login" 
          element={<LoginPage/>} 
        />
        
        <Route
          path="/home"
          element={<EstimatorDashboard />}
        />
        
        <Route
          path="/dashboard"
          element={
            isAuthenticated 
              ? getRoleDashboard(userInfo, handleLogout)
              : <Navigate to="/login" replace />
          }
        />

        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;