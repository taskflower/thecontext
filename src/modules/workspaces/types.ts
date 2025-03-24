
import { Scenario } from "../scenarios/types";
import { ContextItem } from "../context/types"; // Add this import
import { BaseItem } from "../store";

export interface Workspace extends BaseItem {
  title: string;
  children: Scenario[];
  contextItems?: ContextItem[];
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceActions {
  selectWorkspace: (workspaceId: string) => void;
  addWorkspace: (payload: { title: string }) => void;
  deleteWorkspace: (workspaceId: string) => void;
}

export interface WorkspacePayload {
  title: string;
}