import React from 'react';
import { useFlowStore } from '../../../core/context';
import { RefreshCw } from 'lucide-react';

type SimpleLayoutProps = {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
};

export default function SimpleLayout({
  children,
  title = 'Flow Application',
  showHeader = true,
  showFooter = true
}: SimpleLayoutProps) {
  const { currentNodeIndex, reset } = useFlowStore();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {showHeader && (
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
            <h1 className="m-0 text-xl font-semibold text-gray-800">{title}</h1>
            <div className="flex gap-2">
              <button 
                className="py-2 px-4 bg-transparent border border-gray-300 rounded text-sm cursor-pointer transition-all hover:bg-gray-100"
                onClick={() => reset()}
              >
                <RefreshCw className="w-4 h-4 inline-block mr-1" />
                Resetuj
              </button>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex items-center mb-8">
          <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden mr-4">
            <div 
              className="h-full bg-blue-500 rounded transition-all duration-300"
              style={{ width: `${(currentNodeIndex / 3) * 100}%` }} 
            />
          </div>
          <div className="text-sm text-gray-500">
            Krok {currentNodeIndex + 1} / 3
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden min-h-[400px]">
          {children}
        </div>
      </main>
      
      {showFooter && (
        <footer className="mt-auto bg-gray-100 border-t border-gray-200">
          <div className="max-w-6xl mx-auto p-4 text-center text-sm text-gray-500">
            <p>Flow App Builder &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      )}
    </div>
  );
}