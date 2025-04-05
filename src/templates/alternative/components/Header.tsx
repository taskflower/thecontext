/**
 * Alternative Header Component
 */
import React from 'react';
import { HeaderProps } from '../../types';

const Header: React.FC<HeaderProps> = ({ 
  title, 
  description, 
  onBack,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 ${className}`}>
      <div className="flex items-center">
        {onBack && (
          <button 
            onClick={onBack}
            className="mr-4 text-white/80 hover:text-white flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-white/80 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;