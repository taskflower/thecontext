// src/modules/edges/EdgesList.tsx
import React from 'react';
import { useDialogState } from "@/hooks";
import { useAppStore } from '../store';
import { Dialog, ItemList } from "@/components/APPUI";
import { ArrowRightCircle, Plus } from "lucide-react";
import { GraphEdge } from "../types";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = 
    useDialogState({ source: '', target: '', label: '' });
  
  const handleAdd = () => {
    if (formData.source && formData.target) {
      addEdge({
        source: String(formData.source),
        target: String(formData.target),
        label: formData.label ? String(formData.label) : undefined
      });
      setIsOpen(false);
    }
  };
  
  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.label : nodeId;
  };
  
  const handleEdgeClick = (edgeId: string) => {
    // Call the selectEdge method to update store
    selectEdge(edgeId);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Edges</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            if (nodes.length < 2) {
              alert("Need at least 2 nodes to create an edge");
              return;
            }
            openDialog({ 
              source: nodes[0]?.id || '', 
              target: nodes[1]?.id || '', 
              label: '' 
            });
          }} 
          className="h-7 w-7 rounded-full hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <ItemList<GraphEdge> 
          items={edges}
          selected={selected.edge || ""}
          onClick={handleEdgeClick}
          onDelete={deleteEdge}
          renderItem={(item) => (
            <div className="p-2 font-medium flex items-center gap-1.5">
              <span className="truncate">{getNodeLabel(item.source)}</span>
              <ArrowRightCircle className="h-3 w-3 mx-0.5 shrink-0" />
              <span className="truncate">{getNodeLabel(item.target)}</span>
              {item.label && (
                <Badge variant="outline" className="ml-1.5 text-xs font-normal">
                  {item.label}
                </Badge>
              )}
            </div>
          )}
          height="h-full"
        />
      </div>
      
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
    </div>
  );
};