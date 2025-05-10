// src/auth/AuthContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import useAuth, { AuthHook } from './useAuth';


// Create the context
const AuthContext = createContext<AuthHook | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuthContext = (): AuthHook => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};