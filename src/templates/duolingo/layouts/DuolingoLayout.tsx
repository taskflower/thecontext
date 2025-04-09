// src/templates/duolingo/layouts/DuolingoLayout.tsx
import React from 'react';
import { LayoutProps } from 'template-registry-module';
import UserDropdown from '@/auth/UserDropdown';

const DuolingoLayout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton, 
  onBackClick 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-500 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold">LanguageLearner</div>
              {showBackButton && (
                <button
                  onClick={onBackClick}
                  className="p-2 rounded-full hover:bg-green-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Streak display */}
              <div className="flex items-center bg-green-600 px-3 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
                </svg>
                <span className="font-semibold">5</span>
              </div>
              
              {/* Points display */}
              <div className="flex items-center bg-yellow-500 px-3 py-1 rounded-full text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="font-semibold">120</span>
              </div>
              
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {title && (
          <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
        )}
        
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-gray-600 text-center">
            &copy; 2025 LanguageLearner. Ucz się języków codziennie!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DuolingoLayout;
