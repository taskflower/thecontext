// src/pages/ConfigPage.tsx - Zaktualizowana wersja z LayoutWrapper
import { useComponent, useConfig } from "@/core/engine";
import { useParams } from "react-router-dom";
import { useMemo } from "react";

const renderError = (message: string, details: string) => (
  <div className="text-center py-12">
    <div className="text-red-600 mb-4">{message}</div>
    <div className="text-sm text-gray-500">{details}</div>
  </div>
);

// LayoutWrapper przeniesiony z App.tsx
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { config, workspace } = useParams<{ config: string; workspace: string }>();
  
  // Memoize config name to prevent re-renders
  const cfgName = useMemo(() => config || "exampleTicketApp", [config]);
  const workspaceName = useMemo(() => workspace || "main", [workspace]);
  
  const app = useConfig<any>(cfgName, `/src/_configs/${cfgName}/app.json`);
  const workspaceConfig = useConfig<any>(
    cfgName, 
    `/src/_configs/${cfgName}/workspaces/${workspaceName}.json`
  );
  
  // Memoize layout configuration - tylko te wartości mają wpływ na layout
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
  if (!Layout) return <div>Layout not found: {layoutConfig.theme}/layouts/{layoutConfig.layoutFile}</div>;

  return (
    <Layout>
      {children}
    </Layout>
  );
}

export default function ConfigPage() {
  const { config, workspace, scenario, step, id } = useParams();

  if (!config || !workspace) return renderError("Invalid path", "");

  const base = `/src/_configs/${config}`;
  const app = useConfig<any>(config, `${base}/app.json`);
  const cfg = useConfig<any>(
    config,
    scenario
      ? `${base}/scenarios/${workspace}/${scenario}.json`
      : `${base}/workspaces/${workspace}.json`
  );

  if (!app || !cfg) return (
    <LayoutWrapper>
      <div>Loading config...</div>
    </LayoutWrapper>
  );

  const theme = app.tplDir;

  if (scenario) {
    if (!cfg.nodes || !cfg.nodes.length) {
      return (
        <LayoutWrapper>
          {renderError(
            "Błąd konfiguracji scenariusza",
            `Scenario: ${scenario}, Step: ${step}, ID: ${id}`
          )}
        </LayoutWrapper>
      );
    }

    const currentStep = id ? "form" : step;
    const node =
      cfg.nodes.find((n: any) => n.slug === currentStep) || cfg.nodes[0];

    if (!node) {
      return (
        <LayoutWrapper>
          {renderError(
            "Krok nie został znaleziony",
            `Step: ${currentStep}, ID: ${id}`
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
        />
      </LayoutWrapper>
    );
  }

  // Grid 6-kolumnowy z elastycznym układem
  return (
    <LayoutWrapper>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {cfg.templateSettings?.widgets?.map((widget: any, index: number) => (
          <WidgetRenderer key={index} theme={theme} widget={widget} />
        ))}
      </div>
    </LayoutWrapper>
  );
}

function StepRenderer({ theme, filename, attrs, ticketId }: any) {
  const { Component, loading, error } = useComponent(theme, "steps", filename);

  if (loading) return <div>Loading step...</div>;
  if (error) return renderError("Step not found", error);
  if (!Component)
    return renderError("Step component missing", `${theme}/steps/${filename}`);

  return <Component attrs={attrs} ticketId={ticketId} />;
}

function WidgetRenderer({ theme, widget }: { theme: string; widget: any }) {
  const { Component, loading, error } = useComponent(
    theme,
    "widgets",
    widget.tplFile
  );

  if (loading) return <div>Loading widget...</div>;
  if (error) return renderError("Widget not found", error);
  if (!Component)
    return renderError(
      "Widget component missing",
      `${theme}/widgets/${widget.tplFile}`
    );

  const getColSpanClass = (colSpan: string | number) => {
    switch (colSpan) {
      case "full":
      case 6:
        return "col-span-full"; // pełna szerokość
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

  return (
    <div className={getColSpanClass(widget.attrs?.colSpan || 1)}>
      <Component {...widget} />
    </div>
  );
}