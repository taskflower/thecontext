// src/components/WorkspaceLayout.tsx
import React, { Suspense, memo } from "react";
import { useParams, Outlet } from "react-router-dom";
import { useConfig } from "@/ConfigProvider";
import { ThemeProvider } from "@/themes/ThemeContext";
import Loading from "./Loading";

const WorkspaceLayout = memo(() => {
  const { config, preload } = useConfig();
  const { workspaceSlug = "" } = useParams<{ workspaceSlug?: string }>();

  console.log("🏢 WorkspaceLayout render:", {
    config: !!config,
    workspaces: config?.workspaces?.length || 0,
    workspaceSlug,
  });

  if (!config) return <Loading message="Ładowanie konfiguracji..." />;
  if (!workspaceSlug) return <>Brak workspace</>;

  const workspace = config.workspaces?.find((w) => w.slug === workspaceSlug);
  if (!workspace) return <>Workspace nie znaleziony</>;

  const tpl = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = preload.layout(tpl, layoutFile) as React.ComponentType<any>;

  return (
    // Łapiemy lazy-ładowanie layoutu
    <Suspense fallback={<Loading message="Ładowanie layoutu…" />}>
      <ThemeProvider value={tpl}>
        {React.createElement(
          AppLayout,
          { context: { workspace } },
          // Łapiemy ładowanie zawartości w Outlet
          <Suspense fallback={<Loading message="Ładowanie zawartości…" />}>
            <Outlet />
          </Suspense>
        )}
      </ThemeProvider>
    </Suspense>
  );
});

WorkspaceLayout.displayName = "WorkspaceLayout";

export default WorkspaceLayout;
