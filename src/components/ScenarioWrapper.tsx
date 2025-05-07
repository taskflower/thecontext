// src/components/ScenarioWrapper.tsx
import React, { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import type { AppConfig } from '../core/types';



const ScenarioWrapper: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug, scenarioSlug } = useParams<{ workspaceSlug: string; scenarioSlug: string }>();
  const scenario = useMemo(() => config.scenarios.find(s => s.slug === scenarioSlug), [config.scenarios, scenarioSlug]);
  if (!scenario) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="p-6 max-w-md bg-white rounded-lg shadow-sm"><h2 className="text-lg font-semibold text-center mb-2">Scenariusz nie znaleziony</h2><p className="text-center text-gray-700 mb-4">Przepraszamy, ale scenariusz "{scenarioSlug}" nie istnieje.</p>{config.scenarios.length > 0 && <div className="mb-4"><p className="text-center text-gray-700 mb-2">Dostępne scenariusze:</p><div className="flex flex-wrap justify-center gap-2">{config.scenarios.map(s => <Link key={s.slug} to={`/${workspaceSlug}/${s.slug}`} className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">{s.name}</Link>)}</div></div>}<div className="flex justify-center"><Link to={`/${workspaceSlug}`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Wróć do workspace</Link></div></div></div>;
  }
  return <Navigate to={`/${workspaceSlug}/${scenarioSlug}/0`} replace />;
};

export default ScenarioWrapper;