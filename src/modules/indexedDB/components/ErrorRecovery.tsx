// src/modules/indexedDB/components/ErrorRecovery.tsx
import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import IndexedDBService from '../service';

interface ErrorRecoveryProps {
  error: Error;
  collectionName?: string;
  onRetry?: () => void;
}

const IndexedDBErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  collectionName,
  onRetry
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!confirm('UWAGA: Ta operacja usunie wszystkie dane IndexedDB! Czy na pewno chcesz kontynuować?')) {
      return;
    }
    
    setIsResetting(true);
    setResetError(null);
    
    try {
      await IndexedDBService.resetDatabase();
      setResetSuccess(true);
      setIsResetting(false);
    } catch {
      setResetError('Nie udało się zresetować bazy danych. Spróbuj wyczyścić dane przeglądarki ręcznie.');
      setIsResetting(false);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md text-red-600 dark:text-red-300">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium mb-2">Błąd IndexedDB</h3>
          <p className="text-sm mb-3">{error.message}</p>
          
          {collectionName && (
            <p className="text-sm mb-3">
              Kolekcja: <span className="font-mono bg-red-100 dark:bg-red-900/30 px-1 rounded">{collectionName}</span>
            </p>
          )}

          {resetSuccess ? (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-300">
              <p className="font-medium">Baza danych została zresetowana</p>
              <p className="text-sm mt-1">Odśwież stronę, aby zastosować zmiany:</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Odśwież stronę
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mt-3">
              <button
                onClick={handleRetry}
                disabled={isResetting}
                className="flex items-center justify-center px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Spróbuj ponownie
              </button>
              
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="flex items-center justify-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Resetowanie...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" /> Resetuj bazę danych
                  </>
                )}
              </button>
            </div>
          )}
          
          {resetError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-300">{resetError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexedDBErrorRecovery;