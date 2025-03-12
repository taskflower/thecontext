// src/modules/Dashboard.tsx
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Folder, Trash2, Puzzle, Globe, Layers } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

import GraphVisualization from "./graph_vizualizer/GraphVisualization";
import TemplateManagement from "./templates_module/TemplateManagement";
import { Template } from "./templates_module/templateStore";
import SequenceExecutor from "./sequence_module/SequenceExecutor";
import ScenarioManagement from "./scenarios_module/ScenarioManagement";
import { useScenarioStore } from "./scenarios_module/scenarioStore";
import NodeCategories from "./scenarios_module/editor/NodeCategories";
import UsageInfo from "./UsageInfo";
import NodeConnectionsContainer from "./scenarios_module/editor/NodeConnectionsContainer";
import PluginsTab from "./plugins_system/PluginsTab";
import MCard from "@/components/MCard";
import MDialog from "@/components/MDialog";

import { useScenariosMultiStore } from "./scenarios_module/scenariosMultiStore";
import { useWorkspaceStore } from "./workspace_module/workspaceStore";
import WorkspaceManagement from "./workspace_module/WorkspaceManagement";
import WorkspaceScenarios from "./workspace_module/WorkspaceScenarios";

const Dashboard: React.FC = () => {
  const { nodes, nodeResponses, removeNodeResponse, addNodeResponse } =
    useScenarioStore();
  const { workspaces, currentWorkspaceId } = useWorkspaceStore();
  const { currentScenarioId } = useScenariosMultiStore();
  
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [isExecutingNode, setIsExecutingNode] = useState<boolean>(false);
  const [currentNodeResponse, setCurrentNodeResponse] = useState<string>("");



  const handleNodeClick = (id: string) => {
    const node = nodes[id];
    if (node.category === "template" && node.templateData) {
      setActiveTemplate(node.templateData);
    } else {
      setPreviewNodeId(id);
    }
  };

  const closePreview = () => {
    setPreviewNodeId(null);
  };

  const processTemplateString = (templateString: string) => {
    return templateString.replace(/\{\{([\w.]+)\}\}/g, (match, variable) => {
      const parts = variable.split(".");
      if (parts.length === 2 && parts[1] === "response") {
        const nodeId = parts[0];
        return nodeResponses[nodeId] || match;
      }
      return match;
    });
  };

  const executeNode = (nodeId: string) => {
    if (!nodeId) return;

    setIsExecutingNode(true);
    // Reset current response when executing a node
    setCurrentNodeResponse("");
  };

  const getCurrentContextInfo = () => {
    const workspace = currentWorkspaceId ? workspaces[currentWorkspaceId] : null;
    if (!workspace) return null;
    
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Globe className="h-4 w-4 text-blue-500" />
        <span>{workspace.name}</span>
        {currentScenarioId && (
          <>
            <span className="text-slate-400">/</span>
            <Layers className="h-4 w-4 text-green-500" />
            <span>{currentScenarioId}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4 sm:px-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <UsageInfo />
          {getCurrentContextInfo()}
        </div>

        <Tabs defaultValue="workspaces" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="workspaces">
              <Globe className="h-4 w-4 mr-2" />
              Workspaces
            </TabsTrigger>
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="plugins">
              <Puzzle className="h-4 w-4 mr-2" />
              Plugins
            </TabsTrigger>
          </TabsList>

          {/* Workspaces Tab */}
          <TabsContent value="workspaces" className="space-y-6 mt-6">
            <WorkspaceManagement />
            
            {/* Show scenarios for current workspace */}
            {currentWorkspaceId && (
              <WorkspaceScenarios workspaceId={currentWorkspaceId} />
            )}
          </TabsContent>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6 mt-6">
            {/* Workspace context badge */}
            {currentWorkspaceId && (
              <MCard
                title="Aktywny workspace"
                description="Kontekst workspace dostępny dla scenariusza"
              >
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(workspaces[currentWorkspaceId]?.context || {}).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="bg-blue-50 flex items-center gap-1">
                      <span className="font-medium">{key}:</span> 
                      <span>
                        {typeof value === 'string' 
                          ? value 
                          : (Array.isArray(value) 
                              ? `[${value.length}]` 
                              : JSON.stringify(value))}
                      </span>
                    </Badge>
                  ))}
                  {Object.keys(workspaces[currentWorkspaceId]?.context || {}).length === 0 && (
                    <div className="text-slate-500">
                      Brak kontekstu workspace. Możesz dodać kontekst w zakładce Workspaces.
                    </div>
                  )}
                </div>
              </MCard>
            )}
            
            {/* Node and Connection Builder Section */}
            <NodeConnectionsContainer />

            {/* Graph Visualization */}
            <MCard
              title="Scenario Visualization"
              description="Interactive graph of your scenario"
            >
              <div className="p-0 min-h-80">
                {Object.keys(nodes).length === 0 ? (
                  <div className="flex items-center justify-center h-80 text-slate-500">
                    Add nodes to see visualization
                  </div>
                ) : (
                  <GraphVisualization onNodeClick={handleNodeClick} />
                )}
              </div>
            </MCard>

            {/* Category View */}
            <MCard
              title={
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Scenario Structure
                </div>
              }
              description="Nodes organized by category"
            >
              <div className="bg-white rounded-lg">
                {Object.keys(nodes).length === 0 ? (
                  <div className="text-slate-500 text-center py-8">
                    Add nodes to see the structure
                  </div>
                ) : (
                  <NodeCategories />
                )}
              </div>
            </MCard>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6 mt-6">
            <MCard
              title="Template Management"
              description="Create, save, and use templates"
            >
              <TemplateManagement />
            </MCard>
          </TabsContent>

          {/* Execution Tab */}
          <TabsContent value="execution" className="space-y-6 mt-6">
            <MCard
              title="Sequence Execution"
              description="Run your prompt sequence"
            >
              <SequenceExecutor />
            </MCard>

            <MCard
              title="Saved Responses"
              description="View and manage responses from execution"
            >
              {Object.keys(nodeResponses).length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  No saved responses yet
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4 p-1">
                    {Object.entries(nodeResponses).map(
                      ([nodeId, response]) => (
                        <div
                          key={nodeId}
                          className="bg-white p-4 rounded-lg border"
                        >
                          <div className="flex justify-between mb-2 items-center">
                            <h3 className="font-medium flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {nodeId}
                              </Badge>
                              Node Response
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNodeResponse(nodeId)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-slate-500" />
                            </Button>
                          </div>
                          <div className="text-sm whitespace-pre-wrap bg-slate-50 p-3 rounded border">
                            {response}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea>
              )}
            </MCard>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6 mt-6">
            <MCard
              title="Scenario Management"
              description="Export and import scenarios"
            >
              <ScenarioManagement />
            </MCard>
          </TabsContent>

          {/* Plugins Tab */}
          <TabsContent value="plugins" className="space-y-6 mt-6">
            <PluginsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview node modal */}
      <MDialog
        title={`Node Preview: ${previewNodeId || ""}`}
        description={previewNodeId ? `Category: ${nodes[previewNodeId]?.category}` : ""}
        isOpen={!!previewNodeId}
        onOpenChange={(open) => !open && closePreview()}
        footer={
          <>
            <Button variant="outline" onClick={closePreview}>
              Close
            </Button>
            <Button onClick={() => executeNode(previewNodeId || "")}>
              <Play className="h-4 w-4 mr-2" /> Execute Node
            </Button>
          </>
        }
      >
        {previewNodeId && (
          <>
            <div>
              <Label>Prompt Content</Label>
                              <div className="mt-1.5 bg-slate-50 p-4 rounded-md border whitespace-pre-wrap">
                {processTemplateString(nodes[previewNodeId]?.message || "")}
              </div>
            </div>
            {nodeResponses[previewNodeId] && (
              <div>
                <Label>Saved Response</Label>
                <div className="mt-1.5 bg-green-50 p-4 rounded-md border whitespace-pre-wrap">
                  {nodeResponses[previewNodeId]}
                </div>
              </div>
            )}
          </>
        )}
      </MDialog>

      {/* Node execution dialog */}
      <MDialog
        title={`Execute Node: ${previewNodeId || ""}`}
        description="Enter your response for this node"
        isOpen={isExecutingNode && !!previewNodeId}
        onOpenChange={(open) => !open && setIsExecutingNode(false)}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsExecutingNode(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!currentNodeResponse.trim()}
              onClick={() => {
                if (previewNodeId && currentNodeResponse) {
                  addNodeResponse(previewNodeId, currentNodeResponse);
                  setIsExecutingNode(false);
                  closePreview();
                }
              }}
            >
              Save Response
            </Button>
          </>
        }
      >
        {previewNodeId && (
          <>
            <div>
              <Label>Prompt Content</Label>
              <div className="mt-1.5 bg-slate-50 p-4 rounded-md border whitespace-pre-wrap">
                {processTemplateString(nodes[previewNodeId]?.message || "")}
              </div>
            </div>
            <div>
              <Label>Your Response</Label>
              <Textarea
                className="mt-1.5 min-h-[120px]"
                placeholder="Enter your response..."
                value={currentNodeResponse}
                onChange={(e) => setCurrentNodeResponse(e.target.value)}
              />
            </div>
          </>
        )}
      </MDialog>

      {/* Template modal */}
      <MDialog
        title={`Template: ${activeTemplate?.name || ""}`}
        description={activeTemplate?.description || ""}
        isOpen={!!activeTemplate}
        onOpenChange={(open) => !open && setActiveTemplate(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setActiveTemplate(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                // Template execution logic here
                setActiveTemplate(null);
              }}
            >
              <Play className="h-4 w-4 mr-2" /> Execute Template
            </Button>
          </>
        }
      >
        {activeTemplate && (
          <>
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-blue-50">
                Nodes: {Object.keys(activeTemplate.nodes).length}
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                Connections: {activeTemplate.edges.length}
              </Badge>
            </div>

            <ScrollArea className="h-60">
              <div className="space-y-2">
                {Object.entries(activeTemplate.nodes).map(
                  ([id, node]) => (
                    <div key={id} className="border rounded-md p-3 bg-white">
                      <div className="font-medium">{id}</div>
                      <div className="text-xs text-slate-500">
                        Category: {node.category}
                      </div>
                      <div className="text-sm mt-1 line-clamp-2">
                        {node.message.substring(0, 100)}
                        {node.message.length > 100 ? "..." : ""}
                      </div>
                    </div>
                  )
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </MDialog>
    </div>
  );
};

export default Dashboard;