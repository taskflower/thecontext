/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/studio/cloud-sync/workspaceUtils.ts
import { useAppStore } from "@/modules/store";

/**
 * Formats a timestamp as a localized date string
 */
export const formatDate = (timestamp: number): string => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Waliduje i przygotowuje workspace do operacji
 */
export const validateWorkspace = (workspace: any): any => {
  // Sprawdź czy mamy prawidłowy workspace
  if (!workspace || typeof workspace !== 'object') {
    console.error('[ERROR] Nieprawidłowy workspace');
    return workspace;
  }
  
  // Utwórz kopię workspace
  const workspaceCopy = JSON.parse(JSON.stringify(workspace));
  
  // Sprawdź czy tablica children istnieje
  if (!Array.isArray(workspaceCopy.children)) {
    console.warn('[DEBUG] Brak tablicy children, inicjalizuję jako pustą tablicę');
    workspaceCopy.children = [];
  }
  
  // Zwróć przygotowany workspace
  return workspaceCopy;
};

/**
 * Dodaje workspace do store
 */
export const addWorkspace = (workspace: any): void => {
  // Upewnij się, że workspace jest ważny
  const validWorkspace = validateWorkspace(workspace);
  
  console.log(
    "[DEBUG] addWorkspace - workspace:",
    JSON.stringify({
      id: validWorkspace.id,
      title: validWorkspace.title,
      childrenCount: validWorkspace.children?.length || 0,
      hasDashboards: !!validWorkspace.dashboards,
      dashboardsCount: validWorkspace.dashboards?.length || 0
    }, null, 2)
  );

  // Dodaj do store
  useAppStore.setState((state) => {
    return {
      ...state,
      items: [...state.items, validWorkspace],
      selected: {
        ...state.selected,
        workspace: validWorkspace.id,
        scenario:
          validWorkspace.children && validWorkspace.children.length > 0
            ? validWorkspace.children[0].id
            : "",
        node: ""
      },
      stateVersion: state.stateVersion + 1
    };
  });
}

/**
 * Zastępuje istniejący workspace
 */
export const replaceWorkspace = (
  workspace: any,
  oldWorkspaceId: string
): void => {
  // Upewnij się, że workspace jest ważny
  const validWorkspace = validateWorkspace(workspace);
  
  console.log(
    "[DEBUG] replaceWorkspace - workspace:",
    JSON.stringify({
      id: validWorkspace.id,
      title: validWorkspace.title,
      childrenCount: validWorkspace.children?.length || 0,
      hasDashboards: !!validWorkspace.dashboards,
      dashboardsCount: validWorkspace.dashboards?.length || 0
    }, null, 2)
  );

  // Zastąp w store
  useAppStore.setState((state) => {
    // Usuń stary workspace
    const filteredItems = state.items.filter(
      (item) => item.id !== oldWorkspaceId
    );

    // Dodaj nowy workspace
    return {
      ...state,
      items: [...filteredItems, validWorkspace],
      selected: {
        ...state.selected,
        workspace: validWorkspace.id,
        scenario:
          validWorkspace.children && validWorkspace.children.length > 0
            ? validWorkspace.children[0].id
            : "",
        node: ""
      },
      stateVersion: state.stateVersion + 1
    };
  });
}