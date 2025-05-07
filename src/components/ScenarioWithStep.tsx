// src/components/ScenarioWithStep.tsx
import React, {  useMemo, useEffect, useState } from 'react';
import { Suspense } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FlowEngine } from '../core/engine';
import type { AppConfig } from '../core/types';
import { useFlowStore } from '../core/context';
import AppLoading from './AppLoading';
import { preloadLayout } from '../preloadLayout';

const ScenarioWithStep: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug, scenarioSlug, stepIndex } = useParams<{ workspaceSlug: string; scenarioSlug: string; stepIndex: string }>();
  const navigate = useNavigate();
  const { currentNodeIndex, setCurrentNodeIndex, reset } = useFlowStore();
  const stepIdx = parseInt(stepIndex || '0', 10);
  const [transitioning, setTransitioning] = useState(false);
  const [prevIndex, setPrevIndex] = useState(stepIdx);

  // Znajdź bieżący scenariusz i workspace
  const scenario = useMemo(
    () => config.scenarios.find(s => s.slug === scenarioSlug),
    [config.scenarios, scenarioSlug]
  );
  const workspace = useMemo(
    () => config.workspaces.find(w => w.slug === workspaceSlug),
    [config.workspaces, workspaceSlug]
  );

  // Wczytaj layout tylko raz
  const AppLayout = useMemo(
    () => preloadLayout(config.tplDir || 'default', config.templateSettings?.layoutFile || 'Simple'),
    [config.tplDir, config.templateSettings?.layoutFile]
  );

  // Reset i synchronizacja stanu przy montażu
  useEffect(() => {
    reset();
    if (stepIdx !== currentNodeIndex) {
      setCurrentNodeIndex(stepIdx);
    }
  }, [scenarioSlug, reset]);

  // Aktualizuj URL jeśli index się zmienił
  useEffect(() => {
    if (stepIdx !== currentNodeIndex) {
      navigate(`/${workspaceSlug}/${scenarioSlug}/${currentNodeIndex}`, { replace: true });
    }
  }, [currentNodeIndex, navigate, scenarioSlug, stepIdx, workspaceSlug]);

  // Animacja przejścia
  useEffect(() => {
    if (currentNodeIndex !== prevIndex) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setPrevIndex(currentNodeIndex);
        setTransitioning(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentNodeIndex, prevIndex]);

  if (!scenario) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-center mb-2">Scenariusz nie znaleziony</h2>
        <p className="text-center text-gray-700 mb-4">Przepraszamy, ale scenariusz "{scenarioSlug}" nie istnieje.</p>
        {config.scenarios.length > 0 && (
          <div className="mb-4">
            <p className="text-center text-gray-700 mb-2">Dostępne scenariusze:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {config.scenarios.map(s => (
                <Link key={s.slug} to={`/${workspaceSlug}/${s.slug}`} className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">{s.name}</Link>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-center">
          <Link to={`/${workspaceSlug}`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Wróć do workspace</Link>
        </div>
      </div>
    </div>
  );

  if (!workspace) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-center mb-2">Workspace nie znaleziony</h2>
        <p className="text-center text-gray-700 mb-4">Przepraszamy, ale workspace "{workspaceSlug}" nie istnieje.</p>
        <div className="flex mb-4">
          <p className="text-gray-700 mr-2">Dostępne workspaces:</p>
          {config.workspaces.map(w => (
            <Link key={w.slug} to={`/${w.slug}`} className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">{w.name}</Link>
          ))}
        </div>
        <div className="flex justify-center">
          <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Wróć do strony głównej</Link>
        </div>
      </div>
    </div>
  );

  // Przygotuj kroki i progres
  const { sortedNodes, totalSteps } = useMemo(() => {
    const nodes = [...scenario.nodes].sort((a, b) => a.order - b.order);
    return { sortedNodes: nodes, totalSteps: nodes.length };
  }, [scenario.nodes]);

  return (
    <Suspense fallback={<AppLoading message="Ładowanie layoutu..." />}>
      <AppLayout>
        <div className="bg-gray-50 border-b border-gray-200 mb-6">
          <div className="max-w-6xl mx-auto py-2 px-4">
            <nav className="flex text-sm text-gray-500">
              <Link to="/" className="hover:text-gray-700">Home</Link>
              <span className="mx-2">/</span>
              <Link to={`/${workspaceSlug}`} className="hover:text-gray-700">{workspace.name}</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-700">{scenario.name}</span>
              <span className="mx-2">/</span>
              <span className="text-gray-700">Krok {currentNodeIndex + 1}</span>
            </nav>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center mb-6">
            <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden mr-4">
              <div className="h-full bg-blue-500 rounded transition-all duration-300" style={{ width: `${((currentNodeIndex + 1) / totalSteps) * 100}%` }} />
            </div>
            <div className="text-sm text-gray-500">Krok {currentNodeIndex + 1} / {totalSteps}</div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className={`transition-all duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
            <Suspense fallback={<div className="p-8 bg-white rounded-lg shadow-md min-h-[400px] flex items-center justify-center"><div className="flex flex-col items-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div><p className="text-gray-600">Ładowanie zawartości...</p></div></div>}>
              {!transitioning && <FlowEngine config={config} scenarioSlug={scenarioSlug} />}
            </Suspense>
          </div>
          {transitioning && <div className="p-8 bg-white rounded-lg shadow-md min-h-[400px] flex items-center justify-center"><div className="flex flex-col items-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div><p className="text-gray-600">Przechodzenie do kolejnego kroku...</p></div></div>}
        </div>
      </AppLayout>
    </Suspense>
  );
};

export default ScenarioWithStep;
