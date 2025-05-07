// src/components/FlowRoutes.tsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { AppConfig } from '../core/types';
import AppLoading from './AppLoading';
import WorkspaceOverview from './WorkspaceOverview';
import ScenarioWrapper from './ScenarioWrapper';
import ScenarioWithStep from './ScenarioWithStep';

const FlowRoutes: React.FC<{ config: AppConfig }> = ({ config }) => {
  const defaultWorkspace = config.workspaces[0]?.slug || '';
  return (
    <Routes>
      <Route path="/" element={<Navigate to={`/${defaultWorkspace}`} replace />} />
      <Route path="/:workspaceSlug" element={<Suspense fallback={<AppLoading message="Ładowanie workspace..." />}><WorkspaceOverview config={config} /></Suspense>} />
      <Route path="/:workspaceSlug/:scenarioSlug/:stepIndex" element={<Suspense fallback={<AppLoading message="Ładowanie scenariusza..." />}><ScenarioWithStep config={config} /></Suspense>} />
      <Route path="/:workspaceSlug/:scenarioSlug" element={<Suspense fallback={<AppLoading message="Ładowanie scenariusza..." />}><ScenarioWrapper config={config} /></Suspense>} />
      <Route path="*" element={<div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="p-6 max-w-md bg-white rounded-lg shadow-sm"><h2 className="text-lg font-semibold text-center mb-2">Strona nie znaleziona</h2><p className="text-center text-gray-700 mb-4">Przepraszamy, ale strona której szukasz nie istnieje.</p><div className="flex justify-center"><a href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Wróć do strony głównej</a></div></div></div>} />
    </Routes>
  );
};

export default FlowRoutes;