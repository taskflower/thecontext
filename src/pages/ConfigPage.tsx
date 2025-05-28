// src/pages/ConfigPage.tsx - FIXED ROUTING LOGIC
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
  const { config, workspace, scenario, action, step, id } = useParams<{
    config: string;
    workspace: string;
    scenario: string;
    action: string;
    step: string;
    id: string;
  }>();

  const configName = config || "exampleTicketApp";
  const workspaceName = workspace || "tickets";
  const base = `/src/_configs/${configName}`;

  const app = useConfig<AppConfig>(configName, `${base}/app.json`);
  const workspaceConfig = useConfig<WorkspaceConfig>(
    configName,
    `${base}/workspaces/${workspaceName}.json`
  );
  const scenarioConfig = useConfig<ScenarioConfig>(
    configName,
    scenario ? `${base}/scenarios/${workspaceName}/${scenario}.json` : ""
  );

  // Memoized layout config
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
  if (!workspaceConfig)
    return <Error>Workspace not found: {workspaceName}</Error>;
  if (!Layout) return <Error>Layout not found: {layoutFile}</Error>;

  // Handle scenario rendering
  if (scenario) {
    if (!scenarioConfig)
      return (
        <Layout>
          <div>Loading scenario...</div>
        </Layout>
      );
    if (!scenarioConfig.nodes?.length)
      return (
        <Layout>
          <Error>Invalid scenario: {scenario}</Error>
        </Layout>
      );

    // 🔥 FIXED ROUTING LOGIC
    console.log("=== DEBUGGING STEP SELECTION ===");
    console.log("URL params:", {
      config,
      workspace,
      scenario,
      action,
      step,
      id,
    });
    console.log(
      "Available nodes:",
      scenarioConfig.nodes.map((n) => n.slug)
    );
    console.log("action param:", action);
    console.log("step param:", step);
    console.log("id param:", id);

    // 🔥 FIXED: Proper step detection logic
    let actualStep;

    if (step) {
      // Jeśli mamy step param, użyj go
      actualStep = step;
      console.log("Using step param:", actualStep);
    } else if (action && scenarioConfig.nodes.find((n) => n.slug === action)) {
      // Jeśli action to slug istniejącego node'a, użyj action jako step
      actualStep = action;
      console.log("Using action as step:", actualStep);
    } else if (action === "step" && id) {
      // Jeśli action="step" i mamy id, użyj id jako step (routing bug fix)
      actualStep = id;
      console.log("Routing bug fix - using id as step:", actualStep);
    } else if (id === "new") {
      // Jeśli id="new", użyj pierwszego node'a
      actualStep = scenarioConfig.nodes[0].slug;
      console.log("New item - using first node:", actualStep);
    } else if (id) {
      // Jeśli mamy id ale nie "new", prawdopodobnie edytujemy
      actualStep = step || "form";
      console.log("Edit mode - using step or form:", actualStep);
    } else {
      // Fallback do pierwszego node'a
      actualStep = scenarioConfig.nodes[0].slug;
      console.log("Fallback to first node:", actualStep);
    }

    const node =
      scenarioConfig.nodes.find((n) => n.slug === actualStep) ||
      scenarioConfig.nodes[0];
    console.log("Selected node:", node?.slug, "with tplFile:", node?.tplFile);
    console.log("=== END DEBUG ===");

    return (
      <Layout>
        <StepRenderer
          theme={theme}
          filename={node.tplFile}
          attrs={node.attrs}
          ticketId={action === "step" ? undefined : id}
          key={`${actualStep}-${id || "new"}`}
        />
      </Layout>
    );
  }

  // Handle workspace grid
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

// Compact components
function StepRenderer({
  theme,
  filename,
  attrs,
  ticketId,
}: {
  theme: string;
  filename: string;
  attrs: any;
  ticketId?: string;
}) {
  const { Component, loading, error } = useComponent(theme, "steps", filename);
  if (loading) return <div>Loading step...</div>;
  if (error || !Component) return <Error>Step not found: {filename}</Error>;

  try {
    return <Component attrs={attrs || {}} ticketId={ticketId} />;
  } catch (err) {
    return <Error>Render failed: {String(err)}</Error>;
  }
}

function WidgetRenderer({ theme, widget }: { theme: string; widget: any }) {
  const { Component, loading, error } = useComponent(
    theme,
    "widgets",
    widget?.tplFile || ""
  );
  if (loading) return <div>Loading widget...</div>;
  if (error || !Component)
    return <Error>Widget not found: {widget?.tplFile}</Error>;

  const colSpanMap: Record<string | number, string> = {
    full: "col-span-full",
    6: "col-span-full",
    5: "col-span-5",
    4: "col-span-4",
    3: "col-span-3",
    2: "col-span-2",
    1: "col-span-1",
  };

  try {
    return (
      <div className={colSpanMap[widget?.attrs?.colSpan || 1] || "col-span-1"}>
        <Component {...(widget || {})} />
      </div>
    );
  } catch (err) {
    return <Error>Widget render failed: {String(err)}</Error>;
  }
}
