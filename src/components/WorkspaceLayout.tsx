// src/components/WorkspaceLayout.tsx (Fixed)
import { Suspense, memo } from "react";
import { useParams, Outlet } from "react-router-dom";
import { useConfig } from "@/ConfigProvider";
import { ThemeProvider } from "@/themes/ThemeContext";
import Loading from "./Loading";
import React from "react";

const WorkspaceLayout = memo(() => {
  const { config, preload } = useConfig();
  const { workspaceSlug = "" } = useParams<{ workspaceSlug?: string }>();

  // Handle missing workspace or config
  if (!config) return <Loading message="Ładowanie konfiguracji..." />;
  if (!workspaceSlug) return <div>Brak workspace</div>;

  // Find workspace in config
  const workspace = config.workspaces.find((w) => w.slug === workspaceSlug);
  if (!workspace) return <div>Workspace nie znaleziony</div>;

  // Get template directory and layout file
  const tpl = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  
  // Load layout component
  const AppLayout = preload.layout(tpl, layoutFile) as React.ComponentType<any>;

  return (
    <ThemeProvider value={tpl}>
      {/* 
        Use React.createElement instead of JSX to avoid the TypeScript error.
        This allows us to pass the context and children directly to AppLayout.
      */}
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