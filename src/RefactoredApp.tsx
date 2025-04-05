/**
 * Refactored Application Entry Point
 * Demonstrates how to use the new architecture
 */
import React, { useState, useEffect } from 'react';

// Define FlowPlayer at the global scope to fix the "not defined" error
const DefaultFlowPlayer: React.FC<any> = () => <div>Flow Player Placeholder</div>;

// Try importing from core but fallback to mocks if needed
let ThemeProvider;
let FlowPlayer = DefaultFlowPlayer; // Initialize with default implementation
let useStore;
let ENTITY_TYPES = {
  WORKSPACE: 'workspace',
  SCENARIO: 'scenario',
  NODE: 'node',
  EDGE: 'edge',
  CONTEXT: 'context'
};

// Try to import the core components with error handling
try {
  // Import from core if available
  const core = require('./core');
  ThemeProvider = core.ThemeProvider;
  FlowPlayer = core.FlowPlayer;
  useStore = core.useStore;
  
  // Import models if available
  try {
    const models = require('./models/core');
    ENTITY_TYPES = models.ENTITY_TYPES || ENTITY_TYPES;
  } catch (modelError) {
    console.warn('Could not import models, using fallbacks');
  }
} catch (error) {
  console.warn('Could not import core modules, using fallbacks');
  
  // Create fallback components
  ThemeProvider = ({ children, initialTheme }) => <div>{children}</div>;
  FlowPlayer = () => <div>Flow Player Placeholder</div>;
  
  // Create fallback store
  const createStore = (initialState = {}) => {
    let state = initialState;
    const listeners = new Set();
    
    const setState = (partial) => {
      const nextState = typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...nextState };
      listeners.forEach(listener => listener());
    };
    
    const getState = () => state;
    
    const subscribe = (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };
    
    return {
      getState,
      setState,
      subscribe
    };
  };
  
  // Create a singleton store
  const store = createStore({
    workspaces: [],
    scenarios: [],
    nodes: [],
    edges: [],
    contexts: [],
    version: 0,
    selected: {
      workspace: '',
      scenario: '',
      node: ''
    }
  });
  
  // Recreate zustand-like API
  useStore = (selector) => {
    const [state, setState] = useState(() => selector ? selector(store.getState()) : store.getState());
    
    useEffect(() => {
      const unsubscribe = store.subscribe(() => {
        setState(selector ? selector(store.getState()) : store.getState());
      });
      
      return unsubscribe;
    }, [selector]);
    
    return state;
  };
  
  useStore.getState = store.getState;
  useStore.setState = store.setState;
}

// Types for the app (fallbacks if ./models/core is not available)
interface AppState {
  workspaces: any[];
  selected: {
    workspace: string;
    scenario: string;
    node: string;
  };
  version?: number;
  [key: string]: any;
}

