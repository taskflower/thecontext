// src/core/navigation.ts

import { useConfig } from "@/provideConfig";
import { useNavigate } from "react-router-dom";

export const useAppNavigation = () => {
    const navigate = useNavigate();
    const { configId } = useConfig();
  
    const toWorkspace = (workspaceSlug: string) =>
      navigate(`/${configId}/${workspaceSlug}`);
  
    const toScenarioList = (workspaceSlug: string) =>
      navigate(`/${configId}/${workspaceSlug}`);
  
    const toScenarioStep = (
      workspaceSlug: string,
      scenarioSlug: string,
      stepIndex = 0
    ) =>
      navigate(`/${configId}/${workspaceSlug}/${scenarioSlug}/${stepIndex}`);
  
    return { toWorkspace, toScenarioList, toScenarioStep };
  };
  