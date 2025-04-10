// src/templates/newyork/layouts/MainLayout.tsx
import React from 'react';
import { LayoutProps } from 'template-registry-module';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../lib/store';

const MainLayout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton, 
  onBackClick 
}) => {
  const navigate = useNavigate();
  const { workspaces } = useAppStore();
  const activeWorkspace = workspaces.length > 0 ? workspaces[0] : null;

  const handleNavigateBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - streamlined and lighter */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-lg font-medium text-gray-900">Flow Builder</Link>
            <nav className="flex space-x-2">
              <Link to="/" className="px-3 py-2 text-sm text-gray-700 hover:text-black rounded-md transition-colors">
                Dashboard
              </Link>
              {activeWorkspace && (
                <Link 
                  to={`/${activeWorkspace.id}`} 
                  className="px-3 py-2 text-sm text-gray-700 hover:text-black rounded-md transition-colors"
                >
                  Scenarios
                </Link>
              )}
              <Link to="/settings" className="px-3 py-2 text-sm text-gray-700 hover:text-black rounded-md transition-colors">
                Settings
              </Link>
              <Link to="/login" className="px-3 py-2 text-sm text-gray-700 hover:text-black rounded-md transition-colors">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        {title && (
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={handleNavigateBack}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              )}
              <h2 className="text-2xl font-medium text-gray-900">{title}</h2>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
      
      {/* Footer - lighter and simpler */}
      <footer className="border-t border-gray-100 mt-12">
        <div className="container mx-auto px-6 py-4">
          <p className="text-sm text-gray-500 text-center">
            &copy; 2025 Flow Builder
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;