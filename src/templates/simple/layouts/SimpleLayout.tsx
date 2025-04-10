// src/templates/simple/layouts/SimpleLayout.tsx
import React from 'react';
import { LayoutProps } from '@/views/types'; // Zmieniamy import na lokalny
import SimpleContextWidget from '../widgets/SimpleContextWidget';

interface SimpleLayoutProps extends LayoutProps {
  contextItems?: [string, any][];
}
 
const SimpleLayout: React.FC<SimpleLayoutProps> = ({
  children,
  title,
  showBackButton,
  onBackClick,
  contextItems = []
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-3xl">
        {/* Prosty nagłówek z tytułem */}
        <header className="mb-4">
          {title && <h1 className="text-2xl font-bold text-center">{title}</h1>}
        </header>

        {/* Przycisk powrotu */}
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="text-sm text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-1"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Wróć
          </button>
        )}

        {/* Główna zawartość */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
         {/* Context Widget Placeholder */}
         <div className="mt-4">
           <SimpleContextWidget data={contextItems} />
         </div>
      </div>
    </div>
  );
};

export default SimpleLayout;