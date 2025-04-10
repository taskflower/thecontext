// src/components/DebugPanel.tsx
import React, { useState } from "react";
import { useAppStore } from "@/lib/store";

const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getCurrentWorkspace, getCurrentScenario, getContext } = useAppStore();
  
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();
  const context = getContext();
  
  return (
    <div className="fixed bottom-0 right-0 m-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-3 py-1 rounded-md shadow-md text-xs"
      >
        {isOpen ? "Ukryj" : "Debug"}
      </button>
      
      {isOpen && (
        <div className="bg-white shadow-lg border border-gray-300 rounded-md p-4 mt-2 w-96 max-h-80 overflow-auto">
          <h3 className="font-bold mb-2 text-sm">Debug Info</h3>
          
          <div className="bg-gray-100 p-2 rounded mb-2 text-xs">
            <div className="font-bold">Workspace:</div>
            <div>{currentWorkspace ? currentWorkspace.id : "Brak"}</div>
          </div>
          
          <div className="bg-gray-100 p-2 rounded mb-2 text-xs">
            <div className="font-bold">Scenario:</div>
            <div>{currentScenario ? currentScenario.id : "Brak"}</div>
          </div>
          
          <div className="text-xs">
            <div className="font-bold mb-1">Context:</div>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;