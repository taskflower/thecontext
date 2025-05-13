import React, { useState } from "react";
import { ScenarioConfig} from "./types";

interface ScenarioDetailsProps {
  scenario: ScenarioConfig;
}

export const ScenarioDetails: React.FC<ScenarioDetailsProps> = ({ scenario }) => {
  const [scenarioTab, setScenarioTab] = useState("steps");

  return (
    <div className="bg-white rounded-md border border-gray-100">
      <div className="border-b border-gray-100 px-3 py-2">
        <div className="flex items-center">
          <span className="text-xs font-medium text-gray-500 mr-2">Scenariusz:</span>
          <h2 className="text-sm font-medium text-gray-700">{scenario.name || scenario.slug}</h2>
        </div>
        {scenario.description && (
          <p className="text-xs text-gray-500 mt-1">{scenario.description}</p>
        )}
      </div>
      
      <div className="px-3 py-2">
        <div className="flex text-xs border-b border-gray-100 mb-2">
          <button 
            className={`mr-3 pb-1.5 ${scenarioTab === "steps" 
              ? "text-gray-700 border-b border-gray-400" 
              : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setScenarioTab("steps")}
          >
            Kroki
          </button>
          <button 
            className={`mr-3 pb-1.5 ${scenarioTab === "json" 
              ? "text-gray-700 border-b border-gray-400" 
              : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setScenarioTab("json")}
          >
            JSON
          </button>
        </div>
        
        {scenarioTab === "steps" && (
          <div className="space-y-1.5">
            {scenario.nodes && [...scenario.nodes]
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((node, index) => (
                <div key={index} className="flex items-center text-xs p-1.5 bg-gray-50 rounded">
                  <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center mr-1.5 text-[10px] font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{node.label || `Krok ${index + 1}`}</span>
                </div>
              ))}
          </div>
        )}
        
        {scenarioTab === "json" && (
          <div className="bg-gray-50 rounded p-2 overflow-auto max-h-[250px] text-xs font-mono text-gray-700">
            <pre>{JSON.stringify(scenario, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};