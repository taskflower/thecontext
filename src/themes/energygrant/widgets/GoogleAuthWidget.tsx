// src/themes/energygrant/common/LoginForm.tsx
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: () => void;
  loading: boolean;
  darkMode: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading, darkMode }) => {
  const [activeTab, setActiveTab] = useState<'email' | 'password'>('email');
  
  return (
    <div className="p-8 space-y-6">
      {/* Form Container */}
      <div>
        {/* Tabs for login options */}
        <div className="flex space-x-1 p-1 mb-6 rounded-lg bg-opacity-50 w-full max-w-xs mx-auto">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 
            ${activeTab === 'email' 
              ? darkMode 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'bg-white text-zinc-900 shadow-sm' 
              : darkMode 
                ? 'text-zinc-400 hover:text-zinc-300' 
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200
            ${activeTab === 'password' 
              ? darkMode 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'bg-white text-zinc-900 shadow-sm' 
              : darkMode 
                ? 'text-zinc-400 hover:text-zinc-300' 
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Hasło
          </button>
        </div>
        
        {/* Login Form Content */}
        <div className="space-y-4">
          {activeTab === 'email' ? (
            <>
              <div>
                <label 
                  htmlFor="email" 
                  className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    className={`block w-full rounded-md py-2.5 px-3 border ${
                      darkMode 
                        ? 'bg-zinc-800 border-zinc-700 text-white focus:border-emerald-500' 
                        : 'bg-white border-zinc-300 text-zinc-900 focus:border-emerald-500'
                    } focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors`}
                    placeholder="twoj@email.pl"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <button
                  onClick={onLogin}
                  disabled={loading}
                  className={`w-full flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-medium transition-colors
                  ${darkMode 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    darkMode ? 'focus:ring-offset-zinc-900' : 'focus:ring-offset-white'
                  } focus:ring-emerald-500`}
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Kontynuuj z Email
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label 
                  htmlFor="login" 
                  className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}
                >
                  Login
                </label>
                <input
                  type="text"
                  id="login"
                  className={`block w-full rounded-md py-2.5 px-3 border ${
                    darkMode 
                      ? 'bg-zinc-800 border-zinc-700 text-white focus:border-emerald-500' 
                      : 'bg-white border-zinc-300 text-zinc-900 focus:border-emerald-500'
                  } focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors`}
                  placeholder="Twój login"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label 
                    htmlFor="password" 
                    className={`block text-sm font-medium ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}
                  >
                    Hasło
                  </label>
                  <a 
                    href="#" 
                    className="text-xs text-emerald-600 hover:text-emerald-500"
                  >
                    Zapomniałeś hasła?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    className={`block w-full rounded-md py-2.5 px-3 border ${
                      darkMode 
                        ? 'bg-zinc-800 border-zinc-700 text-white focus:border-emerald-500' 
                        : 'bg-white border-zinc-300 text-zinc-900 focus:border-emerald-500'
                    } focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors`}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <button
                  onClick={onLogin}
                  disabled={loading}
                  className={`w-full flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-medium transition-colors
                  ${darkMode 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    darkMode ? 'focus:ring-offset-zinc-900' : 'focus:ring-offset-white'
                  } focus:ring-emerald-500`}
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  Zaloguj się
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Alternative login options */}
      <div className="pt-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className={`px-2 ${darkMode ? 'bg-zinc-900 text-zinc-500' : 'bg-white text-zinc-500'}`}>
              inne opcje logowania
            </span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button 
            className={`flex items-center justify-center py-2.5 px-4 rounded-md border text-sm font-medium transition-colors ${
              darkMode 
                ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white' 
                : 'bg-white border-zinc-300 hover:bg-zinc-50 text-zinc-700'
            } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button 
            className={`flex items-center justify-center py-2.5 px-4 rounded-md border text-sm font-medium transition-colors ${
              darkMode 
                ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white' 
                : 'bg-white border-zinc-300 hover:bg-zinc-50 text-zinc-700'
            } focus:outline-none focus:ring-1 focus:ring-emerald-500`}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0014.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
            </svg>
            Facebook
          </button>
        </div>
      </div>
    </div>
  );
};