// context/context.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "../utils/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserInfo(user);

        if (user.token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error("Invalid user in localStorage", err);
        localStorage.removeItem("userInfo");
      }
    }

    setLoading(false);
  }, []);

  const login = (user) => {
    setUserInfo(user);
    localStorage.setItem("userInfo", JSON.stringify(user));

    if (user.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    }
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem("userInfo");
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...userInfo, ...updatedData };
    setUserInfo(updatedUser);
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));

    if (updatedData.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${updatedData.token}`;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!userInfo?.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}