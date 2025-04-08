// src/templates/layouts/DefaultLayout.tsx
import React from 'react';
import { LayoutProps } from 'template-registry-module';
import UserDropdown from '@/auth/UserDropdown';  // Import UserDropdown

const DefaultLayout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton, 
  onBackClick 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        {/* Add header with UserDropdown */}
        <header className="flex justify-between items-center mb-4">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          <div className="ml-auto">
            <UserDropdown />
          </div>
        </header>

        {showBackButton && (
          <button
            onClick={onBackClick}
            className="text-sm text-gray-600 hover:text-gray-800 mb-4"
          >
            Back
          </button>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;