// src/themes/clean/layouts/Simple.tsx
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
  // Access contextual data
  const { workspace, scenario, stepIdx = 0, totalSteps = 0 } = context || {};
  const workspaceSlug = workspace?.slug;
  const scenarioSlug = scenario?.slug;

  // Render UI elements only when scenario context is available
  const showScenarioUI = !!scenario;
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="m-0 text-xl font-semibold text-slate-800">
              {workspace?.name || 'FlowApp'}
            </h1>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 flex flex-col">
        {/* Breadcrumbs - rendered only for scenario */}
        {showScenarioUI && (
          <nav className="flex gap-2 py-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-700">Home</Link>
            <span>/</span>
            <Link to={`/${workspaceSlug}`} className="hover:text-slate-700">{workspace?.name}</Link>
            <span>/</span>
            <span className="text-slate-700">{scenario?.name}</span>
            <span>/</span>
            <span className="text-slate-700">Krok {stepIdx + 1}</span>
          </nav>
        )}

        {/* Progress bar - rendered only for scenario */}
        {showScenarioUI && (
          <div className="py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <div className="text-sm font-medium text-slate-500">
                {stepIdx + 1} / {totalSteps}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-[400px]">
          {children}
        </div>
      </main>

      <footer className="mt-auto">
        <hr className="mt-4 mb-4" />
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm text-slate-500">
          <p>Flow App Builder &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLayout;
