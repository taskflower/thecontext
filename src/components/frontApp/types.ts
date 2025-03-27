/* eslint-disable @typescript-eslint/no-explicit-any */
// Workspace types
export interface Workspace {
    id: string;
    title: string;
    slug?: string;
    children: Scenario[];
  }
  
  // Scenario types
  export interface Scenario {
    id: string;
    name: string;
    description?: string;
    updatedAt?: string | number;
    filters?: Filter[];
    children?: any[]; // Adjust according to your actual child type
    hasFilters?: boolean;
    activeFiltersCount?: number;
    matchesFilter?: boolean;
  }
  
  // Filter types
  export interface Filter {
    id: string;
    enabled: boolean;
    // Add other filter properties as needed
  }
  
  // Component props types
  export interface EmptyScenariosProps {
    onCreateNew: () => void;
  }
  
  export interface FilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    scenarioId: string;
  }
  
  export interface ScenarioCardProps {
    scenario: Scenario;
    isCurrentScenario: boolean;
    onFilterClick: (e: React.MouseEvent, scenarioId: string) => void;
    onSelectScenario: (scenarioId: string) => void;
    onStartFlow: () => void;
  }
  
  export interface WorkspaceHeaderProps {
    currentWorkspace: Workspace | null;
    currentScenario: Scenario | null;
    workspaces: Workspace[];
    selectWorkspace: (id: string) => void;
  }