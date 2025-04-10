// src/templates/simple/layouts/SimpleLayout.tsx
import React from 'react';

// Dodajmy definicję LayoutProps bezpośrednio tutaj aby uniknąć problemu TypeScript
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

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
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Back button with minimal style */}
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="text-xs uppercase tracking-widest font-medium text-gray-500 hover:text-black mb-8 flex items-center transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            WRÓĆ
          </button>
        )}

        {/* Architectural magazine inspired header */}
        <header className="mb-10 border-b border-black pb-4">
          {title && <h1 className="text-3xl font-light uppercase tracking-wide">{title}</h1>}
        </header>

        {/* Main content with minimal border */}
        <div className="border-l-2 border-black pl-6 mb-12">
          {children}
        </div>
         
       
      </div>
    </div>
  );
};



export default SimpleLayout;