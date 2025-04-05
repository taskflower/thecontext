/**
 * Default Header Component
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
    <div className={`bg-gray-800 text-white p-4 ${className}`}>
      <div className="flex items-center">
        {onBack && (
          <button 
            onClick={onBack}
            className="mr-3 text-gray-300 hover:text-white flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="ml-1">Back</span>
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-gray-300 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;