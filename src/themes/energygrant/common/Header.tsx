// src/themes/energygrant/layouts/common/Header.tsx
import React from 'react';
import { Bell, Moon, Sun, User, LogOut, X, Menu } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  picture?: string;
  role?: string;
}

interface HeaderProps {
  user: UserProfile | null;
  darkMode: boolean;
  toggleDarkMode: () => void;
  logout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  darkMode,
  toggleDarkMode,
  logout,
  mobileMenuOpen,
  setMobileMenuOpen,
  dropdownOpen,
  setDropdownOpen
}) => {
  if (!user) return null;

  return (
    <header className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo i tytuł */}
          <div className="flex items-center">
            <button 
              className="md:hidden mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-green-700'}`}>
              Program Dotacji Energetycznych
            </div>
          </div>
          
          {/* Przyciski po prawej */}
          <div className="flex items-center space-x-4">
            <button className={`p-1.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              <Bell size={16} />
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2"
              >
                <div className={`bg-gradient-to-br from-green-400 to-blue-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-medium`}>
                  {user.name.charAt(0)}
                </div>
                <span className={`hidden md:block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {user.name}
                </span>
              </button>
              
              {dropdownOpen && (
                <div 
                  className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
                    darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="px-4 py-2 border-b border-gray-200 mb-1">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                    <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                  </div>
                  
                  <a 
                    href="#profile"
                    className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="flex items-center">
                      <User size={16} className="mr-2" />
                      Profil
                    </div>
                  </a>
                  
                  <button 
                    onClick={toggleDarkMode}
                    className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center">
                      {darkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                      {darkMode ? 'Tryb jasny' : 'Tryb ciemny'}
                    </div>
                  </button>
                  
                  <button 
                    onClick={logout}
                    className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center">
                      <LogOut size={16} className="mr-2" />
                      Wyloguj się
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};