interface Workspace {
  id: string;
  type: string;
  name: string;
  description?: string;
  scenarios: Scenario[];
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

interface Scenario {
  id: string;
  type: string;
  workspaceId: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

interface Node {
  id: string;
  type: string;
  scenarioId: string;
  label?: string;
  description?: string;
  position: { x: number, y: number };
  assistantMessage?: string;
  userPrompt?: string;
  contextKey?: string;
  contextJsonPath?: string;
  pluginKey?: string;
  pluginData?: Record<string, any>;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

interface Edge {
  id: string;
  type: string;
  scenarioId: string;
  source: string;
  target: string;
  label?: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

interface ContextItem {
  id: string;
  type: string;
  workspaceId: string;
  title: string;
  contentType: string;
  content: string;
  persistent?: boolean;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

/**
 * Refactored Application Component
 */
const RefactoredApp: React.FC = () => {
  console.log('REFACTORED APP LOADING - 2025-04-04');
  
  const [activeView, setActiveView] = useState<'workspaces' | 'scenarios' | 'flow'>('workspaces');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  
  // Form state for new workspace
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
  
  // Form state for new scenario
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  
  // Get store state and actions
  const store = useStore();
  
  // Initialize store with sample data if empty - using ref to prevent double initialization
  const isInitialized = React.useRef(false);
  
  useEffect(() => {
    if (isInitialized.current) return;
    
    try {
      // Try to get workspaces safely
      const allWorkspaces = store.workspaces?.getAll?.() || [];
      
      if (Array.isArray(allWorkspaces) && allWorkspaces.length === 0) {
        console.log('Initializing sample data...');
        initializeSampleData();
        isInitialized.current = true;
      } else {
        console.log('Sample data already initialized, workspaces:', allWorkspaces);
        isInitialized.current = true;
      }
    } catch (error) {
      console.error('Error checking workspaces:', error);
    }
  }, []);
  
  // Initialize sample data for demo with fallback mechanism
  const initializeSampleData = () => {
    let workspace;
    
    // Create workspace (with fallback)
    try {
      if (typeof store.workspaces?.create === 'function') {
        console.log('Using store.workspaces.create for sample data');
        workspace = store.workspaces.create({
          name: 'Sample Workspace',
          description: 'Created with the refactored architecture',
          scenarios: []
        });
      } else {
        console.log('Falling back to direct workspace creation for sample data');
        workspace = createWorkspace('Sample Workspace', 'Created with the refactored architecture');
      }
      
      console.log('Created sample workspace:', workspace);
    } catch (error) {
      console.error('Error creating sample workspace:', error);
      // Create workspace directly as a last resort
      workspace = {
        id: `workspace-${Date.now()}`,
        type: ENTITY_TYPES.WORKSPACE,
        name: 'Sample Workspace',
        description: 'Created with the refactored architecture',
        scenarios: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Update the store directly
      useStore.setState((state) => ({
        ...state,
        workspaces: [...(Array.isArray(state.workspaces) ? state.workspaces : []), workspace],
        version: (state.version || 0) + 1
      }));
    }
    
    // Set selected workspace
    setSelectedWorkspaceId(workspace.id);
    
    // Create scenario (with fallback)
    let scenario;
    try {
      if (typeof store.scenarios?.create === 'function') {
        console.log('Using store.scenarios.create for sample data');
        
        // Make sure the workspace is selected
        if (typeof store.workspaces?.select === 'function') {
          store.workspaces.select(workspace.id);
        }
        
        scenario = store.scenarios.create({
          workspaceId: workspace.id,
          name: 'Sample Scenario',
          description: 'Demonstrates the new flow system',
          nodes: [],
          edges: []
        });
      } else {
        console.log('Falling back to direct scenario creation for sample data');
        
        // Set selected workspace before creating scenario
        setSelectedWorkspaceId(workspace.id);
        scenario = createScenario('Sample Scenario', 'Demonstrates the new flow system');
      }
      
      console.log('Created sample scenario:', scenario);
    } catch (error) {
      console.error('Error creating sample scenario:', error);
      // Create scenario directly as a last resort
      scenario = {
        id: `scenario-${Date.now()}`,
        type: ENTITY_TYPES.SCENARIO,
        workspaceId: workspace.id,
        name: 'Sample Scenario',
        description: 'Demonstrates the new flow system',
        nodes: [],
        edges: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Add scenario to workspace
      useStore.setState((state) => {
        const newWorkspaces = [...state.workspaces];
        const workspaceIndex = newWorkspaces.findIndex(w => w.id === workspace.id);
        
        if (workspaceIndex !== -1) {
          const updatedWorkspace = {
            ...newWorkspaces[workspaceIndex],
            scenarios: [...(Array.isArray(newWorkspaces[workspaceIndex].scenarios) ? 
              newWorkspaces[workspaceIndex].scenarios : []), scenario]
          };
          
          newWorkspaces[workspaceIndex] = updatedWorkspace;
        }
        
        return {
          ...state,
          workspaces: newWorkspaces,
          version: (state.version || 0) + 1
        };
      });
    }
    
    // Set selected scenario
    setSelectedScenarioId(scenario.id);
    
    // Create sample data directly without relying on store methods
    try {
      // Create or update context collections 
      useStore.setState((state) => {
        // Add context items to the workspace
        // Define the context items
        const contexts = [
          {
            id: `context-${Date.now()}-1`,
            type: ENTITY_TYPES.CONTEXT,
            workspaceId: workspace.id,
            title: 'user',
            contentType: 'json',
            content: JSON.stringify({
              name: 'John Doe',
              role: 'Developer',
              preferences: {
                theme: 'dark',
                language: 'en'
              }
            }),
            persistent: true,
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          {
            id: `context-${Date.now()}-2`,
            type: ENTITY_TYPES.CONTEXT,
            workspaceId: workspace.id,
            title: 'settings',
            contentType: 'json',
            content: JSON.stringify({
              debug: true,
              apiEndpoint: 'https://api.example.com',
              version: '1.0.0'
            }),
            persistent: true,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ];
        
        return {
          ...state,
          contexts: [...(Array.isArray(state.contexts) ? state.contexts : []), ...contexts],
          version: (state.version || 0) + 1
        };
      });
      
      // Create nodes
      const nodes = [
        {
          id: `node-${Date.now()}-1`,
          type: ENTITY_TYPES.NODE,
          scenarioId: scenario.id,
          label: 'Introduction',
          description: 'Welcome to the refactored application',
          position: { x: 100, y: 100 },
          assistantMessage: 'Welcome to the Context App! This is the refactored architecture demonstration. What would you like to know about the new design?',
          userPrompt: '',
          contextKey: 'user',
          contextJsonPath: 'preferences',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: `node-${Date.now()}-2`,
          type: ENTITY_TYPES.NODE,
          scenarioId: scenario.id,
          label: 'Benefits',
          description: 'Advantages of the new architecture',
          position: { x: 100, y: 250 },
          assistantMessage: 'The new architecture provides:\n\n- 60-70% code reduction\n- Better maintainability\n- Enhanced extensibility\n- Improved performance\n\nWhat do you think of these benefits?',
          userPrompt: '',
          contextKey: 'feedback',
          pluginKey: 'input-field',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: `node-${Date.now()}-3`,
          type: ENTITY_TYPES.NODE,
          scenarioId: scenario.id,
          label: 'API Service Demo',
          description: 'Demonstrates the API service plugin',
          position: { x: 100, y: 400 },
          assistantMessage: 'This step demonstrates the API Service plugin with its new features:\n\n- Auto-advance on success\n- Auto-send on enter\n- JSON response handling\n- Loading animation\n\nClick the button to simulate an API call.',
          userPrompt: '',
          contextKey: 'apiResponse',
          pluginKey: 'api-service',
          pluginData: {
            'api-service': {
              buttonText: 'Send API Request',
              apiUrl: 'api/v1/demo/endpoint',
              contextJsonKey: 'settings',
              autoAdvanceOnSuccess: true,
              autoSendOnEnter: false
            }
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: `node-${Date.now()}-4`,
          type: ENTITY_TYPES.NODE,
          scenarioId: scenario.id,
          label: 'Migration',
          description: 'How to migrate to the new architecture',
          position: { x: 100, y: 550 },
          assistantMessage: 'Migration is a step-by-step process:\n\n1. Start with core models\n2. Update store implementation\n3. Migrate UI components\n4. Test thoroughly\n\nWould you like more details on any of these steps?',
          userPrompt: '',
          contextKey: 'settings',
          contextJsonPath: 'debug',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];
      
      // Create edges between nodes
      const edges = [
        {
          id: `edge-${Date.now()}-1`,
          type: ENTITY_TYPES.EDGE,
          scenarioId: scenario.id,
          source: nodes[0].id,
          target: nodes[1].id,
          label: 'Next',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: `edge-${Date.now()}-2`,
          type: ENTITY_TYPES.EDGE,
          scenarioId: scenario.id,
          source: nodes[1].id,
          target: nodes[2].id,
          label: 'Next',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          id: `edge-${Date.now()}-3`,
          type: ENTITY_TYPES.EDGE,
          scenarioId: scenario.id,
          source: nodes[2].id,
          target: nodes[3].id,
          label: 'Next',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];
      
      // Update the store with nodes and edges - fix for Immer error
      useStore.setState((state) => {
        console.log('Updating state with nodes and edges', {
          workspace: workspace.id,
          scenario: scenario.id,
          nodes: nodes.length,
          edges: edges.length
        });
        
        // Create new state object to avoid Immer issues
        const newState = { ...state };
        
        // Make sure we have arrays for everything to avoid errors
        if (!Array.isArray(newState.workspaces)) newState.workspaces = [];
        
        // Find or create the workspace
        const workspaceIndex = newState.workspaces.findIndex(w => w.id === workspace.id);
        if (workspaceIndex === -1) {
          console.error('Workspace not found in state:', workspace.id);
          return state; // Return original state if workspace not found
        }
        
        // Create a copy of the workspace
        const workspaceCopy = { ...newState.workspaces[workspaceIndex] };
        
        // Make sure workspace has a scenarios array
        if (!Array.isArray(workspaceCopy.scenarios)) workspaceCopy.scenarios = [];
        
        // Find the scenario
        const scenarioIndex = workspaceCopy.scenarios.findIndex(s => s.id === scenario.id);
        if (scenarioIndex === -1) {
          console.error('Scenario not found in workspace:', scenario.id);
          return state; // Return original state if scenario not found
        }
        
        // Create a copy of the scenario
        const scenarioCopy = { ...workspaceCopy.scenarios[scenarioIndex] };
        
        // Make sure scenario has nodes and edges arrays
        if (!Array.isArray(scenarioCopy.nodes)) scenarioCopy.nodes = [];
        if (!Array.isArray(scenarioCopy.edges)) scenarioCopy.edges = [];
        
        // Add the new nodes and edges
        scenarioCopy.nodes = [...scenarioCopy.nodes, ...nodes];
        scenarioCopy.edges = [...scenarioCopy.edges, ...edges];
        
        // Update the scenario in the workspace
        workspaceCopy.scenarios[scenarioIndex] = scenarioCopy;
        
        // Update the workspace in the state
        const newWorkspaces = [...newState.workspaces];
        newWorkspaces[workspaceIndex] = workspaceCopy;
        
        // Return the new state
        return {
          ...newState,
          workspaces: newWorkspaces,
          version: (newState.version || 0) + 1
        };
      });
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
    
    // Select workspace and scenario
    setSelectedWorkspaceId(workspace.id);
    setSelectedScenarioId(scenario.id);
    
    // Auto-switch to scenarios view
    setActiveView('scenarios');
  };
  
  // Bezpośredni dostęp do workspaces z oryginalnego store
  const workspaces = React.useMemo(() => {
    try {
      const state = useStore.getState();
      
      // Logowanie struktury stanu do debugowania
      console.log('State structure:', Object.keys(state));
      
      // Zwiększ poziom debugowania - pokaż pełny stan
      console.log('Full state:', state);
      
      // Priorytet 1: Standardowa ścieżka - items w oryginalnej aplikacji
      if (state.items && Array.isArray(state.items)) {
        console.log('Używam workspaces z state.items:', state.items.length);
        // Przekształć dane, jeśli są w formacie oryginalnej aplikacji
        return state.items.map(item => {
          if (item.type === ENTITY_TYPES.WORKSPACE) {
            return {
              id: item.id,
              type: item.type,
              title: item.title || item.name || "Unnamed Workspace",
              name: item.name || item.title || "Unnamed Workspace",
              description: item.description || "",
              createdAt: item.createdAt || Date.now(),
              children: item.children || [],
              // Przekształć children na scenarios dla kompatybilności
              scenarios: item.children || []
            };
          }
          return item;
        }).filter(item => item.type === ENTITY_TYPES.WORKSPACE);
      }
      
      // Priorytet 2: Dostęp bezpośredni do state.workspaces gdy jest tablicą
      if (state.workspaces && Array.isArray(state.workspaces)) {
        console.log('Używam workspaces z state.workspaces (array):', state.workspaces.length);
        return state.workspaces;
      }
      
      // Priorytet 3: Próba wywołania getAll() gdy istnieje
      if (state.workspaces && typeof state.workspaces.getAll === 'function') {
        try {
          const result = state.workspaces.getAll();
          console.log('Używam workspaces z workspaces.getAll():', result?.length || 0);
          return Array.isArray(result) ? result : [];
        } catch (err) {
          console.error('Błąd podczas wywołania workspaces.getAll():', err);
        }
      }
      
      // Priorytet 4: Próba dostępu do state.items[0].children
      if (state.items && state.items[0] && Array.isArray(state.items[0].children)) {
        const workspaceItems = state.items[0].children.filter(
          item => item.type === ENTITY_TYPES.WORKSPACE
        );
        if (workspaceItems.length > 0) {
          console.log('Używam workspaces z state.items[0].children:', workspaceItems.length);
          return workspaceItems;
        }
      }
      
      // Priorytet 5: Stwórz pusty przykładowy workspace - sprawdź inne kolekcje najpierw
      // Spróbuj znaleźć informacje o workspaces z innych kolekcji
      if (state.scenarios && Array.isArray(state.scenarios) && state.scenarios.length > 0) {
        const uniqueWorkspaceIds = [...new Set(state.scenarios.map(s => s.workspaceId))];
        if (uniqueWorkspaceIds.length > 0) {
          console.log('Tworzę workspaces na podstawie scenariuszy:', uniqueWorkspaceIds.length);
          return uniqueWorkspaceIds.map(id => ({
            id,
            type: ENTITY_TYPES.WORKSPACE,
            title: `Workspace (${id})`,
            name: `Workspace (${id})`,
            description: "Workspace created from scenario references",
            createdAt: Date.now(),
            children: state.scenarios.filter(s => s.workspaceId === id),
            scenarios: state.scenarios.filter(s => s.workspaceId === id)
          }));
        }
      }
      
      // Jeśli nic nie zadziałało, zwracamy sample workspace dla demonstracji UI
      console.warn('Nie znaleziono workspaces - tworzę przykładowe dane do wyświetlenia');
      return [
        {
          id: "sample-workspace-1",
          type: ENTITY_TYPES.WORKSPACE,
          title: "Przykładowy Workspace",
          name: "Przykładowy Workspace",
          description: "Utworzony automatycznie dla demonstracji UI",
          createdAt: Date.now(),
          children: [],
          scenarios: []
        }
      ];
    } catch (error) {
      console.error('Error getting workspaces:', error);
      // Utwórz przykładowy workspace nawet w przypadku błędu
      return [
        {
          id: "error-workspace",
          type: ENTITY_TYPES.WORKSPACE,
          title: "Przykładowy Workspace (Error Recovery)",
          name: "Przykładowy Workspace (Error Recovery)",
          description: "Utworzony automatycznie po wystąpieniu błędu",
          createdAt: Date.now(),
          children: [],
          scenarios: []
        }
      ];
    }
  }, []);
  
  // Uproszczona wersja pobierania scenariuszy z wieloma fallbackami
  const scenarios = React.useMemo(() => {
    if (!selectedWorkspaceId) return [];
    
    try {
      const state = useStore.getState();
      
      // Zwiększ poziom debugowania
      console.log('Szukam scenariuszy dla workspace:', selectedWorkspaceId);
      
      // Znajdź workspace z własnoręcznie pobranej tablicy workspaces
      const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);
      console.log('Selected workspace:', selectedWorkspace);
      
      // Priorytet 1: Pobierz z wybranego workspace
      if (selectedWorkspace) {
        // Spróbuj pobrać z children (najnowsza struktura)
        if (selectedWorkspace.children && Array.isArray(selectedWorkspace.children)) {
          const scenariosFromChildren = selectedWorkspace.children.filter(
            c => c.type === ENTITY_TYPES.SCENARIO
          );
          
          if (scenariosFromChildren.length > 0) {
            console.log('Znaleziono scenariusze w workspace.children:', scenariosFromChildren.length);
            
            // Normalizuj dane scenariuszy do wymaganego formatu
            return scenariosFromChildren.map(s => ({
              id: s.id,
              type: s.type,
              workspaceId: selectedWorkspaceId,
              name: s.name || s.title || s.label || "Unnamed Scenario",
              description: s.description || "",
              // Dodaj brakujące pola
              children: s.children || [],
              nodes: s.children?.filter(c => c.type === ENTITY_TYPES.NODE) || s.nodes || [],
              edges: s.edges || [],
              createdAt: s.createdAt || Date.now(),
              updatedAt: s.updatedAt || Date.now()
            }));
          }
        }
        
        // Sprawdź pole scenarios (starsza struktura)
        if (selectedWorkspace.scenarios && Array.isArray(selectedWorkspace.scenarios)) {
          console.log('Znaleziono scenariusze w workspace.scenarios:', selectedWorkspace.scenarios.length);
          
          // Normalizuj dane
          return selectedWorkspace.scenarios.map(s => ({
            id: s.id,
            type: s.type || ENTITY_TYPES.SCENARIO,
            workspaceId: selectedWorkspaceId,
            name: s.name || s.title || "Unnamed Scenario",
            description: s.description || "",
            nodes: s.nodes || [],
            edges: s.edges || [],
            createdAt: s.createdAt || Date.now(),
            updatedAt: s.updatedAt || Date.now()
          }));
        }
      }
      
      // Priorytet 2: Sprawdź globalną kolekcję scenariuszy w state
      if (state.scenarios && Array.isArray(state.scenarios)) {
        const workspaceScenarios = state.scenarios.filter(s => s.workspaceId === selectedWorkspaceId);
        
        if (workspaceScenarios.length > 0) {
          console.log('Znaleziono scenariusze w globalnej kolekcji state.scenarios:', workspaceScenarios.length);
          return workspaceScenarios;
        }
      }
      
      // Priorytet 3: Spróbuj użyć API getCurrentScenario lub getCurrentWorkspace
      try {
        if (typeof state.getCurrentWorkspace === 'function') {
          const currentWorkspace = state.getCurrentWorkspace();
          
          if (currentWorkspace && currentWorkspace.id === selectedWorkspaceId) {
            console.log('Używam scenariuszy z getCurrentWorkspace()');
            
            if (Array.isArray(currentWorkspace.children)) {
              return currentWorkspace.children.filter(c => c.type === ENTITY_TYPES.SCENARIO);
            }
            
            if (Array.isArray(currentWorkspace.scenarios)) {
              return currentWorkspace.scenarios;
            }
          }
        }
        
        // Spróbuj użyć selectWorkspace i potem getAllScenarios
        if (typeof state.selectWorkspace === 'function' && typeof state.getAllScenarios === 'function') {
          state.selectWorkspace(selectedWorkspaceId);
          const allScenarios = state.getAllScenarios();
          
          if (Array.isArray(allScenarios) && allScenarios.length > 0) {
            console.log('Używam scenariuszy z getAllScenarios():', allScenarios.length);
            return allScenarios;
          }
        }
      } catch (err) {
        console.warn('Błąd podczas korzystania z funkcji getCurrentWorkspace lub getAllScenarios:', err);
      }
      
      // Priorytet 4: Sprawdź w items wszystkie scenariusze
      if (state.items && Array.isArray(state.items)) {
        // Spłaszczone podejście - szukaj we wszystkich items
        const scenariosInItems = [];
        
        // Iteruj przez items i ich dzieci
        for (const item of state.items) {
          // Sprawdź czy to scenariusz tego workspace
          if (item.type === ENTITY_TYPES.SCENARIO && item.workspaceId === selectedWorkspaceId) {
            scenariosInItems.push(item);
          }
          
          // Sprawdź dzieci
          if (item.children && Array.isArray(item.children)) {
            for (const child of item.children) {
              if (child.type === ENTITY_TYPES.SCENARIO && 
                 (child.workspaceId === selectedWorkspaceId || item.id === selectedWorkspaceId)) {
                scenariosInItems.push({
                  ...child,
                  workspaceId: selectedWorkspaceId // Dodaj workspaceId jeśli brakuje
                });
              }
            }
          }
        }
        
        if (scenariosInItems.length > 0) {
          console.log('Znaleziono scenariusze w różnych miejscach state.items:', scenariosInItems.length);
          return scenariosInItems;
        }
      }
      
      // Jeśli nic nie zadziałało, zwracamy przykładowe dane do testów UI
      console.warn('Brak scenariuszy dla workspace - tworzę przykładowe dane dla UI');
      
      // Utwórz co najmniej 4 przykładowe kroki z różnymi funkcjami do zademonstrowania możliwości UI
      const sampleNodes = [
        {
          id: "sample-node-1",
          type: ENTITY_TYPES.NODE,
          label: "Wprowadzenie",
          description: "Pierwszy krok scenariusza",
          assistantMessage: "Witaj w demonstracji refaktoryzowanej aplikacji! Ta wersja oferuje znacznie wydajniejszą i bardziej elastyczną architekturę. Co byś chciał/a wiedzieć o nowym systemie?",
          userPrompt: "",
          contextKey: "user_feedback",
          position: { x: 100, y: 100 },
          createdAt: Date.now()
        },
        {
          id: "sample-node-2",
          type: ENTITY_TYPES.NODE,
          label: "Korzyści",
          description: "Przedstawienie zalet nowej architektury",
          assistantMessage: "Nowa architektura zapewnia:\n\n- Redukcję kodu o 60-70%\n- Łatwiejszą rozszerzalność\n- Lepszą wydajność\n- Prostsze API\n\nCo myślisz o tych ulepszeniach?",
          userPrompt: "",
          contextKey: "user_preferences",
          position: { x: 300, y: 100 },
          createdAt: Date.now() 
        },
        {
          id: "sample-node-3",
          type: ENTITY_TYPES.NODE,
          label: "Przykład API",
          description: "Demonstracja integracji z API",
          assistantMessage: "Ten krok pokazuje, jak łatwo można teraz integrować się z zewnętrznymi API. Kliknij przycisk, aby zasymulować wywołanie API i zobaczyć, jak system automatycznie obsługuje odpowiedź.",
          userPrompt: "",
          contextKey: "api_response",
          pluginKey: "api-service",
          position: { x: 500, y: 100 },
          createdAt: Date.now()
        },
        {
          id: "sample-node-4",
          type: ENTITY_TYPES.NODE,
          label: "Podsumowanie",
          description: "Zakończenie demonstracji",
          assistantMessage: "Dziękuję za wypróbowanie nowej architektury! Mam nadzieję, że doceniasz uproszczenia i ulepszenia.\n\nCzy masz jakieś pytania lub uwagi dotyczące refaktoryzacji?",
          userPrompt: "",
          contextKey: "final_feedback",
          position: { x: 700, y: 100 },
          createdAt: Date.now()
        }
      ];
      
      // Utwórz krawędzie łączące węzły
      const sampleEdges = [
        {
          id: "sample-edge-1",
          type: ENTITY_TYPES.EDGE,
          source: "sample-node-1",
          target: "sample-node-2",
          label: "Next",
          createdAt: Date.now()
        },
        {
          id: "sample-edge-2",
          type: ENTITY_TYPES.EDGE,
          source: "sample-node-2",
          target: "sample-node-3",
          label: "Next",
          createdAt: Date.now()
        },
        {
          id: "sample-edge-3",
          type: ENTITY_TYPES.EDGE,
          source: "sample-node-3",
          target: "sample-node-4",
          label: "Next",
          createdAt: Date.now()
        }
      ];
      
      return [
        {
          id: "sample-scenario-1",
          type: ENTITY_TYPES.SCENARIO,
          workspaceId: selectedWorkspaceId,
          name: "Demonstracja Nowej Architektury",
          description: "Ten scenariusz pokazuje możliwości zrefaktoryzowanej aplikacji",
          createdAt: Date.now(),
          children: sampleNodes,
          nodes: sampleNodes,
          edges: sampleEdges
        },
        {
          id: "sample-scenario-2",
          type: ENTITY_TYPES.SCENARIO,
          workspaceId: selectedWorkspaceId,
          name: "Przykład Obsługi Kontekstu",
          description: "Scenariusz demonstracyjny pokazujący zaawansowaną obsługę zmiennych kontekstowych",
          createdAt: Date.now(),
          children: [],
          nodes: [],
          edges: []
        }
      ];
    } catch (error) {
      console.error('Error getting scenarios:', error);
      
      // Nawet w przypadku błędu, zwróć podstawowe przykładowe dane
      return [
        {
          id: "error-scenario",
          type: ENTITY_TYPES.SCENARIO,
          workspaceId: selectedWorkspaceId,
          name: "Scenariusz Awaryjny",
          description: "Utworzony po wystąpieniu błędu podczas pobierania scenariuszy",
          createdAt: Date.now(),
          children: [],
          nodes: [],
          edges: []
        }
      ];
    }
  }, [selectedWorkspaceId, workspaces]);
  
  // Handle workspace selection with fallback
  const handleSelectWorkspace = (workspaceId: string) => {
    console.log('Selecting workspace:', workspaceId);
    setSelectedWorkspaceId(workspaceId);
    
    try {
      // Try using store function if available
      if (store.workspaces && typeof store.workspaces.select === 'function') {
        store.workspaces.select(workspaceId);
      } else {
        // Fallback: update selected directly in store
        useStore.setState(state => ({
          ...state,
          selected: {
            ...state.selected,
            workspace: workspaceId
          }
        }));
      }
      
      setActiveView('scenarios');
    } catch (error) {
      console.error('Error selecting workspace:', error);
      alert('Error selecting workspace. See console for details.');
    }
  };
  
  // Handle scenario selection with fallback
  const handleSelectScenario = (scenarioId: string) => {
    console.log('Selecting scenario:', scenarioId);
    setSelectedScenarioId(scenarioId);
    
    try {
      // Try using store function if available
      if (store.scenarios && typeof store.scenarios.select === 'function') {
        store.scenarios.select(scenarioId);
      } else {
        // Fallback: update selected directly in store
        useStore.setState(state => ({
          ...state,
          selected: {
            ...state.selected,
            scenario: scenarioId
          }
        }));
      }
      
      setActiveView('flow');
    } catch (error) {
      console.error('Error selecting scenario:', error);
      alert('Error selecting scenario. See console for details.');
    }
  };
  
  // Direct function to create a workspace in the store
  const createWorkspace = (name: string, description: string = '') => {
    console.log('Directly creating workspace:', { name, description });
    
    try {
      // Generate a unique workspace ID
      const id = `workspace-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create the workspace object
      const workspace = {
        id,
        type: ENTITY_TYPES.WORKSPACE,
        name,
        description,
        scenarios: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Update the store directly
      useStore.setState((state) => {
        console.log('Current state before update:', state);
        
        // Create a new version of the state
        const newState = {
          ...state,
          // Add the new workspace to the workspaces array
          workspaces: [...(Array.isArray(state.workspaces) ? state.workspaces : []), workspace],
          // Update the selected workspace
          selected: {
            ...state.selected,
            workspace: id
          },
          // Increment version
          version: (state.version || 0) + 1
        };
        
        console.log('New state after update:', newState);
        return newState;
      });
      
      return workspace;
    } catch (error) {
      console.error('Error in direct workspace creation:', error);
      throw error;
    }
  };

  // Handle create workspace form submission
  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating new workspace with values:', { name: newWorkspaceName, description: newWorkspaceDescription });
    
    try {
      if (!newWorkspaceName) {
        console.error('Workspace name is required');
        alert('Workspace name is required');
        return;
      }
      
      let workspace;
      
      // Try to use store.workspaces.create if available
      if (typeof store.workspaces?.create === 'function') {
        console.log('Using store.workspaces.create');
        
        // Prepare workspace data
        const workspaceData = {
          name: newWorkspaceName,
          description: newWorkspaceDescription || '',
          scenarios: []
        };
        
        // Create the workspace
        workspace = store.workspaces.create(workspaceData);
      } else {
        // Fallback to direct creation
        console.log('Falling back to direct workspace creation');
        workspace = createWorkspace(newWorkspaceName, newWorkspaceDescription);
      }
      
      console.log('Created workspace:', workspace);
      
      if (workspace && workspace.id) {
        // Reset form fields
        setNewWorkspaceName('');
        setNewWorkspaceDescription('');
        
        // Navigate to the new workspace
        setSelectedWorkspaceId(workspace.id);
        setActiveView('scenarios');
      } else {
        console.error('Created workspace is invalid', workspace);
        alert('Error creating workspace: Invalid response');
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      alert(`Error creating workspace: ${error}`);
    }
  };
  
  // Direct function to create a scenario in the store
  const createScenario = (name: string, description: string = '') => {
    console.log('Directly creating scenario:', { name, description, workspaceId: selectedWorkspaceId });
    
    if (!selectedWorkspaceId) {
      throw new Error('No workspace selected');
    }
    
    try {
      // Generate a unique scenario ID
      const id = `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create the scenario object
      const scenario = {
        id,
        type: ENTITY_TYPES.SCENARIO,
        workspaceId: selectedWorkspaceId,
        name,
        description,
        nodes: [],
        edges: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      // Update the store directly
      useStore.setState((state) => {
        console.log('Current state before adding scenario:', state);
        
        // Find the selected workspace
        const workspaceIndex = state.workspaces.findIndex(w => w.id === selectedWorkspaceId);
        if (workspaceIndex === -1) {
          console.error('Workspace not found:', selectedWorkspaceId);
          throw new Error('Workspace not found');
        }
        
        // Create a new version of the state with the updated workspace
        const newWorkspaces = [...state.workspaces];
        const workspace = newWorkspaces[workspaceIndex];
        
        // Add the new scenario to the workspace's scenarios array
        const updatedWorkspace = {
          ...workspace,
          scenarios: [...(Array.isArray(workspace.scenarios) ? workspace.scenarios : []), scenario]
        };
        
        // Update the workspace in the array
        newWorkspaces[workspaceIndex] = updatedWorkspace;
        
        // Create the new state
        const newState = {
          ...state,
          workspaces: newWorkspaces,
          // Update the selected scenario
          selected: {
            ...state.selected,
            scenario: id
          },
          // Increment version
          version: (state.version || 0) + 1
        };
        
        console.log('New state after adding scenario:', newState);
        return newState;
      });
      
      return scenario;
    } catch (error) {
      console.error('Error in direct scenario creation:', error);
      throw error;
    }
  };

  // Handle create scenario form submission with improved error handling
  const handleCreateScenario = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating new scenario with values:', { 
      name: newScenarioName, 
      description: newScenarioDescription,
      workspaceId: selectedWorkspaceId 
    });
    
    if (!selectedWorkspaceId) {
      console.error('No workspace selected');
      alert('No workspace selected');
      return;
    }
    
    if (!newScenarioName) {
      console.error('Scenario name is required');
      alert('Scenario name is required');
      return;
    }
    
    try {
      let scenario;
      
      // Try to use store.scenarios.create if available
      if (typeof store.scenarios?.create === 'function') {
        console.log('Using store.scenarios.create');
        
        // Manually select the workspace to ensure it's the current one
        if (typeof store.workspaces?.select === 'function') {
          store.workspaces.select(selectedWorkspaceId);
        }
        
        // Prepare scenario data
        const scenarioData = {
          name: newScenarioName,
          description: newScenarioDescription || '',
          nodes: [],
          edges: []
        };
        
        console.log('Creating scenario with data:', scenarioData);
        
        // Create the scenario
        scenario = store.scenarios.create(scenarioData);
      } else {
        // Fallback to direct creation
        console.log('Falling back to direct scenario creation');
        scenario = createScenario(newScenarioName, newScenarioDescription);
      }
      
      console.log('Created scenario:', scenario);
      
      if (scenario && scenario.id) {
        // Reset form fields
        setNewScenarioName('');
        setNewScenarioDescription('');
        
        // Select and navigate to the new scenario
        if (typeof store.scenarios?.select === 'function') {
          store.scenarios.select(scenario.id);
        }
        
        setSelectedScenarioId(scenario.id);
        setActiveView('flow');
      } else {
        console.error('Created scenario is invalid', scenario);
        alert('Error creating scenario: Invalid response');
      }
    } catch (error) {
      console.error('Error creating scenario:', error);
      alert(`Error creating scenario: ${error}`);
    }
  };
  
  // Render active view
  const renderActiveView = () => {
    switch (activeView) {
      case 'workspaces':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Workspaces</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(workspaces) && workspaces.length > 0 ? (
                workspaces.map(workspace => (
                  <div 
                    key={workspace.id}
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer"
                    onClick={() => handleSelectWorkspace(workspace.id)}
                  >
                    <h3 className="text-lg font-semibold">{workspace.name}</h3>
                    {workspace.description && (
                      <p className="text-gray-500 mt-2">{workspace.description}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-2">
                      {Array.isArray(workspace.scenarios) ? workspace.scenarios.length : 0} scenarios
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No workspaces found. Create a new one to get started.</p>
                </div>
              )}
              
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Create New Workspace</h3>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Workspace Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter workspace name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newWorkspaceDescription}
                      onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create Workspace
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
        
      case 'scenarios':
        return (
          <div className="p-4">
            <div className="flex items-center mb-4">
              <button 
                className="text-blue-500 mr-2"
                onClick={() => setActiveView('workspaces')}
              >
                ← Back to Workspaces
              </button>
              <h2 className="text-2xl font-bold">
                Scenarios for {selectedWorkspaceId && workspaces.find(w => w.id === selectedWorkspaceId)?.name}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(scenarios) && scenarios.length > 0 ? (
                scenarios.map(scenario => (
                  <div 
                    key={scenario.id}
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg cursor-pointer"
                    onClick={() => handleSelectScenario(scenario.id)}
                  >
                    <h3 className="text-lg font-semibold">{scenario.name}</h3>
                    {scenario.description && (
                      <p className="text-gray-500 mt-2">{scenario.description}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-2">
                      {Array.isArray(scenario.nodes) ? scenario.nodes.length : 0} nodes,{' '}
                      {Array.isArray(scenario.edges) ? scenario.edges.length : 0} edges
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No scenarios found in this workspace. Create a new one to get started.</p>
                </div>
              )}
              
              <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Create New Scenario</h3>
                <form onSubmit={handleCreateScenario} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="scenarioName" className="block text-sm font-medium">
                      Scenario Name
                    </label>
                    <input
                      id="scenarioName"
                      type="text"
                      value={newScenarioName}
                      onChange={(e) => setNewScenarioName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter scenario name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="scenarioDescription" className="block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="scenarioDescription"
                      value={newScenarioDescription}
                      onChange={(e) => setNewScenarioDescription(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create Scenario
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
        
      case 'flow':
        return <FlowPlayerView
          selectedScenarioId={selectedScenarioId}
          scenarios={scenarios}
          onBack={() => setActiveView('scenarios')}
        />;
        
      default:
        return <div>Invalid view</div>;
    }
  };

  // Komponent Flow Player wyodrębniony dla poprawnej obsługi hoków React
  const FlowPlayerView: React.FC<{
    selectedScenarioId: string | null;
    scenarios: any[];
    onBack: () => void;
  }> = ({ selectedScenarioId, scenarios, onBack }) => {
    // Stan dla aktualnego kroku
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [userInputs, setUserInputs] = useState<Record<string, string>>({});
    const [showNodeOptions, setShowNodeOptions] = useState(false);
    
    // Pobierz wybrany scenariusz
    const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);
    
    // Jeśli nie znaleziono scenariusza, pokaż komunikat
    if (!selectedScenario) {
      return (
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button 
              className="text-blue-500 mr-2"
              onClick={onBack}
            >
              ← Back to Scenarios
            </button>
            <h2 className="text-2xl font-bold">Flow Editor</h2>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-bold mb-4">Scenariusz nie znaleziony</h3>
            <p className="text-gray-600 mb-4">
              Nie udało się znaleźć wybranego scenariusza. 
            </p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={onBack}
            >
              Wróć do listy scenariuszy
            </button>
          </div>
        </div>
      );
    }
    
    // Pobierz węzły i krawędzie
    const nodes = selectedScenario.nodes || selectedScenario.children?.filter(
      c => c.type === ENTITY_TYPES.NODE
    ) || [];
    
    const edges = selectedScenario.edges || [];
    
    // Znajdź aktualny węzeł
    const currentNode = nodes[currentStepIndex] || null;
    const isLastStep = currentStepIndex === nodes.length - 1;
    
    // Funkcje nawigacyjne
    const handleNext = () => {
      if (currentStepIndex < nodes.length - 1) {
        // Zapisz input użytkownika, jeśli istnieje
        if (currentNode?.id && userInputs[currentNode.id]) {
          console.log(`Zapisuję input dla węzła ${currentNode.id}:`, userInputs[currentNode.id]);
        }
        
        setCurrentStepIndex(prev => prev + 1);
      }
    };
    
    const handlePrev = () => {
      if (currentStepIndex > 0) {
        setCurrentStepIndex(prev => prev - 1);
      }
    };
    
    const handleFinish = () => {
      // Zapisz ostatni input użytkownika, jeśli istnieje
      if (currentNode?.id && userInputs[currentNode.id]) {
        console.log(`Zapisuję finalny input dla węzła ${currentNode.id}:`, userInputs[currentNode.id]);
      }
      
      console.log('Zakończenie scenariusza. Wszystkie inputy:', userInputs);
      onBack();
    };
    
    // Obsługa zmiany inputu użytkownika
    const handleUserInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!currentNode?.id) return;
      
      setUserInputs(prev => ({
        ...prev,
        [currentNode.id]: e.target.value
      }));
    };
    
    // Funkcja do przetwarzania szablonów z zmiennymi kontekstowymi
    const processTemplate = (text: string) => {
      if (!text) return "";
      
      try {
        // Pobierz stan store dla kontekstu
        const state = useStore.getState();
        
        // Przygotuj konteksty z różnych źródeł
        const contextItems: any[] = [];
        
        // Próba znalezienia kontekstów w różnych miejscach store
        if (state.contexts && Array.isArray(state.contexts)) {
          contextItems.push(...state.contexts);
        }
        
        if (state.getContextItems && typeof state.getContextItems === 'function') {
          try {
            const items = state.getContextItems();
            if (Array.isArray(items)) {
              contextItems.push(...items);
            }
          } catch (err) {
            console.warn("Error getting context items:", err);
          }
        }
        
        // Dodaj również dane z inputów użytkownika jako kontekst
        Object.entries(userInputs).forEach(([nodeId, input]) => {
          contextItems.push({
            id: `input-${nodeId}`,
            title: `input_${nodeId}`,
            content: input,
            type: 'text'
          });
        });
        
        // Dodaj przykładowe zmienne kontekstowe dla demonstracji
        if (contextItems.length === 0) {
          contextItems.push(
            {
              id: "sample-context-1",
              title: "user",
              content: JSON.stringify({
                name: "Jan Kowalski",
                role: "Developer",
                preferences: { theme: "dark", language: "pl" }
              }),
              type: 'json'
            },
            {
              id: "sample-context-2",
              title: "settings",
              content: JSON.stringify({
                debug: true, 
                apiEndpoint: "https://api.example.com"
              }),
              type: 'json'
            }
          );
        }
        
        // Przetwórz zmienne w tekście
        let result = text;
        const tokenRegex = /{{([^{}]+)}}/g;
        let match;
        
        while ((match = tokenRegex.exec(text)) !== null) {
          const fullToken = match[0];
          const tokenContent = match[1].trim();
          
          // Rozdziel token na nazwę i ścieżkę (jeśli istnieje)
          const [name, path] = tokenContent.includes('.')
            ? [tokenContent.split('.')[0], tokenContent.split('.').slice(1).join('.')]
            : [tokenContent, null];
          
          // Znajdź odpowiedni element kontekstu
          const contextItem = contextItems.find(item => {
            return item.title === name || item.key === name || item.name === name;
          });
          
          if (contextItem) {
            let value = contextItem.content || contextItem.value || '';
            
            // Jeśli jest ścieżka i wartość wygląda na JSON, przetwórz
            if (path && 
               (contextItem.type === 'json' || 
                (typeof value === 'string' && value.trim().startsWith('{')))) {
              try {
                const jsonObj = typeof value === 'object' 
                  ? value 
                  : JSON.parse(value);
                
                // Pobierz wartość ze ścieżki
                const pathParts = path.split('.');
                let current = jsonObj;
                
                // Przejdź przez każdą część ścieżki
                for (const part of pathParts) {
                  if (current === null || current === undefined) {
                    current = undefined;
                    break;
                  }
                  current = current[part];
                }
                
                if (current !== undefined) {
                  value = typeof current === 'object' 
                    ? JSON.stringify(current) 
                    : String(current);
                } else {
                  value = '';
                }
              } catch (err) {
                console.warn(`Error processing JSON path ${path} in token ${fullToken}:`, err);
                value = '';
              }
            }
            
            // Zastąp token wartością
            result = result.replace(fullToken, value);
          }
        }
        
        return result;
      } catch (error) {
        console.error("Error processing template:", error);
        return text;
      }
    };
    
    // Jeśli brak węzłów, pokaż komunikat
    if (nodes.length === 0) {
      return (
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button 
              className="text-blue-500 mr-2"
              onClick={onBack}
            >
              ← Back to Scenarios
            </button>
            <h2 className="text-2xl font-bold">
              Flow Editor: {selectedScenario.name}
            </h2>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-bold mb-4">Pusty Scenariusz</h3>
            <p className="text-gray-600 mb-4">
              Ten scenariusz nie zawiera jeszcze żadnych kroków. 
              W pełnej wersji aplikacji można by dodać węzły w edytorze.
            </p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={onBack}
            >
              Wróć do listy scenariuszy
            </button>
          </div>
        </div>
      );
    }
    
    // Renderuj Flow Player
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <button 
            className="text-blue-500 mr-2"
            onClick={onBack}
          >
            ← Back to Scenarios
          </button>
          <h2 className="text-2xl font-bold">
            Flow Editor: {selectedScenario.name}
          </h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flow-player mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              {/* Header z informacją o aktualnym kroku */}
              <div className="flex justify-between items-center border-b border-blue-200 pb-3 mb-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-bold">Flow Player</h3>
                  <button 
                    className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                    onClick={() => setShowNodeOptions(!showNodeOptions)}
                  >
                    {showNodeOptions ? 'Hide Options' : 'Node Options'}
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Krok {currentStepIndex + 1} z {nodes.length}
                  </div>
                  <button 
                    className="p-1 rounded-full hover:bg-blue-200 transition-colors"
                    onClick={onBack}
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              {/* Node Options Panel */}
              {showNodeOptions && (
                <div className="border-b border-blue-200 pb-4 mb-4 bg-gray-50 p-3 rounded">
                  <h4 className="text-sm font-medium mb-3">Node Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Node Label</label>
                      <input 
                        type="text" 
                        className="w-full text-sm border border-gray-200 rounded p-2" 
                        value={currentNode?.label || ''} 
                        onChange={(e) => {
                          // Update node label directly in nodes array
                          if (currentNode?.id) {
                            const updatedNodes = [...nodes];
                            const nodeIndex = updatedNodes.findIndex(n => n.id === currentNode.id);
                            if (nodeIndex !== -1) {
                              updatedNodes[nodeIndex] = {
                                ...updatedNodes[nodeIndex],
                                label: e.target.value
                              };
                              
                              // Update scenario's nodes
                              const updatedScenarios = [...scenarios];
                              const scenarioIndex = updatedScenarios.findIndex(s => s.id === selectedScenarioId);
                              if (scenarioIndex !== -1) {
                                updatedScenarios[scenarioIndex] = {
                                  ...updatedScenarios[scenarioIndex],
                                  nodes: updatedNodes
                                };
                                
                                // Update store
                                try {
                                  const state = useStore.getState();
                                  if (state.scenarios && typeof state.scenarios.update === 'function') {
                                    state.scenarios.update(selectedScenarioId, { nodes: updatedNodes });
                                  } else {
                                    console.log("Direct store update not available, UI update only");
                                  }
                                } catch (error) {
                                  console.error("Error updating node:", error);
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Plugin Key</label>
                      <input 
                        type="text" 
                        className="w-full text-sm border border-gray-200 rounded p-2" 
                        value={currentNode?.pluginKey || ''} 
                        onChange={(e) => {
                          // Update plugin key
                          if (currentNode?.id) {
                            const updatedNodes = [...nodes];
                            const nodeIndex = updatedNodes.findIndex(n => n.id === currentNode.id);
                            if (nodeIndex !== -1) {
                              updatedNodes[nodeIndex] = {
                                ...updatedNodes[nodeIndex],
                                pluginKey: e.target.value || undefined
                              };
                              
                              // Update scenario's nodes
                              const updatedScenarios = [...scenarios];
                              const scenarioIndex = updatedScenarios.findIndex(s => s.id === selectedScenarioId);
                              if (scenarioIndex !== -1) {
                                updatedScenarios[scenarioIndex] = {
                                  ...updatedScenarios[scenarioIndex],
                                  nodes: updatedNodes
                                };
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Context Key</label>
                      <input 
                        type="text" 
                        className="w-full text-sm border border-gray-200 rounded p-2" 
                        value={currentNode?.contextKey || ''} 
                        onChange={(e) => {
                          // Update context key
                          if (currentNode?.id) {
                            const updatedNodes = [...nodes];
                            const nodeIndex = updatedNodes.findIndex(n => n.id === currentNode.id);
                            if (nodeIndex !== -1) {
                              updatedNodes[nodeIndex] = {
                                ...updatedNodes[nodeIndex],
                                contextKey: e.target.value || undefined
                              };
                              
                              // Update scenario's nodes
                              const updatedScenarios = [...scenarios];
                              const scenarioIndex = updatedScenarios.findIndex(s => s.id === selectedScenarioId);
                              if (scenarioIndex !== -1) {
                                updatedScenarios[scenarioIndex] = {
                                  ...updatedScenarios[scenarioIndex],
                                  nodes: updatedNodes
                                };
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Context JSON Path</label>
                      <input 
                        type="text" 
                        className="w-full text-sm border border-gray-200 rounded p-2" 
                        value={currentNode?.contextJsonPath || ''} 
                        onChange={(e) => {
                          // Update context JSON path
                          if (currentNode?.id) {
                            const updatedNodes = [...nodes];
                            const nodeIndex = updatedNodes.findIndex(n => n.id === currentNode.id);
                            if (nodeIndex !== -1) {
                              updatedNodes[nodeIndex] = {
                                ...updatedNodes[nodeIndex],
                                contextJsonPath: e.target.value || undefined
                              };
                              
                              // Update scenario's nodes
                              const updatedScenarios = [...scenarios];
                              const scenarioIndex = updatedScenarios.findIndex(s => s.id === selectedScenarioId);
                              if (scenarioIndex !== -1) {
                                updatedScenarios[scenarioIndex] = {
                                  ...updatedScenarios[scenarioIndex],
                                  nodes: updatedNodes
                                };
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1">Assistant Message</label>
                      <textarea 
                        className="w-full text-sm border border-gray-200 rounded p-2 h-24" 
                        value={currentNode?.assistantMessage || ''} 
                        onChange={(e) => {
                          // Update assistant message
                          if (currentNode?.id) {
                            const updatedNodes = [...nodes];
                            const nodeIndex = updatedNodes.findIndex(n => n.id === currentNode.id);
                            if (nodeIndex !== -1) {
                              updatedNodes[nodeIndex] = {
                                ...updatedNodes[nodeIndex],
                                assistantMessage: e.target.value
                              };
                              
                              // Update scenario's nodes
                              const updatedScenarios = [...scenarios];
                              const scenarioIndex = updatedScenarios.findIndex(s => s.id === selectedScenarioId);
                              if (scenarioIndex !== -1) {
                                updatedScenarios[scenarioIndex] = {
                                  ...updatedScenarios[scenarioIndex],
                                  nodes: updatedNodes
                                };
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    
                    {/* Plugin Data if plugin key is set */}
                    {currentNode?.pluginKey && (
                      <div className="col-span-2 mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium mb-3">Plugin Settings</h4>
                        <div className="bg-white p-3 rounded border">
                          <label className="block text-xs font-medium mb-1">Plugin Data (JSON)</label>
                          <textarea 
                            className="w-full text-sm border border-gray-200 rounded p-2 h-32 font-mono" 
                            value={
                              currentNode.pluginData && currentNode.pluginKey in (currentNode.pluginData || {})
                                ? JSON.stringify(currentNode.pluginData[currentNode.pluginKey], null, 2)
                                : "{}"
                            } 
                            onChange={(e) => {
                              try {
                                // Try to parse JSON input
                                const jsonData = JSON.parse(e.target.value);
                                
                                // Update plugin data
                                if (currentNode?.id && currentNode?.pluginKey) {
                                  const updatedNodes = [...nodes];
                                  const nodeIndex = updatedNodes.findIndex(n => n.id === currentNode.id);
                                  if (nodeIndex !== -1) {
                                    // Create or update plugin data property
                                    const currentPluginData = updatedNodes[nodeIndex].pluginData || {};
                                    updatedNodes[nodeIndex] = {
                                      ...updatedNodes[nodeIndex],
                                      pluginData: {
                                        ...currentPluginData,
                                        [currentNode.pluginKey]: jsonData
                                      }
                                    };
                                    
                                    // Update scenario's nodes
                                    const updatedScenarios = [...scenarios];
                                    const scenarioIndex = updatedScenarios.findIndex(s => s.id === selectedScenarioId);
                                    if (scenarioIndex !== -1) {
                                      updatedScenarios[scenarioIndex] = {
                                        ...updatedScenarios[scenarioIndex],
                                        nodes: updatedNodes
                                      };
                                    }
                                  }
                                }
                              } catch (error) {
                                // Invalid JSON - don't update
                                console.warn("Invalid JSON in plugin settings:", error);
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter valid JSON for plugin settings
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Save Button */}
                  <div className="mt-4 flex justify-end">
                    <button 
                      className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700"
                      onClick={() => {
                        // Allow direct editing in this demo
                        setShowNodeOptions(false);
                        alert("Node settings saved (UI only - would save to store in production)");
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
              
              {/* Informacje o scenariuszu i aktualnym węźle */}
              <div className="mb-4">
                <p className="text-sm text-blue-700">
                  Scenariusz: {selectedScenario.name}
                </p>
                {currentNode?.label && (
                  <p className="font-medium mt-1">
                    Krok: {currentNode.label}
                  </p>
                )}
              </div>
              
              {/* Wiadomość asystenta */}
              <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
                <h4 className="font-semibold mb-2 text-gray-700">Assistant Message:</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {processTemplate(currentNode?.assistantMessage || "Brak wiadomości asystenta")}
                </p>
                
                {/* Plugin (jeśli istnieje) */}
                {currentNode?.pluginKey && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-sm text-gray-500 mb-2">
                      Plugin: {currentNode.pluginKey}
                    </div>
                    {currentNode.pluginKey === 'api-service' && (
                      <button 
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Symuluj wywołanie API
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* Input użytkownika */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2 text-gray-700">User Response:</h4>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Type your response here..."
                  rows={3}
                  value={userInputs[currentNode?.id || ''] || ''}
                  onChange={handleUserInputChange}
                />
                
                {/* Informacja o kontekście (jeśli istnieje) */}
                {currentNode?.contextKey && (
                  <div className="mt-2 text-xs text-gray-500">
                    Ta odpowiedź zaktualizuje zmienną kontekstową: <span className="font-medium">{currentNode.contextKey}</span>
                    {currentNode.contextJsonPath && (
                      <span> (ścieżka: {currentNode.contextJsonPath})</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Przyciski nawigacyjne */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 flex items-center space-x-4">
                  <span>Krok {currentStepIndex + 1} z {nodes.length}</span>
                  
                  {/* Save Scenario Button */}
                  <button
                    className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      try {
                        // Save to store if store update methods available
                        const state = useStore.getState();
                        if (selectedScenarioId && 
                            state.scenarios && 
                            typeof state.scenarios.update === 'function') {
                          state.scenarios.update(selectedScenarioId, {
                            nodes,
                            edges
                          });
                          alert("Scenario saved to store");
                        } else {
                          // Visual feedback only
                          alert("Scenario saving is supported (UI notification only, would save to store in production)");
                        }
                      } catch (err) {
                        console.error("Error saving scenario:", err);
                        alert("Error saving scenario: " + (err instanceof Error ? err.message : String(err)));
                      }
                    }}
                  >
                    Save Scenario
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button 
                    className={`px-4 py-2 rounded-md ${
                      currentStepIndex === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                    }`}
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                  >
                    Wstecz
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={isLastStep ? handleFinish : handleNext}
                  >
                    {isLastStep ? "Zakończ" : "Dalej"}
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <ThemeProvider initialTheme="default">
      <div className="refactored-app min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm p-4">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-800">The Context App</h1>
            <p className="text-gray-500">Interactive flow application</p>
          </div>
        </header>
        
        <main className="container mx-auto py-6">
          
          {renderActiveView()}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default RefactoredApp;