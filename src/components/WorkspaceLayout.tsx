// src/components/WorkspaceLayout.tsx
import { Suspense, memo, useMemo } from "react";
import { useParams, Outlet } from "react-router-dom";
import { AppConfig, useLayout } from "@/core";
import { ThemeProvider } from "@/themes/ThemeContext";
import { Loading } from ".";


interface WorkspaceLayoutProps {
  config: AppConfig;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = memo(({ config }) => {
  const { workspaceSlug = "" } = useParams<{ workspaceSlug?: string }>();

  if (!workspaceSlug) {
    return <div>Brak workspace</div>;
  }

  const workspace = useMemo(() => 
    config.workspaces.find((w) => w.slug === workspaceSlug),
    [config.workspaces, workspaceSlug]
  );

  if (!workspace) {
    return <div>Workspace nie znaleziony</div>;
  }

  const tpl = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  
  const AppLayout = useLayout<{ children?: React.ReactNode; context?: any }>(
    tpl,
    layoutFile
  );

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