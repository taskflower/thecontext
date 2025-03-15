import React, { useState, useCallback } from 'react';
import { PlusCircle, X, Trash2, Link } from 'lucide-react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import ReactFlow, { 
  MiniMap, Controls, Background, addEdge,
  useNodesState, useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

// Constants and Types
const TYPES = { WORKSPACE: 'workspace', SCENARIO: 'scenario', NODE: 'node', EDGE: 'edge' };

// Reusable UI Components
const SectionHeader = ({ title, onAddClick }) => (
  <div className="flex items-center justify-between mb-2">
    <div className="text-sm font-medium">{title}</div>
    <button className="p-1 rounded-md hover:bg-gray-100 text-gray-700" onClick={onAddClick}>
      <PlusCircle className="h-4 w-4" />
    </button>
  </div>
);

const EmptyState = () => <div className="px-2 py-4 text-center text-xs text-gray-500">Brak elementów</div>;

const CardPanel = ({ title, children, onAddClick }) => (
  <div className="bg-white rounded-md shadow-sm mb-3">
    <div className="p-3">
      <SectionHeader title={title} onAddClick={onAddClick} />
      {children}
    </div>
  </div>
);

const Dialog = ({ title, onClose, onAdd, fields, formData, onChange }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="p-4">
        <div className="grid gap-3 py-3">
          {fields.map(field => 
            field.type === 'select' ? (
              <select
                key={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select {field.placeholder} --</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <input
                key={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={onChange}
                placeholder={field.placeholder}
                type={field.type || 'text'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )
          )}
          <button 
            onClick={onAdd}
            className="py-1 px-2 text-xs rounded-md font-medium bg-blue-500 text-white hover:bg-blue-600"
          >
            Dodaj
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Modal Step Player
const StepModal = ({ steps, currentStep, onNext, onPrev, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-medium">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
        </h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <div className="font-medium mb-2">Node: {steps[currentStep].label}</div>
          <div className="text-sm mb-2">Value: {steps[currentStep].value}</div>
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={onPrev}
            disabled={currentStep === 0}
            className={`px-3 py-1 rounded-md text-sm ${
              currentStep === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            Previous
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button 
              onClick={onNext}
              className="px-3 py-1 rounded-md text-sm bg-blue-500 text-white hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="px-3 py-1 rounded-md text-sm bg-green-500 text-white hover:bg-green-600"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Item List Component
const ItemList = ({ items, selected, onClick, onDelete, renderItem }) => (
  <div className="overflow-auto h-[180px]">
    <div className="space-y-1">
      {items.map(item => (
        <div 
          key={item.id}
          className={`flex items-center px-2 py-1.5 rounded-sm text-xs cursor-pointer ${
            item.id === selected ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
        >
          <div className="flex-1 truncate" onClick={() => onClick(item.id)}>
            {renderItem(item)}
          </div>
          <button 
            className="p-1 opacity-70 hover:opacity-100 hover:text-red-500"
            onClick={e => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
      {items.length === 0 && <EmptyState />}
    </div>
  </div>
);

// Data Store
const useAppStore = create(
  immer((set, get) => ({
    // Initial state
    items: [
      {
        id: 'workspace1', type: TYPES.WORKSPACE, title: 'Project Alpha',
        children: [
          {
            id: 'scenario1', type: TYPES.SCENARIO, name: 'Main Flow', description: 'Primary user journey',
            children: [
              { id: 'node1', type: TYPES.NODE, label: 'Start', value: 100, position: { x: 100, y: 100 } },
              { id: 'node2', type: TYPES.NODE, label: 'Process', value: 250, position: { x: 300, y: 200 } }
            ],
            edges: [
              { id: 'edge1', source: 'node1', target: 'node2', label: 'Flow' }
            ]
          }
        ]
      }
    ],
    selected: { workspace: 'workspace1', scenario: 'scenario1' },
    // This will trigger renders when state changes
    stateVersion: 0,

    // Actions
    selectWorkspace: (workspaceId) => set((state) => {
      state.selected.workspace = workspaceId;
      const workspace = state.items.find(w => w.id === workspaceId);
      if (workspace?.children.length > 0) {
        state.selected.scenario = workspace.children[0].id;
      } else {
        state.selected.scenario = '';
      }
      state.stateVersion++;
    }),

    selectScenario: (scenarioId) => set((state) => {
      state.selected.scenario = scenarioId;
      state.stateVersion++;
    }),

    addWorkspace: (payload) => set((state) => {
      const newWorkspace = {
        id: `workspace-${Date.now()}`, 
        type: TYPES.WORKSPACE,
        title: payload.title, 
        children: []
      };
      state.items.push(newWorkspace);
      state.selected.workspace = newWorkspace.id;
      state.stateVersion++;
    }),

    addScenario: (payload) => set((state) => {
      const newScenario = {
        id: `scenario-${Date.now()}`, 
        type: TYPES.SCENARIO,
        name: payload.name, 
        description: payload.description, 
        children: [],
        edges: []
      };
      
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (workspace) {
        workspace.children.push(newScenario);
        state.selected.scenario = newScenario.id;
      }
      state.stateVersion++;
    }),

    addNode: (payload) => set((state) => {
      const newNode = {
        id: `node-${Date.now()}`, 
        type: TYPES.NODE,
        label: payload.label, 
        value: Number(payload.value),
        position: payload.position || { x: 100, y: 100 }
      };
      
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
      if (scenario) {
        scenario.children.push(newNode);
        state.stateVersion++;
      }
    }),

    addEdge: (payload) => set((state) => {
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: payload.source,
        target: payload.target,
        label: payload.label || ''
      };
      
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
      if (scenario) {
        if (!scenario.edges) scenario.edges = [];
        scenario.edges.push(newEdge);
        state.stateVersion++;
      }
    }),

    updateNodePosition: (nodeId, position) => set((state) => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
      const node = scenario?.children.find(n => n.id === nodeId);
      if (node) {
        node.position = position;
        state.stateVersion++;
      }
    }),

    deleteWorkspace: (workspaceId) => set((state) => {
      const index = state.items.findIndex(w => w.id === workspaceId);
      if (index !== -1) {
        state.items.splice(index, 1);
        
        if (workspaceId === state.selected.workspace) {
          if (state.items.length > 0) {
            state.selected.workspace = state.items[0].id;
            state.selected.scenario = state.items[0].children?.[0]?.id || '';
          } else {
            state.selected.workspace = '';
            state.selected.scenario = '';
          }
        }
        state.stateVersion++;
      }
    }),

    deleteScenario: (scenarioId) => set((state) => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (workspace) {
        const index = workspace.children.findIndex(s => s.id === scenarioId);
        if (index !== -1) {
          workspace.children.splice(index, 1);
          
          if (scenarioId === state.selected.scenario) {
            if (workspace.children.length > 0) {
              state.selected.scenario = workspace.children[0].id;
            } else {
              state.selected.scenario = '';
            }
          }
          state.stateVersion++;
        }
      }
    }),

    deleteNode: (nodeId) => set((state) => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
      if (scenario) {
        const index = scenario.children.findIndex(n => n.id === nodeId);
        if (index !== -1) {
          scenario.children.splice(index, 1);
          // Remove connected edges
          if (scenario.edges) {
            scenario.edges = scenario.edges.filter(
              edge => edge.source !== nodeId && edge.target !== nodeId
            );
          }
          state.stateVersion++;
        }
      }
    }),

    deleteEdge: (edgeId) => set((state) => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
      if (scenario?.edges) {
        const index = scenario.edges.findIndex(e => e.id === edgeId);
        if (index !== -1) {
          scenario.edges.splice(index, 1);
          state.stateVersion++;
        }
      }
    }),

    getActiveScenarioData: () => {
      const state = get();
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (!workspace) return { nodes: [], edges: [] };
      
      const scenario = workspace.children.find(s => s.id === state.selected.scenario);
      if (!scenario) return { nodes: [], edges: [] };
      
      const nodes = scenario.children.map(node => ({
        id: node.id,
        data: { label: `${node.label} (${node.value})` },
        position: node.position
      }));
      
      const edges = scenario.edges?.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label
      })) || [];
      
      return { nodes, edges };
    },
    
    getCurrentScenario: () => {
      const state = get();
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (!workspace) return null;
      return workspace.children.find(s => s.id === state.selected.scenario);
    }
  }))
);

