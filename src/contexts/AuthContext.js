import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hardcoded users for demo
const DEMO_USERS = {
  'parent@glorytogod.com': {
    id: 1,
    name: 'Sarah Johnson',
    email: 'parent@glorytogod.com',
    password: 'parent123',
    role: 'parent',
    childName: 'Ethan',
    childAge: 5,
  },
  'admin@glorytogod.com': {
    id: 2,
    name: 'Admin User',
    email: 'admin@glorytogod.com',
    password: 'admin123',
    role: 'admin',
  },
  'employee@glorytogod.com': {
    id: 3,
    name: 'Gabriel Vargas',
    email: 'employee@glorytogod.com',
    password: 'employee123',
    role: 'employee',
    employeeId: 'NUR-65095829',
    jobTitle: 'DON',
    department: 'Nurse',
    hiredAt: '2022-07-18',
  },
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const user = DEMO_USERS[email.toLowerCase()];
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    setIsAuthenticated(true);
    setUserRole(user.role);
    setUserId(String(user.id));
    setUserData(user);
    return user;
  };

  const updateUserData = (updatedUser) => {
    setUserData(updatedUser);
    if (updatedUser.role) {
      setUserRole(updatedUser.role);
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userId,
        userData,
        loading,
        login,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
