// src/components/WorkspaceOverview.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { AppConfig, TemplateComponentProps, useLayout, useComponent } from "@/core";
import { ThemeProvider } from "@/themes/ThemeContext";
import { withSuspense } from ".";

interface WorkspaceOverviewProps {
  config: AppConfig;
}

const RawWorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({ config }) => {
  const { configId, workspaceSlug } = useParams<{ configId: string; workspaceSlug: string }>();
  const workspace = config.workspaces.find((w) => w.slug === workspaceSlug);
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
            <Link
              to={`/${configId}`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Wróć do strony głównej
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tplDir = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = useLayout<{ children?: React.ReactNode }>(tplDir, layoutFile);
  const WidgetsStep = useComponent<TemplateComponentProps>(tplDir, "WidgetsStep");

  const widgets = (workspace.templateSettings?.widgets || []).map((w: any) => ({
    ...w,
    config,
    workspaceSlug,
  }));

  return (
    <ThemeProvider value={tplDir}>
      <AppLayout>
        <WidgetsStep
          widgets={widgets}
          onSubmit={() => {}}
          title={workspace.name}
          subtitle={workspace.description}
          saveToDB={null}
          scenarioName={null}
          nodeSlug={null}
          schema={null}
          data={null}
        />
      </AppLayout>
    </ThemeProvider>
  );
};

export default withSuspense(
  React.lazy(() => Promise.resolve({ default: RawWorkspaceOverview })),
  'Ładowanie workspace…'
);