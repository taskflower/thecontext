import { Edge, FlowNode } from "../graph/types";
import { BaseItem } from "../store";
import { Filter } from "../filters/types";

export interface Scenario extends BaseItem {
  name: string;
  description: string;
  children: FlowNode[];
  edges: Edge[];
  filters?: Filter[]; // Add this property
}

export interface ScenarioActions {
  selectScenario: (scenarioId: string) => void;
  addScenario: (payload: ScenarioPayload) => void;
  deleteScenario: (scenarioId: string) => void;
  getCurrentScenario: () => Scenario | null;
}

export interface ScenarioPayload {
  name: string;
  description: string;
}