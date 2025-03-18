// src/modules/flowPlayer/components/MessageProcessors/AssistantMessageProcessor.tsx
import React, { useEffect, useState, useRef } from "react";
import { useFlowPlayer } from "../../hooks/useFlowPlayer";
import { Card, CardContent } from "@/components/ui/card";

export const AssistantMessageProcessor: React.FC = () => {
  const { currentNode } = useFlowPlayer();
  const [isProcessing] = useState(false);
  const prevNodeIdRef = useRef<string | null>(null);

  // Process message when current node changes
  useEffect(() => {
    if (!currentNode) {
      return;
    }

    // Check if node ID changed
    if (currentNode.id !== prevNodeIdRef.current) {
      prevNodeIdRef.current = currentNode.id;
    }
  }, [currentNode]);

  if (!currentNode) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-2 font-medium text-sm">Assistant Response</div>
        <div className="min-h-32 bg-muted/20 p-3 rounded-md whitespace-pre-wrap">
          {isProcessing ? (
            <div className="flex items-center justify-center h-24">
              <span className="ml-2">Processing...</span>
            </div>
          ) : (
            <span className="text-muted-foreground">No content to display</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
