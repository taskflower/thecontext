// src/components/ConfigIndicator.tsx
import React from "react";
import { useConfig } from "@/ConfigProvider";
import { EditConfigButton } from "./EditConfigButton";

export const ConfigIndicator: React.FC = () => {
  const { config, configId, configType } = useConfig();
  
  if (!config || !configId) return null;
  
  return (
    <div className="fixed bottom-2 right-2 z-50 flex items-center space-x-2">
      {/* Przycisk edycji konfiguracji */}
      <EditConfigButton />
      
      {/* Wskaźnik aktywnej konfiguracji */}
      <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center">
        <span className="mr-1.5">Config:</span> 
        <span className="font-mono">{configId}</span>
        {configType && (
          <span className="ml-1.5 bg-blue-600 px-1.5 py-0.5 rounded-sm">
            {configType}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConfigIndicator;