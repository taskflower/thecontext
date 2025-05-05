// src/templates/scenario-builder/widgets/CodePreview.tsx
import React, { useState } from "react";

interface CodePreviewProps {
  title?: string;
  description?: string;
  data?: string | { code?: string };
  onSelect?: (id: string) => void;
}

const CodePreview: React.FC<CodePreviewProps> = ({
  title,
  description,
  data,
  onSelect
}) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // Obsługa różnych formatów danych
  let codeContent = "";
  
  if (typeof data === 'string') {
    codeContent = data;
  } else if (data && typeof data === 'object' && typeof data.code === 'string') {
    codeContent = data.code;
  } else if (data && typeof data === 'object') {
    // Próba konwersji obiektu na string
    try {
      codeContent = JSON.stringify(data, null, 2);
    } catch (error) {
      codeContent = "Błąd podczas przetwarzania kodu.";
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([codeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scenario-code.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            {title || "Wygenerowany kod"}
          </h3>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {isCopied ? (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1 text-green-500" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Skopiowano
              </>
            ) : (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
                Kopiuj
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Pobierz
          </button>
        </div>
      </div>

      <div className="overflow-auto max-h-96">
        <pre className="p-4 text-sm text-gray-800 bg-gray-50 h-full font-mono">
          <code>{codeContent || "Brak wygenerowanego kodu."}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodePreview;