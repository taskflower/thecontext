/* eslint-disable @typescript-eslint/no-explicit-any */
// src/stores/importExportStore.ts - nowy store do zarządzania eksportem/importem
import { create } from 'zustand';
import { useWorkspaceStore } from './workspaceStore';
import { useScenarioStore } from './scenarioStore';
import { useNodeStore } from './nodeStore';
import { usePluginStore } from './pluginStore';


interface ImportExportState {
  isExporting: boolean;
  isImporting: boolean;
  lastExportedAt: string | null;
  lastImportedAt: string | null;
  exportError: string | null;
  importError: string | null;
}
interface ExportedData {
  version: string;
  exportedAt: string;
  workspace: any; // or a more specific type if you have one
  scenarios: any; // or a more specific type if you have one
  nodes: any; // or a more specific type if you have one
  edges: any; // or a more specific type if you have one
  plugins: any; // or a more specific type if you have one
}

interface ImportExportActions {
  exportWorkspace: (workspaceId: string) => Promise<void>;
  importWorkspace: (data: ExportedData) => Promise<void>;
  resetErrors: () => void;
}

export const useImportExportStore = create<ImportExportState & ImportExportActions>()((set) => ({
  isExporting: false,
  isImporting: false,
  lastExportedAt: null,
  lastImportedAt: null,
  exportError: null,
  importError: null,
  
  exportWorkspace: async (workspaceId: string) => {
    set({ isExporting: true, exportError: null });
    
    try {
      const workspaceStore = useWorkspaceStore.getState();
      const scenarioStore = useScenarioStore.getState();
      const nodeStore = useNodeStore.getState();
      const pluginStore = usePluginStore.getState();
      
      const workspace = workspaceStore.workspaces[workspaceId];
      if (!workspace) {
        throw new Error(`Workspace with id ${workspaceId} not found`);
      }
      
      // Create export object with all related data
      const exportData: ExportedData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        workspace,
        scenarios: {},
        nodes: {},
        edges: {},
        plugins: {}
      };
      
      // Get all scenarios for this workspace
      const scenarioIds = workspace.scenarioIds || [];
      scenarioIds.forEach(id => {
        const scenario = scenarioStore.getScenario(id);
        if (scenario) {
          exportData.scenarios[id] = scenario;
          
          // Get edges for this scenario
          scenario.edgeIds.forEach(edgeId => {
            const edge = scenarioStore.edges[edgeId];
            if (edge) {
              exportData.edges[edgeId] = edge;
            }
          });
          
          // Get nodes for this scenario
          const nodes = nodeStore.getNodesByScenario(id);
          nodes.forEach(node => {
            exportData.nodes[node.id] = node;
            
            // Collect plugin info if node uses a plugin
            if (node.data.pluginId && pluginStore.plugins[node.data.pluginId]) {
              const pluginId = node.data.pluginId;
              const pluginState = pluginStore.getPluginState(pluginId);
              
              if (pluginState) {
                exportData.plugins[pluginId] = {
                  id: pluginId,
                  config: pluginState.config
                };
              }
            }
          });
        }
      });
      
      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `workspace_${workspace.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      set({ isExporting: false, lastExportedAt: new Date().toISOString() });
    } catch (error) {
      set({
        isExporting: false,
        exportError: error instanceof Error ? error.message : String(error)
      });
    }
  },
  
  importWorkspace: async (data: ExportedData) => {
    set({ isImporting: true, importError: null });
    
    try {
      // Validate import data
      if (!data.workspace || !data.version) {
        throw new Error('Invalid import file format');
      }
      
      const workspaceStore = useWorkspaceStore.getState();
      const scenarioStore = useScenarioStore.getState();
      const nodeStore = useNodeStore.getState();
      const pluginStore = usePluginStore.getState();
      
      // First, import workspace
      const workspace = data.workspace;
      const existingWorkspace = Object.values(workspaceStore.workspaces).find(w => w.name === workspace.name);
      
      // Create a new workspace with a unique name to avoid conflicts
      const workspaceName = existingWorkspace 
        ? `${workspace.name} (Imported ${new Date().toLocaleTimeString()})`
        : workspace.name;
      
      const newWorkspaceId = workspaceStore.createWorkspace(
        workspaceName, 
        workspace.description
      );
      
      // Update workspace context if it exists
      if (workspace.context) {
        workspaceStore.updateWorkspaceContext(newWorkspaceId, workspace.context);
      }
      
      // Map of old IDs to new IDs for reference updates
      const scenarioIdMap: Record<string, string> = {};
      const nodeIdMap: Record<string, string> = {};
      const edgeIdMap: Record<string, string> = {};
      
      // Import scenarios
      Object.values(data.scenarios).forEach((scenarioData: any) => {
        const newScenarioId = scenarioStore.createScenario(
          scenarioData.name,
          newWorkspaceId,
          scenarioData.description
        );
        
        scenarioIdMap[scenarioData.id] = newScenarioId;
      });
      
      // Import nodes
      Object.values(data.nodes).forEach((nodeData: any) => {
        const oldScenarioId = nodeData.scenarioId;
        const newScenarioId = scenarioIdMap[oldScenarioId];
        
        if (!newScenarioId) return;
        
        const newNodeId = nodeStore.createNode(
          nodeData.type,
          nodeData.position,
          nodeData.data,
          newScenarioId
        );
        
        nodeIdMap[nodeData.id] = newNodeId;
        
        // Restore plugin if applicable
        if (nodeData.data.pluginId && data.plugins[nodeData.data.pluginId]) {
          const pluginId = nodeData.data.pluginId;
          
          if (pluginStore.plugins[pluginId]) {
            nodeStore.assignPluginToNode(
              newNodeId, 
              pluginId, 
              nodeData.data.pluginConfig
            );
            
            // Activate plugin if not already active
            if (!pluginStore.isPluginActive(pluginId)) {
              pluginStore.activatePlugin(pluginId);
            }
            
            // Update plugin config if available
            const pluginConfigData = data.plugins[pluginId]?.config;
            if (pluginConfigData) {
              pluginStore.updatePluginConfig(pluginId, pluginConfigData);
            }
          }
        }
      });
      
      // Import edges
      Object.values(data.edges).forEach((edgeData: any) => {
        const sourceNodeId = nodeIdMap[edgeData.source];
        const targetNodeId = nodeIdMap[edgeData.target];
        
        if (!sourceNodeId || !targetNodeId) return;
        
        const newEdgeId = scenarioStore.createEdge(
          sourceNodeId,
          targetNodeId,
          edgeData.sourceHandle,
          edgeData.targetHandle,
          edgeData.label
        );
        
        edgeIdMap[edgeData.id] = newEdgeId;
        
        // Add edge to appropriate scenario
        Object.entries(scenarioIdMap).forEach(([oldScenarioId, newScenarioId]) => {
          const oldScenario = data.scenarios[oldScenarioId];
          if (oldScenario && oldScenario.edgeIds.includes(edgeData.id)) {
            scenarioStore.addEdgeToScenario(newScenarioId, newEdgeId);
          }
        });
      });
      
      // Set current workspace to the imported one
      workspaceStore.setCurrentWorkspace(newWorkspaceId);
      
      // Set current scenario if we have any
      const newScenarioIds = Object.values(scenarioIdMap);
      if (newScenarioIds.length > 0) {
        scenarioStore.setCurrentScenario(newScenarioIds[0] as string);
      }
      
      set({ 
        isImporting: false, 
        lastImportedAt: new Date().toISOString() 
      });
    } catch (error) {
      set({
        isImporting: false,
        importError: error instanceof Error ? error.message : String(error)
      });
    }
  },
  
  resetErrors: () => {
    set({ exportError: null, importError: null });
  }
}));