// src/components/WorkspaceOverview.tsx
import React, { useMemo, Suspense } from "react";
import { useParams } from "react-router-dom";
import type { AppConfig } from "../core/types";
import LoadingSpinner from "./LoadingSpinner";
import { preloadComponent, preloadLayout } from "../preload";

const WorkspaceOverview: React.FC<{ config: AppConfig }> = ({ config }) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const workspace = useMemo(
    () => config.workspaces.find((w) => w.slug === workspaceSlug),
    [config.workspaces, workspaceSlug]
  );

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-center mb-2">
            Workspace nie znaleziony
          </h2>
          <p className="text-center text-gray-700 mb-4">
            Przepraszamy, ale workspace "{workspaceSlug}" nie istnieje.
          </p>
          <div className="flex justify-center">
            <a
              href="/"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Wróć do strony głównej
            </a>
          </div>
        </div>
      </div>
    );
  }

  const tplDir = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = useMemo(
    () => preloadLayout(tplDir, layoutFile),
    [tplDir, layoutFile]
  );

  const WidgetsStep = useMemo(
    () => preloadComponent(tplDir, "WidgetsStep"),
    [tplDir]
  );

  const widgets = useMemo(
    () =>
      workspace.templateSettings?.widgets?.map((widget) => ({
        ...widget,
        config,
        workspaceSlug,
      })) || [],
    [workspace, config, workspaceSlug]
  );

  return (
    <Suspense fallback={<LoadingSpinner message="Ładowanie workspace..." />}>
      <AppLayout>
        <Suspense fallback={<LoadingSpinner message="Ładowanie widgetów..." />}>
          <WidgetsStep
            widgets={widgets}
            onSubmit={() => {}}
            title={workspace.name}
            subtitle={workspace.description}
            saveToDB={null}
            scenarioName={null}
            nodeSlug={null}
          />
        </Suspense>
      </AppLayout>
    </Suspense>
  );
};

export default WorkspaceOverview;