// Dialog hook for reusable dialog state management
const useDialogState = (initialFields) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({});
  
  const openDialog = (initialData = {}) => { 
    setFormData(initialData); 
    setIsOpen(true); 
  };
  
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  return { isOpen, formData, openDialog, handleChange, setIsOpen };
};

// Business Components
const WorkspacesList = () => {
  const items = useAppStore(state => state.items);
  const selected = useAppStore(state => state.selected);
  const selectWorkspace = useAppStore(state => state.selectWorkspace);
  const deleteWorkspace = useAppStore(state => state.deleteWorkspace);
  const addWorkspace = useAppStore(state => state.addWorkspace);
  // Force component to update when state changes
  const stateVersion = useAppStore(state => state.stateVersion);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ title: '' });
  
  const handleAdd = () => {
    if (formData.title?.trim()) {
      addWorkspace(formData);
      setIsOpen(false);
    }
  };
  
  return (
    <>
      <CardPanel title="Workspaces" onAddClick={() => openDialog({ title: '' })}>
        <ItemList 
          items={items}
          selected={selected.workspace}
          onClick={selectWorkspace}
          onDelete={deleteWorkspace}
          renderItem={item => <div className="font-medium">{item.title}</div>}
        />
      </CardPanel>
      
      {isOpen && (
        <Dialog 
          title="Nowy Workspace"
          onClose={() => setIsOpen(false)}
          onAdd={handleAdd}
          fields={[{ name: 'title', placeholder: 'Workspace name' }]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </>
  );
};

const ScenariosList = () => {
  const items = useAppStore(state => state.items);
  const selected = useAppStore(state => state.selected);
  const selectScenario = useAppStore(state => state.selectScenario);
  const deleteScenario = useAppStore(state => state.deleteScenario);
  const addScenario = useAppStore(state => state.addScenario);
  // Force component to update when state changes
  const stateVersion = useAppStore(state => state.stateVersion);
  
  const workspace = items.find(w => w.id === selected.workspace);
  const scenarios = workspace?.children || [];
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ name: '', description: '' });
  
  const handleAdd = () => {
    if (formData.name?.trim()) {
      addScenario(formData);
      setIsOpen(false);
    }
  };
  
  return (
    <>
      <CardPanel title="Scenarios" onAddClick={() => openDialog({ name: '', description: '' })}>
        <ItemList 
          items={scenarios}
          selected={selected.scenario}
          onClick={selectScenario}
          onDelete={deleteScenario}
          renderItem={item => (
            <>
              <div className="font-medium">{item.name}</div>
              {item.description && <div className="text-xs opacity-70 truncate">{item.description}</div>}
            </>
          )}
        />
      </CardPanel>
      
      {isOpen && (
        <Dialog 
          title="Nowy Scenario"
          onClose={() => setIsOpen(false)}
          onAdd={handleAdd}
          fields={[
            { name: 'name', placeholder: 'Scenario name' },
            { name: 'description', placeholder: 'Description' }
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </>
  );
};

const NodesList = () => {
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const deleteNode = useAppStore(state => state.deleteNode);
  const addNode = useAppStore(state => state.addNode);
  // Force component to update when state changes
  const stateVersion = useAppStore(state => state.stateVersion);
  
  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ label: '', value: '' });
  
  const handleAdd = () => {
    if (formData.label?.trim() && formData.value?.trim()) {
      addNode(formData);
      setIsOpen(false);
    }
  };
  
  return (
    <>
      <CardPanel title="Nodes" onAddClick={() => openDialog({ label: '', value: '' })}>
        <ItemList 
          items={nodes}
          selected=""
          onClick={() => {}}
          onDelete={deleteNode}
          renderItem={item => (
            <div className="flex items-center">
              <div className="font-medium">{item.label}</div>
              <span className="ml-auto inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 text-[10px] h-4">
                {item.value}
              </span>
            </div>
          )}
        />
      </CardPanel>
      
      {isOpen && (
        <Dialog 
          title="Nowy Node"
          onClose={() => setIsOpen(false)}
          onAdd={handleAdd}
          fields={[
            { name: 'label', placeholder: 'Node name' },
            { name: 'value', placeholder: 'Value', type: 'number' }
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </>
  );
};

const EdgesList = () => {
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const deleteEdge = useAppStore(state => state.deleteEdge);
  const addEdge = useAppStore(state => state.addEdge);
  // Force component to update when state changes
  const stateVersion = useAppStore(state => state.stateVersion);
  
  const scenario = getCurrentScenario();
  const edges = scenario?.edges || [];
  const nodes = scenario?.children || [];
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = 
    useDialogState({ source: '', target: '', label: '' });
  
  const handleAdd = () => {
    if (formData.source && formData.target) {
      addEdge(formData);
      setIsOpen(false);
    }
  };
  
  const getNodeLabel = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.label : nodeId;
  };
  
  return (
    <>
      <CardPanel title="Edges" onAddClick={() => 
        openDialog({ 
          source: nodes[0]?.id || '', 
          target: nodes[1]?.id || '', 
          label: '' 
        })
      }>
        <ItemList 
          items={edges}
          selected=""
          onClick={() => {}}
          onDelete={deleteEdge}
          renderItem={item => (
            <div className="font-medium flex items-center">
              {getNodeLabel(item.source)}
              <Link className="h-3 w-3 mx-1" />
              {getNodeLabel(item.target)}
              {item.label && <span className="ml-1 text-gray-500">({item.label})</span>}
            </div>
          )}
        />
      </CardPanel>
      
      {isOpen && (
        <Dialog 
          title="New Edge"
          onClose={() => setIsOpen(false)}
          onAdd={handleAdd}
          fields={[
            { 
              name: 'source', 
              placeholder: 'Source node',
              type: 'select',
              options: nodes.map(n => ({ value: n.id, label: n.label }))
            },
            { 
              name: 'target', 
              placeholder: 'Target node',
              type: 'select',
              options: nodes.map(n => ({ value: n.id, label: n.label }))
            },
            { name: 'label', placeholder: 'Edge label (optional)' }
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </>
  );
};

// Flow Graph Component
const FlowGraph = () => {
  const items = useAppStore(state => state.items);
  const selected = useAppStore(state => state.selected);
  const getActiveScenarioData = useAppStore(state => state.getActiveScenarioData);
  const addEdge = useAppStore(state => state.addEdge);
  const updateNodePosition = useAppStore(state => state.updateNodePosition);
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  // Force component to update when state changes
  const stateVersion = useAppStore(state => state.stateVersion);
  
  const { nodes: initialNodes, edges: initialEdges } = getActiveScenarioData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [flowPath, setFlowPath] = useState([]);
  
  // Update the graph when data changes
  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getActiveScenarioData();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [getActiveScenarioData, selected.workspace, selected.scenario, items, setNodes, setEdges, stateVersion]);
  
  const onConnect = useCallback(params => {
    addEdge({
      source: params.source,
      target: params.target
    });
  }, [addEdge]);
  
  const onNodeDragStop = useCallback((_, node) => {
    updateNodePosition(node.id, node.position);
  }, [updateNodePosition]);
  
  // Find start node and calculate flow path
  const calculateFlowPath = useCallback(() => {
    const scenario = getCurrentScenario();
    if (!scenario) return [];
    
    const { children: scenarioNodes = [], edges: scenarioEdges = [] } = scenario;
    
    // Create node incoming edge count map
    const incomingMap = new Map();
    scenarioEdges.forEach(edge => {
      incomingMap.set(edge.target, (incomingMap.get(edge.target) || 0) + 1);
    });
    
    // Find start node (outgoing edges but no incoming)
    let startNodeId = null;
    for (const node of scenarioNodes) {
      const hasOutgoing = scenarioEdges.some(edge => edge.source === node.id);
      const incomingCount = incomingMap.get(node.id) || 0;
      
      if (hasOutgoing && incomingCount === 0) {
        startNodeId = node.id;
        break;
      }
    }
    
    // If no clear start, take first node
    if (!startNodeId && scenarioNodes.length > 0) {
      startNodeId = scenarioNodes[0].id;
    }
    
    if (!startNodeId) return [];
    
    // Create graph adjacency map
    const edgesMap = new Map();
    scenarioEdges.forEach(edge => {
      if (!edgesMap.has(edge.source)) edgesMap.set(edge.source, []);
      edgesMap.get(edge.source).push(edge.target);
    });
    
    // Trace path with DFS
    const path = [];
    const visited = new Set();
    
    const dfs = (nodeId) => {
      if (visited.has(nodeId)) return;
      
      const nodeData = scenarioNodes.find(n => n.id === nodeId);
      if (nodeData) {
        path.push(nodeData);
        visited.add(nodeId);
        
        const nextNodes = edgesMap.get(nodeId) || [];
        for (const next of nextNodes) dfs(next);
      }
    };
    
    dfs(startNodeId);
    return path;
  }, [getCurrentScenario]);
  
  // Flow player controls
  const handlePlay = useCallback(() => {
    const path = calculateFlowPath();
    if (path.length > 0) {
      setFlowPath(path);
      setCurrentNodeIndex(0);
      setIsPlaying(true);
    }
  }, [calculateFlowPath]);
  
  return (
    <div className="bg-white rounded-md shadow-sm p-0 h-[400px] relative">
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={handlePlay}
          className="p-2 rounded-md bg-blue-500 text-white text-xs font-medium hover:bg-blue-600"
        >
          Play Flow
        </button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      
      {isPlaying && flowPath.length > 0 && (
        <StepModal 
          steps={flowPath}
          currentStep={currentNodeIndex}
          onNext={() => setCurrentNodeIndex(prev => Math.min(prev + 1, flowPath.length - 1))}
          onPrev={() => setCurrentNodeIndex(prev => Math.max(prev - 1, 0))}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
};

// App Component
const App = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="text-sm font-medium mb-4">Workspace Manager (Zustand + Immer + React Flow)</div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1">
        <WorkspacesList />
        <ScenariosList />
        <NodesList />
        <EdgesList />
      </div>
      <div className="md:col-span-3">
        <FlowGraph />
      </div>
    </div>
  </div>
);

export default App;