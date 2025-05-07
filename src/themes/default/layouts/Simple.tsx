// src/themes/default/layouts/Simple.tsx
import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

interface LayoutContext {
  workspace: any;
  scenario?: any;
  stepIdx?: number;
  totalSteps?: number;
  transitioning?: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
  context?: LayoutContext;
}

const SimpleLayout: React.FC<LayoutProps> = ({ children, context }) => {
  const { workspace, scenario, stepIdx = 0, totalSteps = 0 } = context || {};
  const showScenarioUI = !!scenario;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-6">
      <div className="overflow-hidden flex flex-col bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-4xl mx-auto h-full md:min-h-[95vh] md:max-h-[95vh]">
        <div className="px-5 py-6 bg-white">
          <div className="w-full flex items-center justify-between">
            <div className="font-black text-xl tracking-tighter text-gray-900">
              {workspace?.name || 'FlowApp'}
            </div>
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 h-8 w-8 rounded-full text-gray-900 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {showScenarioUI && (
            <>
              <div className="mt-10 mb-8">
                <h2 className="text-3xl font-normal text-gray-900">
                  {workspace?.name}<br />
                  <span className="font-bold">{scenario?.name}</span>
                </h2>
              </div>
              <div className="mb-4">
                <h3 className="font-bold text-base text-gray-900">
                  Krok {stepIdx + 1}: {scenario?.steps?.[stepIdx]?.title || ''}
                </h3>
              </div>
              
              <div className="mb-6">
                <div className="h-1.5 bg-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded transition-all duration-300"
                    style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLayout;