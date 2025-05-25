// src/components/UserDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";


const UserDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If not logged in, show login button
  if (!user) {
    return (
      <button
        onClick={() => navigate("/login")}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Login
      </button>
    );
  }

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
          {user.displayName ? user.displayName[0].toUpperCase() : "U"}
        </div>

        <div className="text-left">
          <div className="font-semibold">{user.displayName || user.email}</div>
          {user.availableTokens !== undefined && (
            <div className="text-xs text-gray-600">
              Tokens: {user.availableTokens.toLocaleString()}
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              {user.displayName || "User"}
            </p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            {user.availableTokens !== undefined && (
              <p className="text-sm text-gray-500">
                Tokens: {user.availableTokens.toLocaleString()}
              </p>
            )}
          </div>

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
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