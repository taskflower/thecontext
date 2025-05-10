// src/auth/AuthWrapper.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import '../_firebase/config'; // Import to ensure Firebase is initialized

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-gray-500">Uwierzytelnianie...</div>
    </div>;
  }

  if (!user) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export default AuthWrapper;