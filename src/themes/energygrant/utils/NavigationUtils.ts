// src/themes/energygrant/utils/NavigationUtils.ts
import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAppNavigation } from "@/core/navigation";
import { useFlow } from "@/core";

interface RedirectionOptions {
  successPath?: string;
  autoRedirect?: boolean;
  redirectDelay?: number;
  onSubmit?: () => void;
}

/**
 * Custom hook to handle widget navigation with support for automatic redirection
 */
export function useWidgetNavigation({
  successPath,
  autoRedirect = false,
  redirectDelay = 3000,
  onSubmit,
}: RedirectionOptions) {
  const params = useParams();
  const { navigateTo } = useAppNavigation();

  const currentStep = params.stepIndex ? parseInt(params.stepIndex, 10) : 0;
  const configId = params.configId;
  const workspaceSlug = params.workspaceSlug || "";
  const scenarioSlug = params.scenarioSlug || "";

  // Function to handle redirection
  const handleContinue = useCallback(() => {
    if (typeof onSubmit === "function") {
      onSubmit();
    }

    const defaultPath = `/${configId}/${workspaceSlug}/${scenarioSlug}/${
      currentStep + 1
    }`;
    navigateTo(successPath, defaultPath);
  }, [
    onSubmit,
    navigateTo,
    successPath,
    configId,
    workspaceSlug,
    scenarioSlug,
    currentStep,
  ]);

  // Effect to handle automatic redirection
  useEffect(() => {
    let redirectTimer: number | undefined;

    if (
      autoRedirect &&
      (successPath || (configId && workspaceSlug && scenarioSlug))
    ) {
      redirectTimer = window.setTimeout(handleContinue, redirectDelay);
    }

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [
    autoRedirect,
    handleContinue,
    redirectDelay,
    successPath,
    configId,
    workspaceSlug,
    scenarioSlug,
  ]);

  // Return the handler function for manual navigation
  return {
    handleContinue,
    routeParams: {
      currentStep,
      configId,
      workspaceSlug,
      scenarioSlug,
    },
  };
}

/**
 * Process template strings with context values
 * Replaces patterns like {{user-data.role}} with actual values from context
 */
export function processTemplateString(
  template: string,
  getContextValue: (path: string) => any
): string {
  return template.replace(/{{([^}]+)}}/g, (_, path) => {
    const value = getContextValue(path.trim());
    return value !== undefined ? String(value) : "";
  });
}
