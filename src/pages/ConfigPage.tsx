// src/pages/ConfigPage.tsx - Zaktualizowana wersja z poprawnym gridem
import { useComponent, useConfig } from "@/core/engine";
import { useParams } from "react-router-dom";

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
    const node =
      cfg.nodes.find((n: any) => n.slug === currentStep) || cfg.nodes[0];

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

  // Opcja 1: Grid 6-kolumnowy z elastycznym układem
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {cfg.templateSettings?.widgets?.map((widget: any, index: number) => (
        <WidgetRenderer key={index} theme={theme} widget={widget} />
      ))}
    </div>
  );

  // Opcja 2: Jeśli wolisz flexbox z fraction classes
  // return (
  //   <div className="flex flex-wrap gap-4">
  //     {cfg.templateSettings?.widgets?.map((widget: any, index: number) => (
  //       <WidgetRenderer
  //         key={index}
  //         theme={theme}
  //         widget={widget}
  //       />
  //     ))}
  //   </div>
  // );
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

  // Opcja z fraction classes (alternatywa)
  const getFractionClass = (colSpan: string | number) => {
    switch (colSpan) {
      case "full":
      case 6:
        return "w-full";
      case 5:
        return "w-5/6";
      case 4:
        return "w-2/3";
      case 3:
        return "w-1/2";
      case 2:
        return "w-1/3";
      case 1:
      default:
        return "w-1/6 min-w-48"; // minimum width dla małych elementów
    }
  };

  return (
    <div className={getColSpanClass(widget.attrs?.colSpan || 1)}>
      <Component {...widget} />
    </div>
  );

  // Alternatywnie z fraction classes:
  // return (
  //   <div className={getFractionClass(widget.attrs?.colSpan || 1)}>
  //     <Component {...widget} />
  //   </div>
  // );
}
