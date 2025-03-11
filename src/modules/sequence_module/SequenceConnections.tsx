// src/modules/sequence_module/SequenceConnections.tsx
import React from 'react';
import { useScenarioStore } from '../scenarios_module/scenarioStore';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, Trash2 } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";

const SequenceConnections: React.FC = () => {
  const { edges, removeEdge } = useScenarioStore();

  if (edges.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        No connections defined yet. Connect nodes to create a sequence.
      </div>
    );
  }

  return (
    <ScrollArea className={edges.length > 6 ? "h-60" : undefined}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-0.5">
        {edges.map((edge, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center bg-white p-3 rounded-md border hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 border-blue-200">
                {edge.source}
              </Badge>
              <ArrowRightIcon className="h-4 w-4 text-slate-400" />
              <Badge variant="outline" className="bg-green-50 border-green-200">
                {edge.target}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeEdge(edge.source, edge.target)} 
              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SequenceConnections;