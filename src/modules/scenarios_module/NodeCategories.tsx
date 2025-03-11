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
} from "lucide-react";

const NodeCategories: React.FC = () => {
  const nodes = useScenarioStore((state) => state.nodes);
  const edges = useScenarioStore((state) => state.edges);
  const categories = useScenarioStore((state) => state.categories);
  const nodeResponses = useScenarioStore((state) => state.nodeResponses);
  const removeNode = useScenarioStore((state) => state.removeNode);

  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  // State for expanded responses
  const [expandedResponses, setExpandedResponses] = useState<Record<string, boolean>>({});

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

  const toggleResponse = (nodeId: string) => {
    setExpandedResponses((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const getNodeConnections = (nodeId: string) => {
    const outgoing = edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
    const incoming = edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source);
    return { outgoing, incoming };
  };

  const handlePreview = (id: string) => console.log("Preview node:", id);
  const handleExecute = (id: string) => console.log("Execute node:", id);

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
            const isResponseExpanded = expandedResponses[id] || false;

            return (
              <React.Fragment key={id}>
                <TableRow className="hover:bg-slate-50">
                  <TableCell className="font-medium"><div className="min-w-72 grid truncate">{id}</div></TableCell>
                  <TableCell>
                    {hasResponse ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                        Completed
                      </Badge>
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
                {hasResponse && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0 border-t-0">
                      <div className="px-4 pb-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-6 mb-1"
                          onClick={() => toggleResponse(id)}
                        >
                          {isResponseExpanded ? (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-1" />
                          )}
                          <span className="text-xs font-medium text-slate-600">Response</span>
                        </Button>
                        
                        {isResponseExpanded && (
                          <div className="bg-slate-50 p-3 rounded-md border text-sm text-slate-700">
                            {nodeResponses[id].length > 200
                              ? nodeResponses[id].substring(0, 200) + "..."
                              : nodeResponses[id]}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
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

  return <div>{categories.map((category) => renderCategoryFolder(category))}</div>;
};

export default NodeCategories;