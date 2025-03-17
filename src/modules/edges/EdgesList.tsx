import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { ItemList } from "@/components/APPUI";
import { ArrowRightCircle, Plus, MoreHorizontal, Search } from "lucide-react";
import { GraphEdge } from "../types";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { useDialogManager } from '@/hooks/useDialogManager';

export const EdgesList: React.FC = () => {
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const deleteEdge = useAppStore(state => state.deleteEdge);
  const addEdge = useAppStore(state => state.addEdge);
  const selectEdge = useAppStore(state => state.selectEdge);
  const selected = useAppStore(state => state.selected);
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);

  const scenario = getCurrentScenario();
  const edges = scenario?.edges || [];
  const nodes = scenario?.children || [];

  // Use the new dialog manager hook
  const { createDialog } = useDialogManager();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered edges based on search term
  const filteredEdges = useMemo(() => {
    return edges.filter(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      const sourceLabel = sourceNode?.label.toLowerCase() || '';
      const targetLabel = targetNode?.label.toLowerCase() || '';
      const edgeLabel = (edge.label || '').toLowerCase();

      return (
        sourceLabel.includes(searchTerm.toLowerCase()) ||
        targetLabel.includes(searchTerm.toLowerCase()) ||
        edgeLabel.includes(searchTerm.toLowerCase())
      );
    });
  }, [edges, nodes, searchTerm]);

  const handleAddEdge = () => {
    if (nodes.length < 2) {
      alert("Need at least 2 nodes to create an edge");
      return;
    }

    createDialog(
      "New Edge",
      [
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
      ],
      (data) => {
        if (data.source && data.target) {
          addEdge({
            source: String(data.source),
            target: String(data.target),
            label: data.label ? String(data.label) : undefined
          });
        }
      },
      {
        confirmText: "Add",
        initialData: {
          source: nodes[0]?.id || '',
          target: nodes[1]?.id || '',
          label: ''
        }
      }
    );
  };

  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.label : nodeId;
  };

  return (
    <div className="flex flex-col h-full">
      {/* List Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Edges</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddEdge}
          className="h-7 w-7 rounded-full hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Input */}
      <div className="px-3 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search edges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Edges List */}
      <div className="flex-1 overflow-auto">
        <ItemList<GraphEdge>
          items={filteredEdges}
          selected={selected.edge || ""}
          onClick={selectEdge}
          onDelete={deleteEdge}
          renderItem={(item) => (
            <div className="text-xs font-medium flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
                <span className="truncate max-w-24">{getNodeLabel(item.source)}</span>
                <ArrowRightCircle className="h-3 w-3 mx-0.5 shrink-0" />
                <span className="truncate max-w-24">{getNodeLabel(item.target)}</span>
                {item.label && (
                  <Badge variant="outline" className="ml-1.5 text-[0.65rem] px-1 py-0 h-4">
                    {item.label}
                  </Badge>
                )}
              </div>
              {/* Placeholder for potential future edit button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 shrink-0"
                title="Edit edge"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  // Future edit functionality 
                }}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          height="h-full"
        />
      </div>
    </div>
  );
};