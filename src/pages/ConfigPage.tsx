// src/pages/ConfigPage.tsx - SIMPLIFIED VERSION with scenario/node structure
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
  const { config, workspace, scenario, node, id } = useParams<{
    config: string;
    workspace: string;
    scenario: string;
    node: string;
    id: string;
  }>();

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

  // Loading states
  if (!app || layoutLoading) return <div>Loading...</div>;
  if (!workspaceConfig) return <Error>Workspace not found: {workspace}</Error>;
  if (!Layout) return <Error>Layout not found: {layoutFile}</Error>;

  // Scenario mode: /:config/:workspace/:scenario/:node
  if (scenario) {
    if (!scenarioConfig) {
      return (
        <Layout>
          <div>Loading scenario...</div>
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
      ? scenarioConfig.nodes.find(n => n.slug === node) || scenarioConfig.nodes[0]
      : scenarioConfig.nodes[0];

    return (
      <Layout>
        <StepRenderer
          theme={theme}
          filename={selectedNode.tplFile}
          attrs={selectedNode.attrs}
          recordId={id}
          key={`${scenario}-${selectedNode.slug}-${id || "new"}`}
        />
      </Layout>
    );
  }

  // Workspace mode: /:config/:workspace (grid z widgets)
  return (
    <Layout>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
  
  if (loading) return <div>Loading step...</div>;
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
  
  if (loading) return <div>Loading widget...</div>;
  if (error || !Component) return <Error>Widget not found: {widget?.tplFile}</Error>;

  // Grid styling
  const colSpanMap: Record<string | number, string> = {
    full: "col-span-full",
    6: "col-span-full",
    5: "col-span-5",
    4: "col-span-4",
    3: "col-span-3",
    2: "col-span-2",
    1: "col-span-1",
  };

  const colStartMap: Record<string | number, string> = {
    1: "col-start-1",
    2: "col-start-2", 
    3: "col-start-3",
    4: "col-start-4",
    5: "col-start-5",
    6: "col-start-6",
    7: "col-start-7",
    auto: "col-start-auto",
  };

  const colSpan = widget?.attrs?.colSpan || 1;
  const colStart = widget?.attrs?.colStart;

  const spanClass = colSpanMap[colSpan] || "col-span-1";
  const startClass = colStart ? (colStartMap[colStart] || "") : "";
  const combinedClasses = [spanClass, startClass].filter(Boolean).join(" ");

  try {
    return (
      <div className={combinedClasses}>
        <Component {...(widget || {})} />
      </div>
    );
  } catch (err) {
    return <Error>Widget render failed: {String(err)}</Error>;
  }
}