// src/modules/scenarios_module/EdgeConnector.tsx
import React, { useState } from 'react';
import { useScenarioStore } from '../scenarioStore';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowRightIcon } from "lucide-react";


const EdgeConnector: React.FC = () => {
  const { nodes, addEdge } = useScenarioStore();
  const [edgeForm, setEdgeForm] = useState({ source: '', target: '' });

  const handleAddEdge = () => {
    if (edgeForm.source && edgeForm.target && edgeForm.source !== edgeForm.target) {
      addEdge(edgeForm.source, edgeForm.target);
      setEdgeForm({ source: '', target: '' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-end">
        <div className="lg:col-span-3 space-y-1.5">
          <Label htmlFor="source-node">Source Node</Label>
          <Select
            value={edgeForm.source}
            onValueChange={(value) => setEdgeForm({ ...edgeForm, source: value })}
          >
            <SelectTrigger id="source-node" className="w-full">
              <SelectValue placeholder="Select source node" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(nodes).length === 0 ? (
                <SelectItem value="no-nodes" disabled>No nodes available</SelectItem>
              ) : (
                Object.keys(nodes).map(id => (
                  <SelectItem key={`src-${id}`} value={id}>{id}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="lg:col-span-1 flex justify-center items-center">
          <ArrowRightIcon className="hidden lg:block h-5 w-5 text-slate-400" />
        </div>
        
        <div className="lg:col-span-3 space-y-1.5">
          <Label htmlFor="target-node">Target Node</Label>
          <Select
            value={edgeForm.target}
            onValueChange={(value) => setEdgeForm({ ...edgeForm, target: value })}
          >
            <SelectTrigger id="target-node" className="w-full">
              <SelectValue placeholder="Select target node" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(nodes).length === 0 ? (
                <SelectItem value="no-nodes" disabled>No nodes available</SelectItem>
              ) : (
                Object.keys(nodes).map(id => (
                  <SelectItem key={`tgt-${id}`} value={id}>{id}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        onClick={handleAddEdge}
        disabled={!edgeForm.source || !edgeForm.target || edgeForm.source === edgeForm.target}
        className="w-full"
      >
        <ArrowRightIcon className="h-4 w-4 mr-2" />
        Connect Nodes
      </Button>
    </div>
  );
};

export default EdgeConnector;