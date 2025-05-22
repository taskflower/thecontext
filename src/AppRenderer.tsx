// AppRenderer.tsx
import { Navigate } from "react-router-dom";
import { useAppNavigation, useConfig, useDynamicComponent } from "./engine";
import { AppConfig, ScenarioConfig, WorkspaceConfig } from "./engine/types";
import { WidgetContainer } from "./engine/components/WidgetContainer";
export const P = "/src/configs";
export const Lc = "text-8xl font-black text-gray-50/30";

export const AppRenderer = () => {
  const { config, workspace, scenario, step } = useAppNavigation();

  // Jeden centralny log
  console.log("🎯 ROUTE:", {
    url: window.location.pathname,
    params: { config, workspace, scenario, step },
    renderType: step ? "STEP" : scenario ? "SCENARIO" : "WORKSPACE",
  });

  if (step) return <StepRenderer />;
  if (scenario) return <ScenarioRenderer />;
  return <WorkspaceRenderer />;
};

const WorkspaceRenderer = () => {
  const { config, workspace } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(`${P}/${config}/app.json`);
  const { config: workspaceConfig, loading } = useConfig<WorkspaceConfig>(
    `${P}/${config}/workspaces/${workspace}.json`
  );

  const LayoutComponent = useDynamicComponent(
    appConfig?.tplDir ? `themes/${appConfig.tplDir}/layouts` : undefined,
    workspaceConfig?.templateSettings?.layoutFile
  );

  if (loading) return <div className={Lc}>Loading workspace...</div>;
  if (!LayoutComponent) return <div className={Lc}>Layout not found</div>;

  return (
    <LayoutComponent>
      <WidgetContainer
        widgets={workspaceConfig?.templateSettings?.widgets || []}
        templateDir={appConfig?.tplDir}
      />
    </LayoutComponent>
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

const StepRenderer = () => {
  const { config, workspace, scenario, step } = useAppNavigation();
  const { config: appConfig } = useConfig<AppConfig>(`${P}/${config}/app.json`);
  const { config: scenarioConfig, loading } = useConfig<ScenarioConfig>(
    `${P}/${config}/scenarios/${workspace}/${scenario}.json`
  );

  const stepConfig = scenarioConfig?.nodes.find((node) => node.slug === step);
  const StepComponent = useDynamicComponent(
    appConfig?.tplDir ? `themes/${appConfig.tplDir}/steps` : undefined,
    stepConfig?.tplFile
  );

  if (loading) return <div>Loading step...</div>;
  if (!stepConfig || !StepComponent) return <div>Step not found: {step}</div>;

  return <StepComponent {...stepConfig} />;
};
