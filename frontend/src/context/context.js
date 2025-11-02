// context/context.js
import { useState, useEffect } from 'react';
import axios from '../utils/axios.js'; // Import YOUR custom axios instance

const useAuth = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserInfo(user);
        // Set authorization header on your custom axios instance
        if (user.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error('Error parsing stored user info:', error);
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  // Function to login/set user
  const login = (user) => {
    setUserInfo(user);
    localStorage.setItem('userInfo', JSON.stringify(user));
    
    // Set authorization header on your custom axios instance
    if (user.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    }
    console.log(axios.defaults.headers)
  };

  // Function to logout/clear user
  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
    // Remove authorization header from your custom axios instance
    delete axios.defaults.headers.common['Authorization'];
  };

  // Function to update user info
  const updateUser = (updatedData) => {
    const updatedUser = { ...userInfo, ...updatedData };
    setUserInfo(updatedUser);
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    
    // Update token if changed
    if (updatedData.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${updatedData.token}`;
    }
  };

  return {
    userInfo,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!userInfo?.token
  };
};

export default useAuth;