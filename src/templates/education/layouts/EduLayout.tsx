// src/templates/education/layouts/EduLayout.tsx
import React, { useEffect, useState } from 'react';
import { LayoutProps } from 'template-registry-module';
import { useAppStore } from '@/lib/store';
import { UserDropdown } from '@/auth/UserDropdown';
import { useAuth } from '@/hooks/useAuth';

const EduLayout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  showBackButton, 
  onBackClick 
}) => {
  // Get context to check if we're in preview mode
  const getContextPath = useAppStore(state => state.getContextPath);
  const previewMode = getContextPath('previewMode') === true;
  
  // Get auth state
  const { user, loading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Set auth checked after initial loading is complete
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <header className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {/* Logo */}
            <div className="mr-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
              <span className="font-bold">EduSprint</span>
            </div>
            
            <div className="flex items-center">
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
              
              {/* Preview mode badge */}
              {previewMode && (
                <div className="ml-3 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                  Tryb podglądu
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Authentication display */}
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">Autoryzacja...</span>
              </div>
            ) : (
              <UserDropdown />
            )}
            
            <button className="text-sm text-gray-600 hover:text-gray-800">
              Pomoc
            </button>
          </div>
        </header>

        {/* Back button removed from education template for better UX */}

        {/* Preview mode info banner */}
        {previewMode && (
          <div className="mb-4 p-3 border border-amber-200 bg-amber-50 rounded-lg text-sm text-amber-800">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Przeglądasz zapisany materiał w trybie podglądu. Wszystkie interakcje będą działać tylko w trybie demonstracyjnym.</span>
            </div>
          </div>
        )}

        {/* Auth debug info (temporary) */}
        <div className="mb-4 p-2 border border-gray-200 bg-gray-50 rounded-lg text-xs text-gray-700">
          <div>Auth Status: {loading ? 'Loading...' : user ? 'Authenticated' : 'Not authenticated'}</div>
          {user && (
            <div>
              User: {user.displayName || user.email || 'Unknown'} 
              (Tokens: {user.availableTokens || 0})
            </div>
          )}
        </div>

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