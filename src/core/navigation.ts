// src/core/navigation.ts
import { useConfig } from "@/ConfigProvider";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useFlow } from "@/core";

/**
 * Buduje ścieżkę nawigacji, obsługując interpolację zmiennych {{data.path}}
 *
 * @param successPath - Ścieżka nawigacji (opcjonalnie z interpolacją zmiennych {{data.path}})
 * @param configId - ID konfiguracji (potrzebne do konstruowania pełnej ścieżki)
 * @param defaultPath - Domyślna ścieżka, gdy successPath nie jest podany
 * @param getContextValue - Funkcja do pobierania wartości z kontekstu aplikacji
 * @returns Pełna ścieżka nawigacji
 */
export const buildNavigationPath = (
  successPath: string | undefined,
  configId: string,
  defaultPath: string,
  getContextValue: (path: string) => any
): string => {
  // Jeśli nie podano ścieżki, użyj domyślnej
  if (!successPath) {
    return defaultPath;
  }

  // Przetwórz ścieżkę, zastępując zmienne {{data.path}} wartościami z kontekstu
  let processedPath = successPath.replace(/{{([^}]+)}}/g, (_, dataPath) => {
    const value = getContextValue(dataPath.trim());
    return value !== undefined ? String(value) : "";
  });

  // Jeśli ścieżka nie zaczyna się od "/", dodaj prefix z configId
  if (!processedPath.startsWith("/")) {
    processedPath = `/${configId}/${processedPath}`;
  }

  return processedPath;
};

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const { configId } = useConfig();
  const { get } = useFlow();

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

  /**
   * Naviguje do strony z podanej ścieżki z obsługą interpolacji zmiennych
   * 
   * @param path - Ścieżka nawigacji (opcjonalnie z interpolacją zmiennych {{data.path}})
   * @param defaultPath - Domyślna ścieżka, gdy path nie jest podany
   */
  const navigateTo = useCallback(
    (path?: string, defaultPath: string = "/") => {
      const navigationPath = buildNavigationPath(path, configId ?? "", defaultPath, get);
      navigate(navigationPath);
    },
    [navigate, configId, get]
  );

  return { 
    toWorkspace, 
    toScenarioList, 
    toScenarioStep,
    navigateTo,
    buildNavigationPath: (path?: string, defaultPath: string = "/") => 
      buildNavigationPath(path, configId ?? '', defaultPath, get)
  };
};