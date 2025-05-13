// src/AppRouter.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useConfig } from './ConfigProvider';
import { WorkspaceLayout, WorkspaceOverview, ScenarioLayout } from './components';

const AppRouter: React.FC = () => {
  const { config, configId } = useConfig();

  if (!config || !configId) return null;

  // The first workspace to redirect to
  const defaultWorkspace = config.workspaces[0]?.slug;

  return (
    <Routes>
      {/* Root path - redirect to the app config path */}
      <Route path="/" element={<Navigate to={`/${configId}`} replace />} />
      
      {/* App config path - redirect to the first workspace */}
      <Route path="/:configId" element={
        <Navigate to={`/${configId}/${defaultWorkspace}`} replace />
      } />
      
      {/* Workspace routes */}
      <Route path="/:configId/:workspaceSlug" element={<WorkspaceLayout config={config} />}>
        {/* Workspace overview (default workspace view) */}
        <Route index element={<WorkspaceOverview config={config} />} />
        
        {/* Scenario routes */}
        <Route path=":scenarioSlug">
          <Route index element={<Navigate to="0" replace />} />
          <Route path=":stepIndex" element={<ScenarioLayout config={config} />} />
        </Route>
      </Route>
      
      {/* Fallback for unmatched routes */}
      <Route path="*" element={
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Strona nie znaleziona</h1>
          <p className="mb-4">Nie znaleziono podanej strony.</p>
          <button 
            onClick={() => window.location.href = `/${configId}/${defaultWorkspace}`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Wróć do strony głównej
          </button>
        </div>
      } />
    </Routes>
  );
};

export default AppRouter;