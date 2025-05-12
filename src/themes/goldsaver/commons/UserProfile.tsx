// src/themes/goldsaver/components/common/UserProfile.tsx
import React, { useState } from "react";
import { Settings, LogOut, ChevronDown } from "lucide-react";

interface UserProfileProps {
  name: string;
  email: string;
  onLogout: () => void;
  onSettings: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  name,
  email,
  onLogout,
  onSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-1 py-1 bg-white rounded-lg border border-gray-200 shadow-lg">
          <button
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              onSettings();
              setIsOpen(false);
            }}
          >
            <Settings className="w-4 h-4 mr-2 text-gray-500" />
            <span>Ustawienia</span>
          </button>

          <button
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
          >
            <LogOut className="w-4 h-4 mr-2 text-gray-500" />
            <span>Wyloguj</span>
          </button>
        </div>
      )}
    </div>
  );
};