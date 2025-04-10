// src/templates/newyork/layouts/DashboardLayout.tsx
import React from 'react';
import { LayoutProps } from 'template-registry-module';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../../lib/store';

const DashboardLayout: React.FC<LayoutProps> = ({ 
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - lighter and more elegant */}
      <aside className="w-64 bg-white border-r border-gray-100 shadow-sm fixed inset-y-0 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-lg font-medium text-gray-900 mb-6">Flow Builder</h1>
          
          <nav className="space-y-1">
            <Link 
              to="/" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-50 text-black"
            >
              <svg className="mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            
            {activeWorkspace && (
              <Link 
                to={`/${activeWorkspace.id}`} 
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-black"
              >
                <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Scenarios
              </Link>
            )}
            
            <Link 
              to="/settings" 
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-black"
            >
              <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </nav>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 ml-64">
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="px-6 py-3">
            <div className="flex justify-between items-center">
              {title && (
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
                  <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                
                <div className="flex items-center">
                  <Link to="/login" className="flex items-center space-x-2 rounded-full px-2 py-1 hover:bg-gray-100">
                    <span className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm">
                      U
                    </span>
                    <span className="text-sm text-gray-700">User</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;