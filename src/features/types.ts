/* eslint-disable @typescript-eslint/no-explicit-any */
// Types for the application
export const TYPES = {
  WORKSPACE: "workspace",
  SCENARIO: "scenario",
  NODE: "node",
  EDGE: "edge",
};

// Base interface for all items
export interface BaseItem {
  id: string;
  type: string;
}

// Position interface for nodes
export interface Position {
  x: number;
  y: number;
}

// Node interface (renamed to FlowNode to avoid conflicts)
export interface FlowNode extends BaseItem {
  label: string;
  value: number;
  position: Position;
}

// Edge interface
export interface Edge extends BaseItem {
  source: string;
  target: string;
  label?: string;
  type: string;
}

// Scenario interface
export interface Scenario extends BaseItem {
  name: string;
  description: string;
  children: FlowNode[];
  edges: Edge[];
}

// Workspace interface
export interface Workspace extends BaseItem {
  title: string;
  children: Scenario[];
}

// Selection state interface
export interface SelectionState {
  workspace: string;
  scenario: string;
  node: string;
}

// Application state interface
export interface AppState {
  items: Workspace[];
  selected: SelectionState;
  stateVersion: number;

  // Actions
  selectWorkspace: (workspaceId: string) => void;
  selectScenario: (scenarioId: string) => void;
  selectNode: (nodeId: string) => void;

  addWorkspace: (payload: { title: string }) => void;
  addScenario: (payload: { name: string; description: string }) => void;
  addNode: (payload: {
    label: string;
    value: string | number;
    position?: Position;
  }) => void;
  addEdge: (payload: {
    source: string;
    target: string;
    label?: string;
    type:string;
  }) => void;

  updateNodePosition: (nodeId: string, position: Position) => void;

  deleteWorkspace: (workspaceId: string) => void;
  deleteScenario: (scenarioId: string) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;

  getActiveScenarioData: () => { nodes: any[]; edges: any[] };
  getCurrentScenario: () => Scenario | null;
}

// Interface for field in dialog
export interface Field {
  name: string;
  placeholder: string;
  type?: string;
  options?: { value: string; label: string }[];
}

// Interface for dialog props
export interface DialogProps {
  title: string;
  onClose: () => void;
  onAdd: () => void;
  fields: Field[];
  formData: Record<string, any>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

// Interface for step in modal
export interface Step {
  id: string;
  label: string;
  value: number;
}

// Interface for step modal props
export interface StepModalProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

// Interface for section header props
export interface SectionHeaderProps {
  title: string;
  onAddClick: () => void;
}

// Interface for card panel props
export interface CardPanelProps {
  title: string;
  children: React.ReactNode;
  onAddClick: () => void;
}

// Interface for item list props
export interface ItemListProps<T extends { id: string }> {
  items: T[];
  selected: string;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  renderItem: (item: T) => React.ReactNode;
}

// Interface for ReactFlow node data
export interface ReactFlowNodeData {
  label: string;
  nodeId: string;
}
