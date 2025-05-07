// src/themes/default/layouts/Simple.tsx
import React from "react";
import { Link } from "react-router-dom";

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
  // Dostęp do danych kontekstowych
  const { workspace, scenario, stepIdx = 0, totalSteps = 0 } = context || {};
  const workspaceSlug = workspace?.slug;
  const scenarioSlug = scenario?.slug;

  // Renderowanie elementów UI tylko gdy mamy context scenariusza
  const showScenarioUI = !!scenario;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {workspace?.name || 'FlowApp'}
          </h1>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Breadcrumbs - renderowane tylko dla scenariusza */}
        {showScenarioUI && (
          <nav className="max-w-6xl mx-auto py-2 px-4 flex text-sm text-gray-500 bg-gray-50 border-b border-gray-200">
            <Link to="/">Home</Link><span className="mx-2">/</span>
            <Link to={`/${workspaceSlug}`}>{workspace?.name}</Link><span className="mx-2">/</span>
            <span>{scenario?.name}</span><span className="mx-2">/</span>
            <span>Krok {stepIdx + 1}</span>
          </nav>
        )}

        {/* Pasek postępu - renderowany tylko dla scenariusza */}
        {showScenarioUI && (
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center mb-6">
              <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden mr-4">
                <div
                  className="h-full bg-blue-500 rounded transition-all duration-300"
                  style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <div className="text-sm text-gray-500">
                {stepIdx + 1} / {totalSteps}
              </div>
            </div>
          </div>
        )}

        {/* Zawartość */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          {children}
        </div>
      </main>

      <footer className="bg-white py-4 border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          &copy; 2025 FlowApp
        </div>
      </footer>
    </div>
  );
};

export default SimpleLayout;