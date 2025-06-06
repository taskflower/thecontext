// src/pages/ConfigPage.tsx - VERSION with cellClass and parentClass
import { useComponent, useConfig } from "@/core";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import type { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";

function Error({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center py-12">
      <div className="text-red-600 text-sm">{children}</div>
    </div>
  );
}

export default function ConfigPage() {
  const { config, workspace, scenario, node } = useParams<{
    config: string;
    workspace: string;
    scenario: string;
    node: string;
    id: string;
  }>();

  console.log('🎯 ConfigPage params:', { config, workspace, scenario, node });

  // Wymagaj podstawowych parametrów
  if (!config) return <Error>Missing config parameter</Error>;
  if (!workspace) return <Error>Missing workspace parameter</Error>;

  const base = `/src/_configs/${config}`;

  const app = useConfig<AppConfig>(config, `${base}/app.json`);
  const workspaceConfig = useConfig<WorkspaceConfig>(
    config,
    `${base}/workspaces/${workspace}.json`
  );
  const scenarioConfig = useConfig<ScenarioConfig>(
    config,
    scenario ? `${base}/scenarios/${workspace}/${scenario}.json` : ""
  );

  console.log('📊 Configs loaded:', { 
    app: !!app, 
    workspaceConfig: !!workspaceConfig,
    layoutFile: workspaceConfig?.templateSettings?.layoutFile 
  });

  // Layout config
  const { theme, layoutFile } = useMemo(
    () => ({
      theme: app?.tplDir || "default",
      layoutFile: workspaceConfig?.templateSettings?.layoutFile || "Simple",
    }),
    [app?.tplDir, workspaceConfig?.templateSettings?.layoutFile]
  );

  const { Component: Layout, loading: layoutLoading } = useComponent(
    theme,
    "layouts",
    layoutFile
  );

  console.log('🎨 Layout:', { Layout: !!Layout, loading: layoutLoading, theme, layoutFile });

  // Loading states
  if (!app || layoutLoading) return <></>;
  if (!workspaceConfig) return <Error>Workspace not found: {workspace}</Error>;
  if (!Layout) return <Error>Layout not found: {layoutFile}</Error>;

  // Scenario mode: /:config/:workspace/:scenario/:node
  if (scenario) {
    if (!scenarioConfig) {
      return (
        <Layout>
          <></>
        </Layout>
      );
    }

    if (!scenarioConfig.nodes?.length) {
      return (
        <Layout>
          <Error>Invalid scenario: {scenario}</Error>
        </Layout>
      );
    }

    // Znajdź node po slug lub użyj pierwszego
    const selectedNode = node
      ? scenarioConfig.nodes.find((n) => n.slug === node) ||
        scenarioConfig.nodes[0]
      : scenarioConfig.nodes[0];

    return (
      <Layout>
        <StepRenderer
          theme={theme}
          filename={selectedNode.tplFile}
          attrs={selectedNode.attrs}
        />
      </Layout>
    );
  }

  // Workspace mode: /:config/:workspace (grid z widgets)
  // ✅ NEW: Use parentClass from config, with sensible default
  const parentClass = workspaceConfig.templateSettings?.parentClass || 
    "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6";

  return (
    <Layout>
      <div className={parentClass}>
        {workspaceConfig.templateSettings?.widgets?.map((widget, i) => (
          <WidgetRenderer key={i} theme={theme} widget={widget} />
        ))}
      </div>
    </Layout>
  );
}

// Renderowanie kroku scenariusza
function StepRenderer({
  theme,
  filename,
  attrs,
}: {
  theme: string;
  filename: string;
  attrs: any;
}) {
  const { Component, loading, error } = useComponent(theme, "steps", filename);

  if (loading) return <></>;
  if (error || !Component) return <Error>Step not found: {filename}</Error>;

  try {
    return <Component attrs={attrs || {}} />;
  } catch (err) {
    return <Error>Render failed: {String(err)}</Error>;
  }
}

// Renderowanie widget'a workspace
function WidgetRenderer({ theme, widget }: { theme: string; widget: any }) {
  const { Component, loading, error } = useComponent(
    theme,
    "widgets",
    widget?.tplFile || ""
  );

  if (loading) return <></>;
  if (error || !Component)
    return <Error>Widget not found: {widget?.tplFile}</Error>;

  // ✅ NEW: Use cellClass from widget attrs, with fallback to col-span-1
  const cellClass = widget?.attrs?.cellClass || "col-span-1";

  try {
    return (
      <div className={cellClass}>
        <Component {...(widget || {})} />
      </div>
    );
  } catch (err) {
    return <Error>Widget render failed: {String(err)}</Error>;
  }
}