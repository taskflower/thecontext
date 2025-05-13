// src/components/WorkspaceLayout.tsx
import React, { Suspense, memo, useMemo } from "react";
import { useParams, Outlet } from "react-router-dom";
import { AppConfig, useLayout } from "@/core";
import { ThemeProvider } from "@/themes/ThemeContext";
import Loading from "./Loading";

interface WorkspaceLayoutProps {
  config: AppConfig;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = memo(({ config }) => {
  const { workspaceSlug = "" } = useParams<{ workspaceSlug?: string }>();

  if (!workspaceSlug) {
    return <div>Brak workspace</div>;
  }

  // Memoizacja znalezionego workspace
  const workspace = useMemo(() => 
    config.workspaces.find((w) => w.slug === workspaceSlug),
    [config.workspaces, workspaceSlug]
  );

  if (!workspace) {
    return <div>Workspace nie znaleziony</div>;
  }

  // Memoizacja wartości tpl i layoutFile
  const tpl = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  
  // Pobranie komponentu layoutu
  const AppLayout = useLayout<{ children?: React.ReactNode; context?: any }>(
    tpl,
    layoutFile
  );

  // Memoizacja kontekstu layoutu
  const layoutContext = useMemo(() => ({ workspace }), [workspace]);

  return (
    <ThemeProvider value={tpl}>
      <AppLayout context={layoutContext}>
        <Suspense fallback={<Loading message="Ładowanie zawartości…" />}>
          <Outlet />
        </Suspense>
      </AppLayout>
    </ThemeProvider>
  );
});

export default WorkspaceLayout;