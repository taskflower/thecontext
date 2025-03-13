// src/components/workspace/WorkspaceExportImport.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadCloud, UploadCloud, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useScenarioStore } from '@/stores/scenarioStore';
import { useNodeStore } from '@/stores/nodeStore';
import { usePluginStore } from '@/stores/pluginStore';

export const WorkspaceExportImport: React.FC = () => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  
  const workspaceStore = useWorkspaceStore();
  const scenarioStore = useScenarioStore();
  const nodeStore = useNodeStore();
  const pluginStore = usePluginStore();
  
  const currentWorkspace = workspaceStore.getCurrentWorkspace();
  
  const handleExport = () => {
    if (!currentWorkspace) return;
    
    // Create export object with all related data
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      workspace: currentWorkspace,
      scenarios: {},
      nodes: {},
      edges: {},
      plugins: {}
    };
    
    // Get all scenarios for this workspace
    const scenarioIds = currentWorkspace.scenarioIds || [];
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
    
    // Create JSON file and download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `workspace_${currentWorkspace.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importData = JSON.parse(content);
          
          importWorkspace(importData);
        } catch (error) {
          setImportError(`Failed to parse import file: ${error instanceof Error ? error.message : String(error)}`);
          setImportSuccess(null);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  const importWorkspace = (data: any) => {
    try {
      // Validate import data
      if (!data.workspace || !data.version) {
        throw new Error('Invalid import file format');
      }
      
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
      
      setImportSuccess(`Successfully imported workspace: ${workspaceName}`);
      setImportError(null);
    } catch (error) {
      setImportError(`Error importing workspace: ${error instanceof Error ? error.message : String(error)}`);
      setImportSuccess(null);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Export & Import</CardTitle>
        <CardDescription>
          Export your current workspace or import one from a file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleExport}
            disabled={!currentWorkspace}
            className="flex items-center gap-2"
          >
            <DownloadCloud className="h-4 w-4" />
            Export Workspace
          </Button>
          
          <Button
            onClick={handleImportClick}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UploadCloud className="h-4 w-4" />
            Import Workspace
          </Button>
        </div>
        
        {importError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{importError}</AlertDescription>
          </Alert>
        )}
        
        {importSuccess && (
          <Alert className="mt-4 bg-green-50">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{importSuccess}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};