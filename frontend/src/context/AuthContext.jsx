import React, { useState, useContext } from "react";

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("HealthUP");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isLogin = !!user;

  const value = { user, setUser, isLogin };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);