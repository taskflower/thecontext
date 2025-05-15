// src/components/WorkspaceLayout.tsx
import { Suspense, memo } from "react";
import { useParams, Outlet } from "react-router-dom";
import { useConfig } from "@/ConfigProvider";
import { ThemeProvider } from "@/themes/ThemeContext";
import Loading from "./Loading";
import React from "react";

const WorkspaceLayout = memo(() => {
  const { config, preload } = useConfig();
  const { workspaceSlug = "" } = useParams<{ workspaceSlug?: string }>();

  if (!config) return <Loading message="Ładowanie konfiguracji..." />;
  if (!workspaceSlug) return <>Brak workspace</>;

  const workspace = config.workspaces.find((w) => w.slug === workspaceSlug);
  if (!workspace) return <>Workspace nie znaleziony</>;
  const tpl = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = preload.layout(tpl, layoutFile) as React.ComponentType<any>;

  return (
    <ThemeProvider value={tpl}>
      {React.createElement(
        AppLayout,
        { context: { workspace } },
        <Suspense fallback={<Loading message="Ładowanie zawartości…" />}>
          <Outlet />
        </Suspense>
      )}
    </ThemeProvider>
  );
});

export default WorkspaceLayout;
