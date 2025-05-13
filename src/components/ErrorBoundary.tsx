// src/components/ErrorBoundary.tsx
import { FCWithChildren } from '@/core';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ErrorBoundary: FCWithChildren<{fallback?: React.ReactNode}> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handler = (e: ErrorEvent) => { console.error(e); setHasError(true); };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);
  if (hasError) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center space-y-4">
          <div className="p-3 bg-red-100 rounded-full inline-block">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Coś poszło nie tak</h3>
          <p className="text-sm text-gray-500">Wystąpił nieoczekiwany błąd.</p>
          <button onClick={() => location.reload()}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Przeładuj
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};
