// src/utils/components.ts
// Funkcje utility do obsługi komponentów i dynamicznego ładowania

import { ComponentType } from '../hooks/useComponents';

/**
 * Zwraca moduły wg typu komponentu dla funkcji import.meta.glob
 * 
 * @param componentType - Typ komponentu ('flowStep', 'layout', 'widget')
 * @returns Funkcja glob dla importu modułów danego typu
 */
export function getModulesByType(componentType: ComponentType): Record<string, () => Promise<any>> {
  switch (componentType) {
    case "flowStep":
      return import.meta.glob("/src/templates/*/flowSteps/*.tsx");
    case "layout":
      return import.meta.glob("/src/templates/*/layouts/*.tsx");
    case "widget":
      return import.meta.glob("/src/templates/*/widgets/*.tsx");
    default:
      return import.meta.glob("/src/templates/*/*.tsx");
  }
}

/**
 * Buduje ścieżkę do komponentu na podstawie typu i identyfikatora
 * 
 * @param tplDirName - Nazwa katalogu szablonu
 * @param componentType - Typ komponentu
 * @param componentId - Identyfikator komponentu
 * @returns Ścieżka do komponentu
 */
export function buildComponentPath(
  tplDirName: string,
  componentType: ComponentType,
  componentId: string
): { mainPath: string; defaultPath: string } {
  // Określenie katalogu na podstawie typu komponentu
  let componentDir;
  switch (componentType) {
    case "flowStep":
      componentDir = "flowSteps";
      break;
    case "layout":
      componentDir = "layouts";
      break;
    case "widget":
      componentDir = "widgets";
      break;
    default:
      componentDir = componentType + "s";
  }

  // Budowanie ścieżek do komponentu
  const mainPath = `/src/templates/${tplDirName}/${componentDir}/${componentId}.tsx`;
  const defaultPath = `/src/templates/default/${componentDir}/${componentId}.tsx`;

  return { mainPath, defaultPath };
}

/**
 * Sprawdza, czy ścieżka komponentu istnieje w dostępnych modułach
 * 
 * @param modulePaths - Lista dostępnych ścieżek modułów
 * @param componentPath - Ścieżka komponentu do sprawdzenia
 * @returns Informacja, czy komponent istnieje
 */
export function componentPathExists(modulePaths: string[], componentPath: string): boolean {
  return modulePaths.includes(componentPath);
}

/**
 * Pobierz nazwę katalogu szablonu na podstawie workspace i app
 * 
 * @param workspace - Obiekt workspace
 * @param app - Obiekt aplikacji
 * @returns Nazwa katalogu szablonu
 */
export function getTemplateDirectory(workspace: any, app: any): string {
  if (workspace?.templateSettings?.tplDir) {
    return workspace.templateSettings.tplDir;
  }

  if (app?.tplDir) {
    return app.tplDir;
  }

  return "default";
}