// src/pages/ConfigPage.tsx - Zaktualizowana wersja
import { useConfig } from "@/core/engine";
import { useParams } from "react-router-dom";
import { useComponent } from "@/core/ComponentLoader";

const renderError = (message: string, details: string) => (
  <div className="text-center py-12">
    <div className="text-red-600 mb-4">{message}</div>
    <div className="text-sm text-gray-500">{details}</div>
  </div>
);

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
  
  if (!app || !cfg) return <div>Loading config...</div>;
  
  const theme = app.tplDir;
  
  if (scenario) {
    if (!cfg.nodes || !cfg.nodes.length) {
      return renderError(
        "Błąd konfiguracji scenariusza",
        `Scenario: ${scenario}, Step: ${step}, ID: ${id}`
      );
    }
    
    const currentStep = id ? "form" : step;
    const node = cfg.nodes.find((n: any) => n.slug === currentStep) || cfg.nodes[0];
    
    if (!node) {
      return renderError(
        "Krok nie został znaleziony",
        `Step: ${currentStep}, ID: ${id}`
      );
    }
    
    return (
      <StepRenderer 
        theme={theme}
        filename={node.tplFile}
        attrs={node.attrs}
        ticketId={id}
      />
    );
  }
  
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {cfg.templateSettings?.widgets?.map((widget: any, index: number) => (
        <WidgetRenderer
          key={index}
          theme={theme}
          widget={widget}
        />
      ))}
    </div>
  );
}

function StepRenderer({ theme, filename, attrs, ticketId }: any) {
  const { Component, loading, error } = useComponent(theme, 'steps', filename);
  
  if (loading) return <div>Loading step...</div>;
  if (error) return renderError("Step not found", error);
  if (!Component) return renderError("Step component missing", `${theme}/steps/${filename}`);
  
  return <Component attrs={attrs} ticketId={ticketId} />;
}

function WidgetRenderer({ theme, widget }: { theme: string; widget: any }) {
  const { Component, loading, error } = useComponent(theme, 'widgets', widget.tplFile);
  
  if (loading) return <div>Loading widget...</div>;
  if (error) return renderError("Widget not found", error);
  if (!Component) return renderError("Widget component missing", `${theme}/widgets/${widget.tplFile}`);
  
  return (
    <div className={widget.attrs?.colSpan === "full" ? "md:col-span-2" : ""}>
      <Component {...widget} />
    </div>
  );
}
