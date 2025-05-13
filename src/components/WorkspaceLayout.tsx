// src/components/WorkspaceLayout.tsx
import React, { Suspense } from "react";
import { useParams, Outlet } from "react-router-dom";
import { AppConfig, useLayout } from "@/core";
import { ThemeProvider } from "@/themes/ThemeContext";

import Loading from "./Loading";

interface WorkspaceLayoutProps {
  config: AppConfig;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ config }) => {
  const { workspaceSlug = "" } = useParams<{ workspaceSlug?: string }>();

  if (!workspaceSlug) {
    return <div>Brak workspace</div>;
  }

  const workspace = config.workspaces.find((w) => w.slug === workspaceSlug);
  if (!workspace) {
    return <div>Workspace nie znaleziony</div>;
  }

  const tpl = workspace.templateSettings?.tplDir || config.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = useLayout<{ children?: React.ReactNode; context?: any }>(
    tpl,
    layoutFile
  );

  const layoutContext = { workspace };

  return (
    <ThemeProvider value={tpl}>
      <AppLayout context={layoutContext}>
        <Suspense fallback={<Loading message="Ładowanie zawartości…" />}>
          <Outlet />
        </Suspense>
      </AppLayout>
    </ThemeProvider>
  );
};

export default WorkspaceLayout;
