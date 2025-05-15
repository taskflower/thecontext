// src/components/WorkspaceLayout.tsx
import { Suspense, memo, useMemo } from "react";
import { useParams, Outlet } from "react-router-dom";
import { useConfig } from "@/ConfigProvider";
import { ThemeProvider } from "@/themes/ThemeContext";
import Loading from "./Loading";
import React from "react";

const WorkspaceLayout = memo(() => {
  const { config } = useConfig();
  const { workspaceSlug = "" } = useParams<{ workspaceSlug?: string }>();

  if (!workspaceSlug) return <div>Brak workspace</div>;

  const workspace = useMemo(
    () => config?.workspaces.find((w) => w.slug === workspaceSlug),
    [config, workspaceSlug]
  );
  if (!workspace) return <div>Workspace nie znaleziony</div>;

  const tpl = workspace.templateSettings?.tplDir || config!.tplDir;
  const layoutFile = workspace.templateSettings?.layoutFile || "Simple";
  const AppLayout = React.useMemo(
    () => useConfig().preload.layout(tpl, layoutFile),
    [tpl, layoutFile]
  );

  return (
    <ThemeProvider value={tpl}>
      <AppLayout context={{ workspace }}>
        <Suspense fallback={<Loading message="Ładowanie zawartości…" />}>
          <Outlet />
        </Suspense>
      </AppLayout>
    </ThemeProvider>
  );
});

export default WorkspaceLayout;
