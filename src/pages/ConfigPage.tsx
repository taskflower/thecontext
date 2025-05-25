// src/pages/ConfigPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useConfig } from "../hooks";

export default function ConfigPage() {
  const { config, workspace, scenario, step, id } = useParams();

  if (!config || !workspace) return <div>Invalid path</div>;

  const base = `/src/!CONFIGS/${config}`;
  const appPath = `${base}/app.json`;
  const cfgPath = scenario
    ? `${base}/scenarios/${workspace}/${scenario}.json`
    : `${base}/workspaces/${workspace}.json`;

  const app = useConfig<any>(config, appPath);
  const cfg = useConfig<any>(config, cfgPath);

  if (!app) return <div>Loading app config...</div>;
  if (!cfg) return <div>Loading config...</div>;

  const theme = app.tplDir;

  if (scenario) {
    if (!cfg.nodes || !Array.isArray(cfg.nodes) || cfg.nodes.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Błąd konfiguracji scenariusza</div>
          <div className="text-sm text-gray-500">
            Scenario: {scenario}, Step: {step}, ID: {id}
          </div>
          <div className="text-sm text-gray-500">Config path: {cfgPath}</div>
        </div>
      );
    }

    // POPRAWKA: Jeśli mamy ID w URL, to traktujemy go jako step=form (domyślny step edycji)
    // a ID przekazujemy jako parametr
    const currentStep = id ? 'form' : step;
    const node = cfg.nodes.find((n: any) => n.slug === currentStep) || cfg.nodes[0];
    
    if (!node) {
      return (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Krok nie został znaleziony</div>
          <div className="text-sm text-gray-500">Step: {currentStep}, ID: {id}</div>
        </div>
      );
    }

    const Step = React.lazy(
      () => import(`../themes/${theme}/steps/${node.tplFile}`)
    );

    // POPRAWKA: Przekazujemy ID jako props jeśli istnieje
    const stepProps = {
      attrs: node.attrs,
      ...(id && { ticketId: id }) // Dodajemy ticketId jeśli mamy ID w URL
    };

    return (
      <React.Suspense fallback={<div>Loading step...</div>}>
        <Step {...stepProps} />
      </React.Suspense>
    );
  }

  const widgets = cfg.templateSettings?.widgets || [];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {widgets.map((widget: any, index: number) => {
        const Widget = React.lazy(
          () => import(`../themes/${theme}/widgets/${widget.tplFile}`)
        );

        const widgetProps = {
          title: widget.title,
          attrs: widget.attrs,
        };

        return (
          <div
            key={index}
            className={`${
              widget.attrs?.colSpan === "full" ? "md:col-span-2" : ""
            }`}
          >
            <React.Suspense fallback={<div>Loading widget...</div>}>
              <Widget {...widgetProps} />
            </React.Suspense>
          </div>
        );
      })}
    </div>
  );
}