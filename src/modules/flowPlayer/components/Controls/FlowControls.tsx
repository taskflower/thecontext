// src/modules/flowPlayer/components/Controls/FlowControls.tsx
import React from "react";
import { useFlowPlayer } from "../../hooks/useFlowPlayer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const FlowControls: React.FC = () => {
  const { 
    currentNode, 
    currentNodeIndex, 
    flowPath,
    nextNode, 
    previousNode,
    resetFlow
  } = useFlowPlayer();
  
  // Check navigation state
  const isFirst = currentNodeIndex === 0;
  const isLast = currentNodeIndex === flowPath.length - 1;
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFlow}
              disabled={!currentNode}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {currentNode ? (
                <>Node {currentNodeIndex + 1} of {flowPath.length}</>
              ) : (
                <>Select a flow to start</>
              )}
            </div>
            
            <div className="space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousNode}
                disabled={!currentNode || isFirst}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={nextNode}
                disabled={!currentNode || isLast}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};