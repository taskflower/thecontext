// src/templates/layouts/SidebarLayout.tsx
import React from 'react';
import UserDropdown from '@/auth/UserDropdown'; 

const SidebarLayout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton, 
  onBackClick 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Flow Builder</h1>
          <UserDropdown />
        </div>
        
        <nav className="space-y-2">
          <a href="/" className="block py-2 px-4 rounded hover:bg-gray-700">Workspaces</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700">Templates</a>
          <a href="#" className="block py-2 px-4 rounded hover:bg-gray-700">Settings</a>
        </nav>
      </div>
      
      <div className="flex-1 p-6">
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

export default SidebarLayout;