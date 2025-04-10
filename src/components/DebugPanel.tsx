// src/components/DebugPanel.tsx
import React, { useState } from "react";
import { useContextStore } from "../lib/contextStore";
import { NodeData } from "@/views/types";

interface DebugPanelProps {
  nodeData?: {
    currentNodeIndex: number;
    totalNodes: number;
    isLastNode: boolean;
    currentNodeId: string;
  };
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ nodeData }:NodeData) => {
  const [isOpen, setIsOpen] = useState(false);
  const context = useContextStore((state) => state.context);
  
  // Sprawdź, czy jesteśmy w trybie produkcyjnym
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <>
      {/* Ikona debuggera */}
      <button 
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed right-4 bottom-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shadow-md text-gray-600 transition-all duration-200 z-50"
        title="Debug Info"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </button>
      
      {/* Panel debuggera */}
      <div className={`fixed right-0 top-0 bottom-0 w-[50vw] max-w-full bg-white shadow-lg border-l border-zinc-300 p-4 overflow-hidden transition-all duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-40`}>
        <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-3">
          <h3 className="font-medium text-gray-700">Debug Info</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-100px)] text-xs">
          {nodeData && (
            <div className="mb-4 bg-gray-50 p-3 rounded">
              <h4 className="font-semibold mb-2 text-gray-700">Flow State</h4>
              <pre className="bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                {JSON.stringify(nodeData, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold mb-2 text-gray-700">Context Data</h4>
            <pre className="bg-white p-2 rounded border border-gray-200 overflow-x-auto">
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
};

export default DebugPanel;