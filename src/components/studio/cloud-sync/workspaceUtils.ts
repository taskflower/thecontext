// src/utils/cloud-sync/workspaceUtils.ts
import { Workspace } from "@/modules/workspaces/types";
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
 * Adds a workspace to the app store
 */
export const addWorkspace = (workspace: Workspace): void => {
  console.log(
    "[DEBUG] addWorkspace - workspace:",
    JSON.stringify(
      {
        id: workspace.id,
        title: workspace.title,
        childrenCount: workspace.children?.length || 0,
      },
      null,
      2
    )
  );

  if (!workspace.children) {
    console.warn(
      "[DEBUG] Children array doesn't exist, initializing as empty array"
    );
    workspace.children = [];
  }

  // Use set directly instead of addWorkspace
  useAppStore.setState((state) => {
    return {
      ...state,
      items: [...state.items, workspace],
      selected: {
        ...state.selected,
        workspace: workspace.id,
        scenario:
          workspace.children && workspace.children.length > 0
            ? workspace.children[0].id
            : "",
        node: "",
      },
      stateVersion: state.stateVersion + 1,
    };
  });

  console.log(
    "[DEBUG] Workspace added, number of scenarios:",
    workspace.children.length
  );
};

/**
 * Replaces an existing workspace with a new one in the app store
 */
export const replaceWorkspace = (
  workspace: Workspace,
  oldWorkspaceId: string
): void => {
  console.log(
    "[DEBUG] replaceWorkspace - workspace:",
    JSON.stringify(
      {
        id: workspace.id,
        title: workspace.title,
        childrenCount: workspace.children?.length || 0,
      },
      null,
      2
    )
  );

  if (!workspace.children) {
    console.warn(
      "[DEBUG] Children array doesn't exist, initializing as empty array"
    );
    workspace.children = [];
  }

  // Use set directly instead of state methods
  useAppStore.setState((state) => {
    // First remove old workspace
    const filteredItems = state.items.filter(
      (item) => item.id !== oldWorkspaceId
    );

    // Then add new workspace
    return {
      ...state,
      items: [...filteredItems, workspace],
      selected: {
        ...state.selected,
        workspace: workspace.id,
        scenario:
          workspace.children && workspace.children.length > 0
            ? workspace.children[0].id
            : "",
        node: "",
      },
      stateVersion: state.stateVersion + 1,
    };
  });

  console.log(
    "[DEBUG] Workspace replaced, number of scenarios:",
    workspace.children.length
  );
};

/**
 * Ensures a workspace has a valid children array
 */
export const validateWorkspace = (workspace: Workspace): Workspace => {
  if (!workspace.children) {
    console.warn(
      "[DEBUG] Children array doesn't exist, initializing as empty array"
    );
    return { ...workspace, children: [] };
  }
  return workspace;
};