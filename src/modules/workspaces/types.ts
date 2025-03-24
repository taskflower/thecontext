import { BaseItem } from "../common/types";
import { Scenario } from "../scenarios/types";
import { ContextItem } from "../context/types"; // Add this import

export interface Workspace extends BaseItem {
  title: string;
  children: Scenario[];
  contextItems?: ContextItem[]; // Add this property
}

export interface WorkspaceActions {
  selectWorkspace: (workspaceId: string) => void;
  addWorkspace: (payload: { title: string }) => void;
  deleteWorkspace: (workspaceId: string) => void;
}

export interface WorkspacePayload {
  title: string;
}