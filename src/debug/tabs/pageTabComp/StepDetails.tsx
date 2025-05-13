import React, { useState } from "react";
import { NodeConfig } from "./types";

interface StepDetailsProps {
  step: NodeConfig;
  stepIndex: number;
}

export const StepDetails: React.FC<StepDetailsProps> = ({ step, stepIndex }) => {
  const [stepTab, setStepTab] = useState("details");

  return (
    <div className="bg-white rounded-md border border-gray-100">
      <div className="border-b border-gray-100 px-3 py-2 flex items-center">
        <span className="text-xs font-medium text-gray-500 mr-2">
          Krok {stepIndex + 1}:
        </span>
        <h2 className="text-sm font-medium text-gray-700">{step.label || `Krok ${stepIndex + 1}`}</h2>
      </div>
      
      <div className="px-3 py-2">
        <div className="flex text-xs border-b border-gray-100 mb-2">
          <button 
            className={`mr-3 pb-1.5 ${stepTab === "details" 
              ? "text-gray-700 border-b border-gray-400" 
              : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setStepTab("details")}
          >
            Informacje
          </button>
          <button 
            className={`mr-3 pb-1.5 ${stepTab === "json" 
              ? "text-gray-700 border-b border-gray-400" 
              : "text-gray-400 hover:text-gray-600"}`}
            onClick={() => setStepTab("json")}
          >
            JSON
          </button>
        </div>
        
        {stepTab === "details" && (
          <div className="text-xs">
            {step.description && (
              <div className="mb-2 text-gray-600">
                {step.description}
              </div>
            )}
            <div className="flex flex-wrap mt-1">
              {Object.entries(step)
                .filter(([key]) => !["label", "description", "order"].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="mr-3 mb-1">
                    <span className="text-gray-500">{key}:</span>{" "}
                    <span className="text-gray-700">
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {stepTab === "json" && (
          <div className="bg-gray-50 rounded p-2 overflow-auto max-h-[250px] text-xs font-mono text-gray-700">
            <pre>{JSON.stringify(step, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};