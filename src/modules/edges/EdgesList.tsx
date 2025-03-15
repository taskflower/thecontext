import React from 'react';
import { useDialogState } from "@/hooks";
import { useAppStore } from '../store';
import { CardPanel, Dialog, ItemList } from "@/components/APPUI";
import { Link } from "lucide-react";
import { GraphEdge } from "../types";

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
    <>
      <CardPanel title="Edges" onAddClick={() => {
        if (nodes.length < 2) {
          alert("Need at least 2 nodes to create an edge");
          return;
        }
        openDialog({ 
          source: nodes[0]?.id || '', 
          target: nodes[1]?.id || '', 
          label: '' 
        });
      }}>
        <ItemList<GraphEdge> 
          items={edges}
          selected={selected.edge || ""}
          onClick={handleEdgeClick}
          onDelete={deleteEdge}
          renderItem={(item) => (
            <div className={`p-2 font-medium flex items-center ${item.id === selected.edge ? 'text-blue-500' : ''}`}>
              {getNodeLabel(item.source)}
              <Link className={`h-3 w-3 mx-1 ${item.id === selected.edge ? 'text-blue-500' : ''}`} />
              {getNodeLabel(item.target)}
              {item.label && <span className={`ml-1 ${item.id === selected.edge ? 'text-blue-400' : 'text-gray-500'}`}>({item.label})</span>}
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