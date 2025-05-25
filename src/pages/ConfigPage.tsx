// src/pages/ConfigPage.tsx
import { useConfig } from "@/core/engine";
import React from "react";
import { useParams } from "react-router-dom";

// Funkcja do renderowania błędów
const renderError = (message: string, details: string) => (
  <div className="text-center py-12">
    <div className="text-red-600 mb-4">{message}</div>
    <div className="text-sm text-gray-500">{details}</div>
  </div>
);

export default function ConfigPage() {
  const { config, workspace, scenario, step, id } = useParams();
  if (!config || !workspace) return renderError("Invalid path", "");

  const base = `/src/!CONFIGS/${config}`;
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

    const Step = React.lazy(
      () => import(`../themes/${theme}/steps/${node.tplFile}`)
    );
    return (
      <React.Suspense fallback={<></>}>
        <Step {...{ attrs: node.attrs, ticketId: id }} />
      </React.Suspense>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {cfg.templateSettings?.widgets?.map((widget: any, index: number) => {
        const Widget = React.lazy(
          () => import(`../themes/${theme}/widgets/${widget.tplFile}`)
        );
        return (
          <div
            key={index}
            className={`${
              widget.attrs?.colSpan === "full" ? "md:col-span-2" : ""
            }`}
          >
            <React.Suspense fallback={<></>}>
              <Widget {...widget} />
            </React.Suspense>
          </div>
        );
      })}
    </div>
  );
}
