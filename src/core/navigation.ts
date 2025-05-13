// src/core/navigation.ts
import { useConfig } from "@/ConfigProvider";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const { configId } = useConfig();

  const toWorkspace = useCallback(
    (workspaceSlug: string) => navigate(`/${configId}/${workspaceSlug}`),
    [navigate, configId]
  );

  const toScenarioList = useCallback(
    (workspaceSlug: string) => navigate(`/${configId}/${workspaceSlug}`),
    [navigate, configId]
  );

  const toScenarioStep = useCallback(
    (workspaceSlug: string, scenarioSlug: string, stepIndex = 0) => 
      navigate(`/${configId}/${workspaceSlug}/${scenarioSlug}/${stepIndex}`),
    [navigate, configId]
  );

  return { toWorkspace, toScenarioList, toScenarioStep };
};