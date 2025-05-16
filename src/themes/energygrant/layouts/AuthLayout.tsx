// src/themes/energygrant/layouts/AuthLayout.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from './../common/Footer';
import { useAuth, useDarkMode } from "../utils/ThemeUtils";

interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading, loginWithGoogle } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Automatyczne przekierowanie po zalogowaniu
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Obsługa logowania przez Google
  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  // Renderowanie tylko ekranu logowania (bez Header)
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg overflow-hidden`}>
          <div className={`p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Program Dotacji Energetycznych
              </h2>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Zaloguj się, aby kontynuować
              </p>
            </div>
            
            {/* Uproszczony przycisk logowania Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-md border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white' 
                  : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 mr-3 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                  <span>Logowanie...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  <span>Zaloguj się przez Google</span>
                </>
              )}
            </button>
          </div>
          
          <div className={`px-8 py-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Logując się, akceptujesz nasze <a href="#" className="text-blue-600 hover:underline">Warunki korzystania</a> i <a href="#" className="text-blue-600 hover:underline">Politykę prywatności</a>
            </p>
          </div>
        </div>
      </div>

      {children}
      
      <Footer 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        minimal={true} 
      />
    </div>
  );
};

export default AuthLayout;