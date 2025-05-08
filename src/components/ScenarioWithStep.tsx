// src/components/ScenarioWithStep.tsx
import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FlowEngine } from '../core/engine';
import type { AppConfig } from '../core/types';
import AppLoading from './AppLoading';
import { preloadLayout } from '@/preload';

const ScenarioWithStep: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug, scenarioSlug, stepIndex } = useParams<{ 
    workspaceSlug: string; 
    scenarioSlug: string; 
    stepIndex: string 
  }>();
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
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [stepIdx, prevIdx]);

  // Przygotuj dane kontekstowe dla layoutu
  const scenario = config.scenarios.find(s => s.slug === scenarioSlug);
  const layoutContext = {
    workspace,
    scenario,
    stepIdx,
    totalSteps: scenario?.nodes.length || 0,
    transitioning
  };

  return (
    <Suspense fallback={<AppLoading message="Ładowanie scenariusza..." />}>
      <AppLayout context={layoutContext}>
        <div className={`transition-all duration-200 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>            
          {!transitioning && scenarioSlug && <FlowEngine 
            config={config} 
            scenarioSlug={scenarioSlug} 
            stepIdx={stepIdx} 
          />}
        </div>
        {transitioning && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Przechodzenie do kolejnego kroku...</span>
          </div>
        )}
      </AppLayout>
    </Suspense>
  );
};

export default ScenarioWithStep;