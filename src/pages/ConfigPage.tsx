// src/pages/ConfigPage.tsx - Fixed hooks and component safety
import { useComponent, useConfig } from "@/core";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import type { AppConfig, WorkspaceConfig, ScenarioConfig } from "@/core/types";

const renderError = (message: string, details: string) => (
  <div className="text-center py-12">
    <div className="text-red-600 mb-4">{message}</div>
    <div className="text-sm text-gray-500">{details}</div>
  </div>
);

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { config, workspace } = useParams<{
    config: string;
    workspace: string;
  }>();

  const cfgName = useMemo(() => config || "exampleTicketApp", [config]);
  const workspaceName = useMemo(() => workspace || "main", [workspace]);

  const app = useConfig<AppConfig>(cfgName, `/src/_configs/${cfgName}/app.json`);
  const workspaceConfig = useConfig<WorkspaceConfig>(
    cfgName,
    `/src/_configs/${cfgName}/workspaces/${workspaceName}.json`
  );

  const layoutConfig = useMemo(() => {
    const theme = app?.tplDir || "test";
    const layoutFile = workspaceConfig?.templateSettings?.layoutFile || "Simple";
    return { theme, layoutFile };
  }, [app?.tplDir, workspaceConfig?.templateSettings?.layoutFile]);

  const {
    Component: Layout,
    loading,
    error,
  } = useComponent(layoutConfig.theme, "layouts", layoutConfig.layoutFile);

  if (loading) return <div>Loading layout...</div>;
  if (error) return <div>Layout error: {error}</div>;
  if (!Layout)
    return (
      <div>
        Layout not found: {layoutConfig.theme}/layouts/{layoutConfig.layoutFile}
      </div>
    );

  return <Layout>{children}</Layout>;
}

export default function ConfigPage() {
  const { config, workspace, scenario, step, id } = useParams<{
    config: string;
    workspace: string;
    scenario: string;
    step: string;
    id: string;
  }>();

  // Use defaults from app config if not provided
  const configName = config || "exampleTicketApp";
  const workspaceName = workspace || "tickets"; // Use tickets as default

  const base = `/src/_configs/${configName}`;
  const app = useConfig<AppConfig>(configName, `${base}/app.json`);
  
  // Load workspace config first
  const workspaceConfig = useConfig<WorkspaceConfig>(
    configName,
    `${base}/workspaces/${workspaceName}.json`
  );

  // Load scenario config only if scenario is specified
  const scenarioConfig = useConfig<ScenarioConfig>(
    configName,
    scenario ? `${base}/scenarios/${workspaceName}/${scenario}.json` : ""
  );

  if (!app) {
    return (
      <LayoutWrapper>
        <div>Loading app config...</div>
      </LayoutWrapper>
    );
  }

  // If no workspace config and using defaults, redirect to default workspace
  if (!workspaceConfig && !workspace) {
    const defaultPath = `/${configName}/${app.defaultWorkspace}`;
    window.location.href = defaultPath;
    return null;
  }

  if (!workspaceConfig) {
    return (
      <LayoutWrapper>
        {renderError("Workspace not found", `Workspace: ${workspaceName}`)}
      </LayoutWrapper>
    );
  }

  const theme = app.tplDir;

  // Handle scenario rendering
  if (scenario) {
    if (!scenarioConfig) {
      return (
        <LayoutWrapper>
          <div>Loading scenario...</div>
        </LayoutWrapper>
      );
    }

    if (!scenarioConfig.nodes || !scenarioConfig.nodes.length) {
      return (
        <LayoutWrapper>
          {renderError(
            "Invalid scenario configuration",
            `Scenario: ${scenario}, Step: ${step}, ID: ${id}`
          )}
        </LayoutWrapper>
      );
    }

    // Determine current step
    const currentStep = id ? "form" : step || scenarioConfig.nodes[0].slug;
    const node = scenarioConfig.nodes.find((n) => n.slug === currentStep) || scenarioConfig.nodes[0];

    if (!node) {
      return (
        <LayoutWrapper>
          {renderError(
            "Step not found in scenario",
            `Step: ${currentStep}, Available: ${scenarioConfig.nodes.map(n => n.slug).join(', ')}`
          )}
        </LayoutWrapper>
      );
    }

    return (
      <LayoutWrapper>
        <StepRenderer
          theme={theme}
          filename={node.tplFile}
          attrs={node.attrs}
          ticketId={id}
          key={`${currentStep}-${id || 'new'}`} // ✅ Add key to force remount on navigation
        />
      </LayoutWrapper>
    );
  }

  // Handle workspace rendering (grid layout)
  return (
    <LayoutWrapper>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {workspaceConfig.templateSettings?.widgets?.map((widget, index) => (
          <WidgetRenderer key={`widget-${index}`} theme={theme} widget={widget} />
        ))}
      </div>
    </LayoutWrapper>
  );
}

function StepRenderer({ theme, filename, attrs, ticketId }: {
  theme: string;
  filename: string;
  attrs: any;
  ticketId?: string;
}) {
  const { Component, loading, error } = useComponent(theme, "steps", filename);

  if (loading) return <div className="text-gray-100">Loading step...</div>;
  if (error) return renderError("Step not found", error);
  if (!Component)
    return renderError("Step component missing", `${theme}/steps/${filename}`);

  // ✅ Safety check: ensure Component exists and attrs is valid before rendering
  try {
    return <Component attrs={attrs || {}} ticketId={ticketId} />;
  } catch (renderError) {
    console.error("Component render error:", renderError);
    return renderError("Component render failed", String(renderError));
  }
}

function WidgetRenderer({ theme, widget }: { theme: string; widget: any }) {
  const { Component, loading, error } = useComponent(
    theme,
    "widgets",
    widget?.tplFile || ""
  );

  if (loading) return <div className="text-gray-100">Loading widget...</div>;
  if (error) return renderError("Widget not found", error);
  if (!Component)
    return renderError(
      "Widget component missing",
      `${theme}/widgets/${widget?.tplFile}`
    );

  const getColSpanClass = (colSpan: string | number) => {
    switch (colSpan) {
      case "full":
      case 6:
        return "col-span-full";
      case 5:
        return "col-span-5";
      case 4:
        return "col-span-4";
      case 3:
        return "col-span-3";
      case 2:
        return "col-span-2";
      case 1:
      default:
        return "col-span-1";
    }
  };

  // ✅ Safety check: ensure widget and attrs exist
  try {
    return (
      <div className={getColSpanClass(widget?.attrs?.colSpan || 1)}>
        <Component {...(widget || {})} />
      </div>
    );
  } catch (renderError) {
    console.error("Widget render error:", renderError);
    return renderError("Widget render failed", String(renderError));
  }
}