// src/components/UserDropdown.tsx - Simplified with correct lazy loading
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";

// Direct lazy import of the component
const AppTreeCard = React.lazy(() => import('../modules/appTree/AppTreeCard'));

const UserDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { config } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [showAppTree, setShowAppTree] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Zamknij dropdown po kliknięciu poza
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when app tree opens
  const handleOpenAppTree = () => {
    setIsOpen(false);
    setShowAppTree(true);
  };

  const handleCloseAppTree = () => {
    setShowAppTree(false);
  };

  if (!user) {
    return (
      <button
        onClick={() => navigate("/login")}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Login
      </button>
    );
  }

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
    navigate("/login");
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(o => !o)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
            {user.displayName?.[0].toUpperCase() || "U"}
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-zinc-200">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-zinc-100">
              <p className="font-semibold">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            {/* Navigation Options */}
            <div className="py-1">
              <button
                onClick={handleOpenAppTree}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
              >
                <span className="text-lg">🌳</span>
                <div>
                  <div className="font-medium text-sm">Application Tree</div>
                  <div className="text-xs text-gray-500">Browse workspaces & scenarios</div>
                </div>
              </button>
              
              <div className="border-t border-zinc-100 my-1"></div>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3"
              >
                <span className="text-lg">🚪</span>
                <span className="font-medium text-sm">Wyloguj</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* App Tree Modal */}
      {showAppTree && (
        <Suspense fallback={
          <></>
        }>
          <AppTreeCard 
            onClose={handleCloseAppTree}
            configName={config || 'exampleTicketApp'}
          />
        </Suspense>
      )}
    </>
  );
};

export default UserDropdown;