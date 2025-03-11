/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/Dashboard.tsx
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Folder, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";


import GraphVisualization from './graph_vizualizer/GraphVisualization';
import TemplateManagement from './templates_module/TemplateManagement';
import { Template } from './templates_module/templateStore';
import SequenceExecutor from './sequence_module/SequenceExecutor';
import SchemaManagement from './scenarios_module/SchemaManagement';
import { useScenarioStore } from './scenarios_module/scenarioStore';
import NodeCategories from './scenarios_module/NodeCategories';
import UsageInfo from './UsageInfo';
import NodeConnectionsContainer from './scenarios_module/editor/NodeConnectionsContainer';


const Dashboard: React.FC = () => {
  const { nodes, nodeResponses, removeNodeResponse, addNodeResponse } = useScenarioStore();
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [isExecutingNode, setIsExecutingNode] = useState<boolean>(false);
  const [currentNodeResponse, setCurrentNodeResponse] = useState<string>('');

  const handleNodeClick = (id: string) => {
    const node = nodes[id];
    if (node.category === 'template' && node.templateData) {
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
      const parts = variable.split('.');
      if (parts.length === 2 && parts[1] === 'response') {
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
    setCurrentNodeResponse('');
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4 sm:px-6">
      <div className="space-y-6">
        

        <UsageInfo />

        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6 mt-6">
            {/* Node and Connection Builder Section (now a separate component) */}
            <NodeConnectionsContainer />

            {/* Graph Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Scenario Visualization
                </CardTitle>
                <CardDescription>Interactive graph of your scenario</CardDescription>
              </CardHeader>
              <CardContent className="p-0 min-h-80">
              {Object.keys(nodes).length === 0 ? (
                  <div className="flex items-center justify-center h-80 text-slate-500">
                    Add nodes to see visualization
                  </div>
                ) : (
                  <GraphVisualization onNodeClick={handleNodeClick} />
                )}
              </CardContent>
            </Card>

            {/* Category View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Scenario Structure
                </CardTitle>
                <CardDescription>Nodes organized by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg">
                  {Object.keys(nodes).length === 0 ? (
                    <div className="text-slate-500 text-center py-8">
                      Add nodes to see the structure
                    </div>
                  ) : (
                    <NodeCategories />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Management</CardTitle>
                <CardDescription>Create, save, and use templates</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Execution Tab */}
          <TabsContent value="execution" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sequence Execution</CardTitle>
                <CardDescription>Run your prompt sequence</CardDescription>
              </CardHeader>
              <CardContent>
                <SequenceExecutor />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saved Responses</CardTitle>
                <CardDescription>View and manage responses from execution</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(nodeResponses).length === 0 ? (
                  <div className="text-slate-500 text-center py-8">
                    No saved responses yet
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-4 p-1">
                      {Object.entries(nodeResponses).map(([nodeId, response]) => (
                        <div key={nodeId} className="bg-white p-4 rounded-lg border">
                          <div className="flex justify-between mb-2 items-center">
                            <h3 className="font-medium flex items-center">
                              <Badge variant="outline" className="mr-2">{nodeId}</Badge>
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
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Schema Management</CardTitle>
                <CardDescription>Export and import scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <SchemaManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview node modal */}
      {previewNodeId && (
        <Dialog open={!!previewNodeId} onOpenChange={(open) => !open && closePreview()}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Node Preview: {previewNodeId}</DialogTitle>
              <DialogDescription>
                Category: <Badge variant="outline">{nodes[previewNodeId]?.category}</Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Prompt Content</Label>
                <div className="mt-1.5 bg-slate-50 p-4 rounded-md border whitespace-pre-wrap">
                  {processTemplateString(nodes[previewNodeId]?.message || '')}
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closePreview}>Close</Button>
              <Button onClick={() => executeNode(previewNodeId)}>
                <Play className="h-4 w-4 mr-2" /> Execute Node
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Node execution dialog */}
      {isExecutingNode && previewNodeId && (
        <Dialog open={isExecutingNode} onOpenChange={(open) => !open && setIsExecutingNode(false)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Execute Node: {previewNodeId}</DialogTitle>
              <DialogDescription>
                Enter your response for this node (Dialor from dashboard)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Prompt Content</Label>
                <div className="mt-1.5 bg-slate-50 p-4 rounded-md border whitespace-pre-wrap">
                  {processTemplateString(nodes[previewNodeId]?.message || '')}
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExecutingNode(false)}>Cancel</Button>
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Template modal */}
      {activeTemplate && (
        <Dialog open={!!activeTemplate} onOpenChange={(open) => !open && setActiveTemplate(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Template: {activeTemplate.name}</DialogTitle>
              <DialogDescription>
                {activeTemplate.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                  {Object.entries(activeTemplate.nodes).map(([id, node]: [string, any]) => (
                    <div key={id} className="border rounded-md p-3 bg-white">
                      <div className="font-medium">{id}</div>
                      <div className="text-xs text-slate-500">Category: {node.category}</div>
                      <div className="text-sm mt-1 line-clamp-2">
                        {node.message.substring(0, 100)}
                        {node.message.length > 100 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActiveTemplate(null)}>Cancel</Button>
              <Button onClick={() => {
                console.log('Starting template execution...');
                // Template execution logic here
                setActiveTemplate(null);
              }}>
                <Play className="h-4 w-4 mr-2" /> Execute Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;