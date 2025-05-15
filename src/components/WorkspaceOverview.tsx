// src/components/WorkspaceOverview.tsx
import React, { memo } from "react";
import { useParams } from "react-router-dom";
import { useConfig } from "@/ConfigProvider";
import { useComponent } from "@/core";
import { withSuspense } from ".";

const RawWorkspaceOverview: React.FC = memo(() => {
  const { config } = useConfig();
  const { workspaceSlug = "" } = useParams<{ workspaceSlug: string }>();
  
  const workspace = config.workspaces.find((w) => w.slug === workspaceSlug);
  if (!workspace) {
    return <div>Workspace nie znaleziony</div>;
  }

  const tplDir = workspace.templateSettings?.tplDir || config.tplDir;
  const WidgetsStep = useComponent(tplDir, "WidgetsStep");

  const widgets = (workspace.templateSettings?.widgets || []).map((w: any) => ({
    ...w,
    config,
    workspaceSlug,
  }));

  return (
    <WidgetsStep
      widgets={widgets}
      onSubmit={() => {}}
      title={workspace.name}
      subtitle={workspace.description}
      saveToDB={null}
      scenarioName={null}
      nodeSlug={null}
      schema={null}
      data={null}
    />
  );
});

export default withSuspense(
  React.lazy(() => Promise.resolve({ default: RawWorkspaceOverview })),
  'Ładowanie workspace…'
);
