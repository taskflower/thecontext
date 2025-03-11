/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/scenarios_module/NodeCategories.tsx
import React, { useState, useEffect } from "react";
import { useScenarioStore } from "./scenarioStore";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronDown,
  Eye,
  Play,
  Trash2,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const NodeCategories: React.FC = () => {
  const { nodes, edges, categories, nodeResponses, removeNode, addNodeResponse } = useScenarioStore();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [responseDialogNodeId, setResponseDialogNodeId] = useState<string | null>(null);

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    categories.forEach((cat) => {
      initialExpanded[cat] = true;
    });
    setExpandedCategories(initialExpanded);
  }, [categories]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const viewNodeResponse = (nodeId: string) => {
    setResponseDialogNodeId(nodeId);
  };

  const getNodeConnections = (nodeId: string) => {
    const outgoing = edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
    const incoming = edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source);
    return { outgoing, incoming };
  };

  const handlePreview = (id: string) => {
    setPreviewNodeId(id);
  };

  const handleExecute = (id: string) => {
    setExecutingNodeId(id);
    setCurrentResponse('');
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

  const renderNodeTable = (categoryNodes: [string, any][]) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6">Node ID</TableHead>
            <TableHead className="w-1/6">Status</TableHead>
            <TableHead className="w-1/2">Connections</TableHead>
            <TableHead className="w-1/6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoryNodes.map(([id]) => {
            const { outgoing, incoming } = getNodeConnections(id);
            const hasResponse = nodeResponses[id] !== undefined;

            return (
              <TableRow key={id} className="hover:bg-slate-50">
                <TableCell className="font-medium"><div className="min-w-72 grid truncate">{id}</div></TableCell>
                <TableCell>
                  {hasResponse ? (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                        Completed
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 p-0 ml-1"
                        onClick={() => viewNodeResponse(id)}
                        title="View Response"
                      >
                        <MessageSquare className="h-4 w-4 text-green-700" />
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 flex-wrap">
                    {incoming.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          <ArrowLeft className="h-3 w-3 inline mr-1" />From:
                        </span>
                        {incoming.map((src, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-blue-50 border-blue-200 text-xs"
                          >
                            {src}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {outgoing.length > 0 && (
                      <div className="flex items-center gap-1 ml-2">
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          <ArrowRight className="h-3 w-3 inline mr-1" />To:
                        </span>
                        {outgoing.map((tgt, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-green-50 border-green-200 text-xs"
                          >
                            {tgt}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreview(id)}
                      className="h-8 w-8"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExecute(id)}
                      className="h-8 w-8"
                      title="Execute"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeNode(id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const renderCategoryFolder = (category: string) => {
    const isExpanded = expandedCategories[category] || false;
    const categoryNodes = Object.entries(nodes).filter(
      ([_, node]) => node.category === category
    );

    if (categoryNodes.length === 0) return null;

    return (
      <div key={category} className="mb-4">
        <div className="w-full border rounded-md overflow-hidden">
          <Button
            variant="ghost"
            className="flex items-center justify-between w-full bg-slate-100 px-4 py-2 rounded-t-md hover:bg-slate-200 h-auto"
            onClick={() => toggleCategory(category)}
          >
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-2 text-slate-500" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2 text-slate-500" />
              )}
              <span className="font-semibold">{category}</span>
            </div>
            <Badge variant="outline" className="ml-2">
              {categoryNodes.length}
            </Badge>
          </Button>
          
          {isExpanded && (
            <div className="bg-white">
              <div className="overflow-x-auto">
                {renderNodeTable(categoryNodes)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {categories.map((category) => renderCategoryFolder(category))}

      {/* Node Preview Dialog */}
      {previewNodeId && (
        <Dialog open={!!previewNodeId} onOpenChange={(open) => !open && setPreviewNodeId(null)}>
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
              <Button variant="outline" onClick={() => setPreviewNodeId(null)}>Close</Button>
              <Button onClick={() => {
                setPreviewNodeId(null);
                handleExecute(previewNodeId);
              }}>
                <Play className="h-4 w-4 mr-2" /> Execute Node
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Response View Dialog */}
      {responseDialogNodeId && (
        <Dialog open={!!responseDialogNodeId} onOpenChange={(open) => !open && setResponseDialogNodeId(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Node Response: {responseDialogNodeId}</DialogTitle>
              <DialogDescription>
                Category: <Badge variant="outline">{nodes[responseDialogNodeId]?.category}</Badge>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Response Content</Label>
                <div className="mt-1.5 bg-green-50 p-4 rounded-md border whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {nodeResponses[responseDialogNodeId]}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResponseDialogNodeId(null)}>Close</Button>
              <Button onClick={() => {
                setResponseDialogNodeId(null);
                handleExecute(responseDialogNodeId);
              }}>
                <Play className="h-4 w-4 mr-2" /> Re-Execute Node
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Node Execution Dialog */}
      {executingNodeId && (
        <Dialog open={!!executingNodeId} onOpenChange={(open) => !open && setExecutingNodeId(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Execute Node: {executingNodeId}</DialogTitle>
              <DialogDescription>
                Enter your response for this node
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Prompt Content</Label>
                <div className="mt-1.5 bg-slate-50 p-4 rounded-md border whitespace-pre-wrap">
                  {processTemplateString(nodes[executingNodeId]?.message || '')}
                </div>
              </div>
              <div>
                <Label>Your Response</Label>
                <Textarea 
                  className="mt-1.5 min-h-[120px]" 
                  placeholder="Enter your response..."
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExecutingNodeId(null)}>Cancel</Button>
              <Button 
                disabled={!currentResponse.trim()}
                onClick={() => {
                  if (executingNodeId && currentResponse) {
                    addNodeResponse(executingNodeId, currentResponse);
                    setExecutingNodeId(null);
                  }
                }}
              >
                Save Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NodeCategories;