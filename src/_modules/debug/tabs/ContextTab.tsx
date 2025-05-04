// src/_modules/debug/tabs/ContextTab.tsx
import React from "react";
import JsonTreeRenderer from "../components/JsonTreeRenderer";

interface ContextTabProps {
  context: any;
  expandedPaths: Record<string, boolean>;
  setExpandedPaths: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const ContextTab: React.FC<ContextTabProps> = ({ 
  context, 
  expandedPaths, 
  setExpandedPaths 
}) => {
  return (
    <div className="p-4 h-full overflow-auto">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-md font-medium text-gray-800">
            Kontekst aplikacji
          </h3>
          <div className="text-xs text-gray-500">
            Ostatnia aktualizacja: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="h-full overflow-auto p-4">
            <div className="rounded-md border border-gray-200 p-4 bg-gray-50 h-full overflow-auto">
              {Object.keys(context).length > 0 ? (
                <JsonTreeRenderer 
                  data={context} 
                  expandedPaths={expandedPaths} 
                  setExpandedPaths={setExpandedPaths} 
                />
              ) : (
                <div className="text-gray-500 italic text-center p-4">
                  Kontekst jest pusty
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextTab;