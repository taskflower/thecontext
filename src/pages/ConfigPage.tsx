/// src/pages/ConfigPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useConfig } from "../hooks";

export default function ConfigPage() {
  const { config, workspace, scenario, step } = useParams();
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
    const node = cfg.nodes.find((n: any) => n.slug === step) || cfg.nodes[0];
    const Step = React.lazy(() => import(`../themes/${theme}/steps/${node.tplFile}`));
    return (
      <React.Suspense fallback={<div>Loading step...</div>}>
        <Step attrs={node.attrs} />
      </React.Suspense>
    );
  }

  const widgets = cfg.templateSettings.widgets || [];
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {widgets.map((w: any, i: number) => {
        const Widget = React.lazy(() => import(`../themes/${theme}/widgets/${w.tplFile}`));
        return (
          <React.Suspense key={i} fallback={<div />}>   
            <Widget {...w.attrs} label={w.label} title={w.title} content={w.content} />
          </React.Suspense>
        );
      })}
    </div>
  );
}