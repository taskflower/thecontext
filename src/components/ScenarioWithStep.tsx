// src/components/ScenarioWithStep.tsx
import React, { useMemo, useEffect, useState, Suspense } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FlowEngine } from "../core/engine";
import type { AppConfig } from "../core/types";
import { useFlowStore } from "../core/context";
import AppLoading from "./AppLoading";
import { preloadLayout } from "../preloadLayout";

const ScenarioWithStep: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug, scenarioSlug, stepIndex } = useParams<{
    workspaceSlug: string;
    scenarioSlug: string;
    stepIndex: string;
  }>();
  const navigate = useNavigate();
  const { currentNodeIndex, setCurrentNodeIndex, reset } = useFlowStore();
  const stepIdx = parseInt(stepIndex || "0", 10);
  const [transitioning, setTransitioning] = useState(false);
  const [prevIndex, setPrevIndex] = useState(stepIdx);

  // Znajdź workspace
  const workspace = useMemo(
    () => config.workspaces.find((w) => w.slug === workspaceSlug),
    [config.workspaces, workspaceSlug]
  );
  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-center mb-2">Workspace nie znaleziony</h2>
          <p className="text-center text-gray-700 mb-4">
            Przepraszamy, ale workspace "{workspaceSlug}" nie istnieje.
          </p>
          <div className="flex justify-center">
            <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Wróć do strony głównej
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Użyj tplDir i layoutFile z workspace.templateSettings
  const tplDir = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = useMemo(
    () => preloadLayout(tplDir, layoutFile),
    [tplDir, layoutFile]
  );

  // Reset i synchronizacja stanu przy montażu
  useEffect(() => {
    reset();
    if (stepIdx !== currentNodeIndex) {
      setCurrentNodeIndex(stepIdx);
    }
  }, [scenarioSlug, reset]);

  // Aktualizuj URL gdy index się zmieni
  useEffect(() => {
    if (stepIdx !== currentNodeIndex) {
      navigate(`/${workspaceSlug}/${scenarioSlug}/${currentNodeIndex}`, {
        replace: true,
      });
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

  if (!scenarioSlug || !scenarioSlug) return null; // safety

  return (
    <Suspense fallback={<AppLoading message="Ładowanie scenariusza..." />}>
      <AppLayout>
        <div className="bg-gray-50 border-b border-gray-200 mb-6">
          <nav className="flex text-sm text-gray-500 max-w-6xl mx-auto py-2 px-4">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">/</span>
            <Link to={`/${workspaceSlug}`} className="hover:text-gray-700">{workspace.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{scenarioSlug}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-700">Krok {currentNodeIndex + 1}</span>
          </nav>
        </div>
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="flex items-center">
            <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden mr-4">
              <div
                className="h-full bg-blue-500 rounded transition-all duration-300"
                style={{ width: `${((currentNodeIndex + 1) / config.scenarios.find(s => s.slug === scenarioSlug)!.nodes.length) * 100}%` }}
              />
            </div>
            <div className="text-sm text-gray-500">
              Krok {currentNodeIndex + 1} / {config.scenarios.find(s => s.slug === scenarioSlug)!.nodes.length}
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 h-full">
          <div className={`transition-all duration-200 ${transitioning ? "opacity-0" : "opacity-100"}`}>
            {!transitioning && <FlowEngine config={config} scenarioSlug={scenarioSlug} />}
          </div>
          {transitioning && (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-gray-600">Przechodzenie do kolejnego kroku...</p>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </Suspense>
  );
};

export default ScenarioWithStep;
