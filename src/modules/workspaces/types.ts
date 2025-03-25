import { BaseItem } from "../store";
import { Scenario } from "../scenarios/types";

export interface Workspace extends BaseItem {
  title: string;
  description: string;
  slug:string;
  children: Scenario[];
}

export interface WorkspaceActions {
  selectWorkspace: (workspaceId: string) => void;
  addWorkspace: (payload: WorkspacePayload) => void;
  updateWorkspace: (workspaceId: string, payload: WorkspacePayload) => void;
  deleteWorkspace: (workspaceId: string) => void;
  getCurrentWorkspace: () => Workspace | null;
}

export interface WorkspacePayload {
  title: string;
  description: string;
  slug:string;
}