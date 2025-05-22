// AppRenderer.tsx - cache in component
import { Navigate } from "react-router-dom";
import { useAppNavigation, useConfig, useDynamicComponent } from "./engine";
import { AppConfig, ScenarioConfig, WorkspaceConfig } from "./engine/types";
import { WidgetContainer } from "./engine/components/WidgetContainer";

export const P = "/src/configs";
export const Lc = "text-8xl font-black text-gray-50/30";

// Global cache outside components
const layoutCache = new Map();

export const AppRenderer = () => {
  const { scenario, step } = useAppNavigation();

  if (step) return <StepRenderer />;
  if (scenario) return <ScenarioRenderer />;
  return <WorkspaceRenderer />;
};

const StepRenderer = () => {
  const { config, workspace, scenario, step } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(`${P}/${config}/app.json`);
  const { config: scenarioConfig, loading } = useConfig<ScenarioConfig>(
    `${P}/${config}/scenarios/${workspace}/${scenario}.json`
  );

  const stepConfig = scenarioConfig?.nodes.find((node) => node.slug === step);

  // Cache layout per workspace
  const cacheKey = `${config}/${workspace}`;
  const cachedLayout = layoutCache.get(cacheKey);

  const { config: workspaceConfig } = useConfig<WorkspaceConfig>(
    `${P}/${config}/workspaces/${workspace}.json`
  );

  const LayoutComponent = useDynamicComponent(
    appConfig?.tplDir ? `themes/${appConfig.tplDir}/layouts` : undefined,
    workspaceConfig?.templateSettings?.layoutFile
  );

  // Cache the layout
  if (LayoutComponent && !cachedLayout) {
    layoutCache.set(cacheKey, LayoutComponent);
  }

  const FinalLayout = cachedLayout || LayoutComponent;

  const StepComponent = useDynamicComponent(
    appConfig?.tplDir ? `themes/${appConfig.tplDir}/steps` : undefined,
    stepConfig?.tplFile
  );

  if (loading || !FinalLayout) return <div>Loading...</div>;
  if (!stepConfig || !StepComponent) return <div>Step not found: {step}</div>;

  return (
    <FinalLayout>
      <StepComponent {...stepConfig} />
    </FinalLayout>
  );
};

const ScenarioRenderer = () => {
  const { config, workspace, scenario } = useAppNavigation();
  const { config: scenarioConfig, loading } = useConfig<ScenarioConfig>(
    `${P}/${config}/scenarios/${workspace}/${scenario}.json`
  );

  if (loading) return <div className={Lc}>Loading scenario...</div>;
  if (!scenarioConfig?.nodes?.length)
    return <div className={Lc}>Scenario not found</div>;

  return (
    <Navigate
      to={`/${config}/${workspace}/${scenario}/${scenarioConfig.nodes[0].slug}`}
      replace
    />
  );
};

const WorkspaceRenderer = () => {
  const { config, workspace } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(`${P}/${config}/app.json`);
  const { config: workspaceConfig, loading } = useConfig<WorkspaceConfig>(
    `${P}/${config}/workspaces/${workspace}.json`
  );

  // Use cached layout
  const cacheKey = `${config}/${workspace}`;
  const cachedLayout = layoutCache.get(cacheKey);

  const LayoutComponent = useDynamicComponent(
    appConfig?.tplDir ? `themes/${appConfig.tplDir}/layouts` : undefined,
    workspaceConfig?.templateSettings?.layoutFile
  );

  if (LayoutComponent && !cachedLayout) {
    layoutCache.set(cacheKey, LayoutComponent);
  }

  const FinalLayout = cachedLayout || LayoutComponent;

  if (loading || !FinalLayout)
    return <div className={Lc}>Loading workspace...</div>;

  return (
    <FinalLayout>
      <WidgetContainer
        widgets={workspaceConfig?.templateSettings?.widgets || []}
        templateDir={appConfig?.tplDir}
      />
    </FinalLayout>
  );
};
