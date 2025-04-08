// src/components/AuthWrapper.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

