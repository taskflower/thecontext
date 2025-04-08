// src/templates/layouts/DefaultLayout.tsx
import React from 'react';
import { LayoutProps } from '../../lib/templateRegistry';  // Fix the import path

const DefaultLayout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton, 
  onBackClick 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{title}</h1>
            {showBackButton && (
              <button
                onClick={onBackClick}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
            )}
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;