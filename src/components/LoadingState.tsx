// src/components/LoadingState.tsx
import React from 'react';

interface LoadingStateProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  loadingMessage?: string;
  errorTitle?: string;
  children: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  onRetry,
  loadingMessage = 'Ładowanie...',
  errorTitle = 'Wystąpił błąd',
  children
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-700 text-lg">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto my-8">
        <h3 className="text-red-800 font-medium text-lg mb-2">{errorTitle}</h3>
        <p className="text-red-700 mb-4">{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Spróbuj ponownie
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingState;