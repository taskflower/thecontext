// src/components/ScenarioWithStep.tsx
import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FlowEngine } from '../core/engine';
import type { AppConfig } from '../core/types';
import AppLoading from './AppLoading';
import { preloadLayout } from '../preloadLayout';

const ScenarioWithStep: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug, scenarioSlug, stepIndex } = useParams<{ workspaceSlug: string; scenarioSlug: string; stepIndex: string }>();
  const navigate = useNavigate();
  const stepIdx = Number.isNaN(Number(stepIndex)) ? 0 : parseInt(stepIndex as string, 10);
  const [transitioning, setTransitioning] = useState(false);
  const [prevIdx, setPrevIdx] = useState(stepIdx);

  const workspace = useMemo(
    () => config.workspaces.find(w => w.slug === workspaceSlug),
    [config.workspaces, workspaceSlug]
  );
  if (!workspace) return <div>Workspace nie znaleziony</div>;

  const tplDir = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || 'Simple';
  const AppLayout = useMemo(() => preloadLayout(tplDir, layoutFile), [tplDir, layoutFile]);

  // Animacja przejścia między krokami
  useEffect(() => {
    if (stepIdx !== prevIdx) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setPrevIdx(stepIdx);
        setTransitioning(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [stepIdx, prevIdx]);

  return (
    <Suspense fallback={<AppLoading message="Ładowanie scenariusza..." />}>
      <AppLayout>
        <nav className="max-w-6xl mx-auto py-2 px-4 flex text-sm text-gray-500 bg-gray-50 border-b border-gray-200">
          <Link to="/">Home</Link><span className="mx-2">/</span>
          <Link to={`/${workspaceSlug}`}>{workspace.name}</Link><span className="mx-2">/</span>
          <span>{scenarioSlug}</span><span className="mx-2">/</span>
          <span>Krok {stepIdx + 1}</span>
        </nav>
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Pasek postępu */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden mr-4">
              <div
                className="h-full bg-blue-500 rounded transition-all duration-300"
                style={{ width: `${((prevIdx + 1) / config.scenarios.find(s => s.slug === scenarioSlug)!.nodes.length) * 100}%` }}
              />
            </div>
            <div className="text-sm text-gray-500">
              {prevIdx + 1} / {config.scenarios.find(s => s.slug === scenarioSlug)!.nodes.length}
            </div>
          </div>

          <div className={`transition-all duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>            
            {!transitioning && <FlowEngine config={config} scenarioSlug={scenarioSlug!} stepIdx={stepIdx} />}
          </div>
          {transitioning && (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">Przechodzenie do kolejnego kroku...</span>
            </div>
          )}
        </div>
      </AppLayout>
    </Suspense>
  );
};

export default ScenarioWithStep;
