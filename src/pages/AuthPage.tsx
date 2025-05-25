// src/pages/AuthPage.tsx
import React from 'react';
import { useAuthContext } from '../auth/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const { signInWithGoogle, user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Błąd logowania:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl mb-6 text-center">Zaloguj się</h2>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          <img
            src="/google-logo.png"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Zaloguj przez Google
        </button>
      </div>
    </div>
  );
}
