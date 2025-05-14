import React from "react";
import { ConfigDetailProps } from "./types";

export const ConfigDetails: React.FC<ConfigDetailProps> = ({ config }) => {
  return (
    <div className="bg-white rounded-md border border-gray-100">
      <div className="border-b border-gray-100 px-3 py-2 flex items-center">
        <span className="text-xs font-medium text-gray-500 mr-2">
          Konfiguracja:
        </span>
        <h2 className="text-sm font-medium text-gray-700">{config.name}</h2>
      </div>
      
      <div className="p-2">
        <div className="bg-gray-50 rounded p-2 overflow-auto text-xs font-mono text-gray-700">
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};