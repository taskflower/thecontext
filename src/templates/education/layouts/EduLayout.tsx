// src/templates/education/layouts/EduLayout.tsx
import React from 'react';
import { LayoutProps } from 'template-registry-module';

const EduLayout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton, 
  onBackClick 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {/* Logo */}
            <div className="mr-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
              <span className="font-bold">EduSprint</span>
            </div>
            
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-600 hover:text-gray-800">
              Moje konto
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-800">
              Pomoc
            </button>
          </div>
        </header>

        {showBackButton && (
          <button
            onClick={onBackClick}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Powrót
          </button>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>EduSprint © 2025 - Aplikacja edukacyjna dla szkół średnich</p>
        </footer>
      </div>
    </div>
  );
};

export default EduLayout;