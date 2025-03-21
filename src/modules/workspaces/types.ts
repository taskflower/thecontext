import { BaseItem } from "../common/types";
import { Scenario } from "../scenarios/types";

export interface Workspace extends BaseItem {
  title: string;
  children: Scenario[];
}

export interface WorkspaceActions {
  selectWorkspace: (workspaceId: string) => void;
  addWorkspace: (payload: { title: string }) => void;
  deleteWorkspace: (workspaceId: string) => void;
}

export interface WorkspacePayload {
  title: string;
}