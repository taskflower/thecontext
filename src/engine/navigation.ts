// engine/navigation.ts
import { useParams, useNavigate } from "react-router-dom";
import { useConfig } from "./core";
import type { AppParams, ScenarioConfig } from "./types";

export const useAppNavigation = () => {
  const { config, workspace, scenario, step } = useParams<AppParams>();
  const navigate = useNavigate();
  
  // Ładowanie konfiguracji bieżącego scenariusza dla nawigacji @next/@prev
  const { config: scenarioConfig } = useConfig<ScenarioConfig>(
    scenario ? `/src/configs/${config}/scenarios/${workspace}/${scenario}.json` : ""
  );

  const getNextStep = () => {
    if (!scenarioConfig?.nodes || !step) return null;
    const currentNode = scenarioConfig.nodes.find(n => n.slug === step);
    if (!currentNode) return null;
    
    const nextNode = scenarioConfig.nodes.find(n => n.order === currentNode.order + 1);
    return nextNode?.slug || null;
  };

  const getPrevStep = () => {
    if (!scenarioConfig?.nodes || !step) return null;
    const currentNode = scenarioConfig.nodes.find(n => n.slug === step);
    if (!currentNode) return null;
    
    const prevNode = scenarioConfig.nodes.find(n => n.order === currentNode.order - 1);
    return prevNode?.slug || null;
  };
  
  const navigateTo = (navPath: string) => {
    // Systemowe kody nawigacji z @
    if (navPath === '@next') {
      const next = getNextStep();
      if (next && scenario) navigate(`/${config}/${workspace}/${scenario}/${next}`);
      return;
    }
    
    if (navPath === '@prev') {
      const prev = getPrevStep();
      if (prev && scenario) navigate(`/${config}/${workspace}/${scenario}/${prev}`);
      return;
    }
    
    // Standardowa nawigacja (oryginalna logika)
    if (navPath === 'workspace') {
      navigate(`/${config}/${workspace}`);
    } else if (navPath.startsWith('/')) {
      // Pełna ścieżka
      navigate(navPath);
    } else if (navPath.startsWith('step')) {
      // Konkretny krok w bieżącym scenariuszu
      if (scenario) navigate(`/${config}/${workspace}/${scenario}/${navPath}`);
    } else {
      // Scenariusz
      navigate(`/${config}/${workspace}/${navPath}`);
    }
  };
  
  return {
    config, 
    workspace, 
    scenario, 
    step,
    navigateTo,
    goToWorkspace: () => navigate(`/${config}/${workspace}`),
    goToScenario: (slug: string) => navigate(`/${config}/${workspace}/${slug}`),
    goToStep: (slug: string) => scenario && navigate(`/${config}/${workspace}/${scenario}/${slug}`),
    goNext: () => navigateTo('@next'),
    goPrev: () => navigateTo('@prev'),
    canGoNext: () => !!getNextStep(),
    canGoPrev: () => !!getPrevStep(),
  };
};