import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from '@/hooks/useAuthState';
import { useLanguage } from '@/context/LanguageContext';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuthState();
  const location = useLocation();
  const { currentLang } = useLanguage();

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (!user) {
    return <Navigate to={`/${currentLang}/login`} state={{ from: location }} replace />;
  }

  return children;
}