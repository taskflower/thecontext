// src/themes/energygrant/layouts/common/MobileMenu.tsx
import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  darkMode: boolean;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className={`md:hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
      <div className="px-2 pt-2 pb-3 space-y-1">
        <a 
          href="#dashboard" 
          className={`block px-3 py-2 rounded-md text-sm font-medium ${
            darkMode 
              ? 'text-white bg-gray-900' 
              : 'text-gray-900 bg-gray-100'
          }`}
        >
          Dashboard
        </a>
        <a 
          href="#profile" 
          className={`block px-3 py-2 rounded-md text-sm font-medium ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          Profil
        </a>
        <a 
          href="#settings" 
          className={`block px-3 py-2 rounded-md text-sm font-medium ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          Ustawienia
        </a>
      </div>
    </div>
  );
};