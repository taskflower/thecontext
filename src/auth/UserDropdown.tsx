// src/auth/UserDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export const UserDropdown: React.FC<{ 
  onLogin?: () => void, 
  onLogout?: () => void 
}> = ({ 
  onLogin = () => window.location.href = '/login', 
  onLogout = () => window.location.href = '/login' 
}) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // If not logged in, show login button
  if (!user) {
    return (
      <button 
        onClick={onLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Login
      </button>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt="User profile" 
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600">
              {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </span>
          </div>
        )}
        <span className="hidden md:inline">
          {user.displayName || user.email}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-3">
            <p className="text-sm text-gray-900">
              {user.displayName || 'User'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user.email}
            </p>
          </div>
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;