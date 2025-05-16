// src/themes/default/commons/ErrorDisplay.tsx
import React, { useState } from "react";

interface ErrorDisplayProps {
  error: string;
  details?: any;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  details,
  onRetry,
}) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const handleToggleDetails = () => setShowErrorDetails(!showErrorDetails);

  return (
    <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
      <h3 className="font-semibold mb-2">Wystąpił błąd</h3>
      <p>{error}</p>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleToggleDetails}
          className="text-red-700 underline text-xs flex items-center"
        >
          {showErrorDetails ? "Ukryj szczegóły" : "Pokaż szczegóły"}
          <svg
            className={`ml-1 w-3 h-3 transition-transform ${
              showErrorDetails ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <button
          onClick={onRetry}
          className="px-5 py-2 rounded transition-colors text-sm font-semibold bg-black text-white hover:bg-gray-800"
        >
          Spróbuj ponownie
        </button>
      </div>

      {showErrorDetails && details && (
        <div className="mt-4">
          <h4 className="font-semibold text-xs mb-2">Szczegóły błędu:</h4>
          <pre className="bg-white p-3 rounded overflow-auto max-h-80 text-xs border border-red-100 font-mono">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;