// src/themes/energygrant/layouts/common/Footer.tsx
import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
  toggleDarkMode?: () => void;
  minimal?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ darkMode, toggleDarkMode, minimal = false }) => {
  return (
    <footer className={`py-4 text-center text-xs ${darkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-200'} ${!minimal ? 'border-t' : ''}`}>
      {toggleDarkMode && minimal && (
        <div className="flex justify-center mb-2">
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      )}
      © 2025 Program Dotacji Energetycznych. Wszystkie prawa zastrzeżone.
    </footer>
  );
};