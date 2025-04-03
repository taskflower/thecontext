import { Edge, FlowNode } from "../graph/types";
import { BaseItem } from "../store";
import { Filter } from "../filters/types";
import { DialogTemplate } from "../flow/components/interfaces";

export interface Scenario extends BaseItem {
  name: string;
  description: string;
  children: FlowNode[];
  edges: Edge[];
  filters?: Filter[];
  template?: DialogTemplate;
}

export interface ScenarioActions {
  selectScenario: (scenarioId: string) => void;
  addScenario: (payload: ScenarioPayload) => void;
  updateScenario: (scenarioId: string, payload: ScenarioPayload) => void;
  deleteScenario: (scenarioId: string) => void;
  moveScenarioUp: (scenarioId: string) => void;
  moveScenarioDown: (scenarioId: string) => void;
  getCurrentScenario: () => Scenario | null;
}

export interface ScenarioPayload {
  name: string;
  description: string;
  template: DialogTemplate;
}