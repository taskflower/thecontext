// src/themes/energygrant/common/LoginForm.tsx
import React from 'react';


interface LoginFormProps {
  onLogin: () => void;
  loading: boolean;
  darkMode: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading, darkMode }) => {
  return (
    <div className="space-y-6">
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className={`px-2 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
            lub kontynuuj z
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white' 
              : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          Email
        </button>
        <button 
          className={`py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white' 
              : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          Login i hasło
        </button>
      </div>
    </div>
  );
};