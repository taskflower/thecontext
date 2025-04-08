// src/templates/newyork/layouts/MainLayout.tsx
import UserDropdown from '@/auth/UserDropdown';
import React from 'react';
import { LayoutProps } from 'template-registry-module';

const MainLayout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton, 
  onBackClick 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold tracking-tight">Flow Builder</h1>
            <nav className="flex space-x-4">
              <a href="/" className="px-3 py-2 text-sm font-medium hover:text-gray-300">Dashboard</a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:text-gray-300">Templates</a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:text-gray-300">Settings</a>
              <UserDropdown />
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        {title && (
          <div className="mb-8 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={onBackClick}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              )}
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-4">
          <p className="text-sm text-gray-600 text-center">
            &copy; 2025 Flow Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;