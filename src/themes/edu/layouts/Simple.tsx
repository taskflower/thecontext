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

  // Render UI elements only when scenario context is available
  const showScenarioUI = !!scenario;
  
  return (
    <div className="min-h-screen flex flex-col bg-sky-50">
      <header className="sticky top-0 z-10 bg-white border-b border-sky-200 shadow-sm">
        <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">FA</span>
            </div>
            <h1 className="m-0 text-xl font-semibold text-slate-800">
              {workspace?.name || 'FlowApp'}
            </h1>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 flex flex-col py-6">
        {/* Breadcrumbs - rendered only for scenario */}
        {showScenarioUI && (
          <nav className="flex gap-2 py-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>/</span>
            <Link to={`/${workspaceSlug}`} className="hover:text-indigo-600">{workspace?.name}</Link>
            <span>/</span>
            <span className="text-indigo-600">{scenario?.name}</span>
            <span>/</span>
            <span className="text-indigo-600">Krok {stepIdx + 1}</span>
          </nav>
        )}

        {/* Progress bar - rendered only for scenario */}
        {showScenarioUI && (
          <div className="py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-sky-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <div className="text-sm font-semibold text-slate-500">
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

      <footer className="mt-auto bg-white border-t border-sky-200">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-sm text-slate-500">
          <p>Flow App Builder &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLayout;