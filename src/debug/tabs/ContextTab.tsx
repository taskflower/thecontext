// src/debug/tabs/ContextTab.jsx
import React from "react";
import { JsonTreeRenderer } from "../components/JsonTreeRenderer";

export const ContextTab = ({ context, expandedPaths, setExpandedPaths }) => {
  return (
    <div className="p-3 h-full overflow-auto">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Kontekst aplikacji
        </h3>
        <div className="text-xs text-gray-500">
          Ostatnia aktualizacja: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto font-mono text-sm">
        {Object.keys(context).length > 0 ? (
          <JsonTreeRenderer 
            data={context} 
            expandedPaths={expandedPaths} 
            setExpandedPaths={setExpandedPaths} 
          />
        ) : (
          <div className="text-gray-500 italic">Kontekst jest pusty</div>
        )}
      </div>
    </div>
  );
};

export default ContextTab;