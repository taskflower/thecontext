// src/modules/workspaces/types.ts
import { BaseItem } from "../store";
import { Scenario } from "../scenarios/types";
import { ContextItem } from "../context/types";

export interface Workspace extends BaseItem {
  title: string;
  description: string;
  children: Scenario[];
  contextItems?: ContextItem[];
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceActions {
  selectWorkspace: (workspaceId: string) => void;
  addWorkspace: (payload: WorkspacePayload) => void;
  deleteWorkspace: (workspaceId: string) => void;
  getCurrentWorkspace: () => Workspace | null;
}

export interface WorkspacePayload {
  title: string;
  description: string;
}