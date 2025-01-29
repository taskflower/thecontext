// src/auth/RequireAuth.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuthState();
  const location = useLocation();

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}